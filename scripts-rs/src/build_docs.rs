use std::collections::{HashMap};
use std::fs;
use std::path::Path;
use chrono;
use regex::Regex;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use crate::core::{Logger, Paths};
use crate::diagnostics::*;
use crate::plugins::*;
use crate::compiler::*;
use serde_json::json;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocEntry {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub sidebar_label: String,
    pub sidebar_position: usize,
    pub category: String,
    pub original_category: Option<String>,
    pub description: String,
    pub content: String,
    pub raw_content: String,
    pub toc: Vec<TocItem>,
    pub date: Option<String>,
    pub author: Option<String>,
    pub tags: Option<Vec<String>>,
    pub section: String,
    pub metadata: HashMap<String, Value>,
    pub ast: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TocItem {
    pub value: String,
    pub id: String,
    pub level: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SidebarItem {
    #[serde(rename = "type")]
    pub r#type: String, // "doc" or "category"
    pub id: String,
    pub label: String,
    pub slug: String,
    pub category: Option<String>,
    pub date: Option<String>,
    pub items: Option<Vec<SidebarItem>>,
}

pub fn build_docs(paths: &Paths, logger: &Logger) -> anyhow::Result<()> {
    let config = CompilerConfig {
        docs_dir: paths.root.join("docs").to_string_lossy().to_string(),
        output_dir: paths.root.join("src").join("generated").to_string_lossy().to_string(),
        site_url: "https://your-docs-site.com".to_string(), // TODO: config
    };
    let container = CompilerContainer::new(config, None);
    
    let mut compiler = DocumentationCompiler::new(container);
    
    // Add middlewares in order
    compiler.use_middleware(Box::new(AdmonitionPlugin));
    compiler.use_middleware(Box::new(MathPlugin));
    compiler.use_middleware(Box::new(HighlightMiddleware));
    compiler.use_middleware(Box::new(MermaidMiddleware));
    compiler.use_middleware(Box::new(MermaidPlugin));
    compiler.use_middleware(Box::new(ValidationMiddleware));
    
    compiler.compile()?;

    // SEO and other post-compile tasks
    let all_docs: Vec<DocEntry> = compiler.units.iter().map(|u| {
        let meta = u.metadata.as_ref().expect("Metadata missing for unit");
        DocEntry {
            id: u.id.to_string(),
            slug: meta.slug.to_string(),
            title: meta.title.to_string(),
            sidebar_label: meta.sidebar_label.to_string(),
            sidebar_position: meta.sidebar_position,
            category: meta.category.to_string(),
            original_category: meta.original_category.as_ref().map(|s| s.to_string()),
            description: meta.description.to_string(),
            content: u.html.clone().unwrap_or_default(),
            raw_content: u.clean_content.clone(),
            toc: u.toc.clone().unwrap_or_default(),
            date: meta.date.as_ref().map(|s| s.to_string()),
            author: meta.author.as_ref().map(|s| s.to_string()),
            tags: meta.tags.as_ref().map(|t| t.iter().map(|s| s.to_string()).collect()),
            section: u.section.to_string(),
            metadata: meta.custom.iter().map(|(k, v)| (k.to_string(), v.clone())).collect(),
            ast: u.ast.clone().unwrap_or(json!([])),
        }
    }).collect();

    generate_seo_assets(&paths.root, &all_docs)?;

    logger.raw(&format!("💾 Written to {}", compiler.container.config.output_dir));
    logger.raw("✨ Done!");

    Ok(())
}

pub fn generate_seo_assets(root: &Path, docs: &[DocEntry]) -> anyhow::Result<()> {
    let site_url = "https://your-docs-site.com"; // Should probably be in a config file
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();

    // Sitemap
    let mut sitemap_xml = String::from(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
"#,
    );

    // Homepage
    sitemap_xml.push_str(&format!(
        r#"  <url>
    <loc>{}/</loc>
    <lastmod>{}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
"#,
        site_url, today
    ));

    // Docs
    for d in docs {
        let url = format!("{}/docs/{}", site_url, d.slug);
        let freq = "monthly";
        let prio = "0.9";

        sitemap_xml.push_str(&format!(
            r#"  <url>
    <loc>{}</loc>
    <lastmod>{}</lastmod>
    <changefreq>{}</changefreq>
    <priority>{}</priority>
  </url>
"#,
            url, today, freq, prio
        ));
    }
    sitemap_xml.push_str("</urlset>\n");
    fs::write(root.join("sitemap.xml"), sitemap_xml)?;

    // Robots.txt
    let robots_txt = format!(
        "# robots.txt — Allow all crawlers\nUser-agent: *\nAllow: /\n\n# Sitemap location\nSitemap: {}/sitemap.xml\n\n# Crawl delay (optional, polite)\nCrawl-delay: 1\n",
        site_url
    );
    fs::write(root.join("robots.txt"), robots_txt)?;

    Ok(())
}

#[allow(unused_variables)]
pub fn scan_md_files(
    base_dir: &Path,
    section: &str,
    diags: &mut Diagnostics,
) -> anyhow::Result<Vec<DocEntry>> {
    // Legacy function kept for compatibility if needed, but the compiler handles scanning now
    Ok(Vec::new())
}

pub fn parse_frontmatter(md: &str) -> (HashMap<String, Value>, String) {
    let re = Regex::new(r"(?m)^---\s*$\n?([\s\S]*?)^---\s*$\n?([\s\S]*)$").unwrap();
    if let Some(caps) = re.captures(md) {
        let fm_text = &caps[1];
        let content = &caps[2];
        let mut fm = HashMap::new();

        let mut current_key: Option<String> = None;
        let mut current_list: Vec<String> = Vec::new();

        for line in fm_text.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }

            if let Some(stripped) = trimmed.strip_prefix("- ") {
                if let Some(_key) = &current_key {
                    let val = stripped
                        .trim()
                        .trim_matches('\"')
                        .trim_matches('\'')
                        .to_string();
                    current_list.push(val);
                }
                continue;
            }

            if let Some(idx) = line.find(':') {
                if let Some(key) = current_key.take().filter(|_| !current_list.is_empty()) {
                    fm.insert(
                        key,
                        Value::Array(current_list.drain(..).map(Value::String).collect()),
                    );
                }

                let key = line[..idx].trim().to_string();
                let val = line[idx + 1..].trim();

                if val.is_empty() {
                    current_key = Some(key);
                } else if val.starts_with('[') && val.ends_with(']') {
                    if let Ok(json_val) = serde_json::from_str::<Value>(val) {
                        fm.insert(key, json_val);
                    } else {
                        fm.insert(key, Value::String(val.to_string()));
                    }
                } else if let Ok(n) = val.parse::<u64>() {
                    fm.insert(key, Value::Number(serde_json::Number::from(n)));
                } else if val.to_lowercase() == "true" || val.to_lowercase() == "false" {
                    fm.insert(key, Value::Bool(val.to_lowercase() == "true"));
                } else {
                    fm.insert(
                        key,
                        Value::String(val.trim_matches('\"').trim_matches('\'').to_string()),
                    );
                }
            } else if let Some(_) = &current_key {
                current_list.push(trimmed.to_string());
            }
        }

        if let Some(key) = current_key.filter(|_| !current_list.is_empty()) {
            fm.insert(
                key,
                Value::Array(current_list.drain(..).map(Value::String).collect()),
            );
        }

        (fm, content.to_string())
    } else {
        (HashMap::new(), md.to_string())
    }
}

pub fn slugify_heading(text: &str) -> String {
    let lower = text.to_lowercase().trim().to_string();

    // Special cases for common technical terms
    let mut result = lower
        .replace("c++", "c-plus-plus")
        .replace("c#", "c-sharp")
        .replace(".net", "net");

    result = result
        .chars()
        .map(|c| {
            if c.is_alphanumeric() || c == ' ' || c == '-' {
                c
            } else {
                ' '
            }
        })
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join("-")
        .trim_matches('-')
        .to_string();

    result
}

pub fn extract_toc(content: &str) -> Vec<TocItem> {
    let mut toc = Vec::new();
    let re = Regex::new(r"(?m)^(#{2,3})\s+(.+)$").unwrap();
    for cap in re.captures_iter(content) {
        let level = cap[1].len();
        let value = cap[2].to_string();
        let id = slugify_heading(&value);
        toc.push(TocItem { value, id, level });
    }
    toc
}

pub fn build_sidebar_from_json(docs: &[Value]) -> Vec<SidebarItem> {
    let mut cat_order: Vec<String> = Vec::new();
    let mut cat_prefixes: HashMap<String, usize> = HashMap::new();
    let mut grouped: HashMap<String, Vec<Value>> = HashMap::new();
    let mut uncategorized: Vec<Value> = Vec::new();

    let re_prefix = Regex::new(r"^(\d{2})").unwrap();

    for d in docs {
        let category = d["category"].as_str().unwrap_or("");
        if !category.is_empty() {
            if !grouped.contains_key(category) {
                grouped.insert(category.to_string(), Vec::new());
                cat_order.push(category.to_string());
                
                let original_category = d["originalCategory"].as_str().unwrap_or("");
                if !original_category.is_empty() {
                    if let Some(caps) = re_prefix.captures(original_category) {
                        cat_prefixes.insert(category.to_string(), caps[1].parse().unwrap_or(999));
                    } else {
                        cat_prefixes.insert(category.to_string(), 999);
                    }
                } else {
                    cat_prefixes.insert(category.to_string(), 999);
                }
            }
            grouped.get_mut(category).unwrap().push(d.clone());
        } else {
            uncategorized.push(d.clone());
        }
    }

    let mut sidebar = Vec::new();

    // Add welcome page first
    if let Some(welcome) = docs.iter().find(|d| d["slug"] == "welcome") {
        sidebar.push(SidebarItem {
            r#type: "doc".to_string(),
            id: welcome["id"].as_str().unwrap().to_string(),
            label: welcome["sidebarLabel"].as_str().unwrap_or(welcome["title"].as_str().unwrap_or("Welcome")).to_string(),
            slug: welcome["slug"].as_str().unwrap().to_string(),
            category: None,
            date: welcome["date"].as_str().map(|s| s.to_string()),
            items: None,
        });
    }

    // Uncategorized
    uncategorized.sort_by_key(|d| d["sidebarPosition"].as_u64().unwrap_or(999));
    for d in uncategorized {
        if d["slug"] == "welcome" { continue; }
        sidebar.push(SidebarItem {
            r#type: "doc".to_string(),
            id: d["id"].as_str().unwrap().to_string(),
            label: d["sidebarLabel"].as_str().unwrap_or(d["title"].as_str().unwrap_or("")).to_string(),
            slug: d["slug"].as_str().unwrap().to_string(),
            category: None,
            date: d["date"].as_str().map(|s| s.to_string()),
            items: None,
        });
    }

    // Categories
    cat_order.sort_by_key(|c| cat_prefixes.get(c).unwrap_or(&999));

    for cat in cat_order {
        let mut items = grouped.get(&cat).unwrap().clone();
        items.sort_by_key(|d| d["sidebarPosition"].as_u64().unwrap_or(999));

        let label = cat.split('-')
            .map(|s| s[0..1].to_uppercase() + &s[1..])
            .collect::<Vec<_>>()
            .join(" ");

        sidebar.push(SidebarItem {
            r#type: "category".to_string(),
            id: format!("cat-{}", cat),
            label,
            slug: String::new(),
            category: Some(cat),
            date: None,
            items: Some(items.iter().map(|d| SidebarItem {
                r#type: "doc".to_string(),
                id: d["id"].as_str().unwrap().to_string(),
                label: d["sidebarLabel"].as_str().unwrap_or(d["title"].as_str().unwrap_or("")).to_string(),
                slug: d["slug"].as_str().unwrap().to_string(),
                category: Some(d["category"].as_str().unwrap_or("").to_string()),
                date: d["date"].as_str().map(|s| s.to_string()),
                items: None,
            }).collect()),
        });
    }

    sidebar
}

pub fn slug_to_var_name(slug: &str) -> String {
    if slug.is_empty() {
        return "doc_".to_string();
    }
    let name = slug.replace(['/', '-'], "_");
    if name.chars().next().is_some_and(|c| c.is_ascii_digit()) {
        format!("doc_{}", name)
    } else {
        name
    }
}
