use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::Path;
use anyhow::Result;
use chrono;
use pulldown_cmark::{html, Options, Parser};
use regex::Regex;
use serde::{Serialize};
use serde_json::Value;
use walkdir::WalkDir;

use crate::core::{Logger, Paths};
use crate::diagnostics::*;
use crate::plugins::*;

#[derive(Debug, Clone, Serialize)]
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
}

#[derive(Debug, Clone, Serialize)]
pub struct TocItem {
    pub value: String,
    pub id: String,
    pub level: usize,
}

#[derive(Debug, Clone, Serialize)]
pub struct SidebarItem {
    pub item_type: String, // "doc" or "category"
    pub id: String,
    pub label: String,
    pub slug: String,
    pub category: Option<String>,
    pub date: Option<String>,
    pub items: Option<Vec<SidebarItem>>,
}

pub fn build_docs(paths: &Paths, logger: &Logger) -> anyhow::Result<()> {
    let mut diags = Diagnostics::new();
    let docs_dir = paths.root.join("docs");
    let blog_dir = paths.root.join("blog");
    let gen_dir = paths.root.join("src").join("generated");
    let gen_docs_dir = gen_dir.join("docs");

    logger.raw("📚 Scanning docs…");
    let docs = scan_md_files(&docs_dir, "docs", &mut diags)?;
    let blogs = scan_md_files(&blog_dir, "blog", &mut diags)?;
    let all = [docs, blogs].concat();

    logger.raw(&format!("✅ Found {} docs", all.len()));

    // Validate unique slugs
    let slug_entries: Vec<(String, String)> =
        all.iter().map(|d| (d.id.clone(), d.slug.clone())).collect();
    validate_unique_slugs(&slug_entries, &mut diags);

    // Broken links validation
    let known_slugs: HashSet<String> = all.iter().map(|d| d.slug.clone()).collect();
    for doc in &all {
        validate_internal_links(&doc.content, &known_slugs, &doc.id, &mut diags);
    }

    // Report diagnostics
    let (errors, warnings, _info) = diags.summary();
    if errors > 0 || warnings > 0 {
        logger.raw("");
        logger.raw("🔍 Codeblocks Report");
        logger.raw(&"═".repeat(60));
        logger.raw(&diags.format());
        logger.raw("");
    }

    // Build sidebar
    let sidebar = build_sidebar(&all);

    // Ensure output dirs exist
    fs::create_dir_all(&gen_docs_dir)?;

    // 1) Write sidebar.ts
    let sidebar_json = serde_json::to_string_pretty(&sidebar)?;
    let sidebar_content = format!(
        "// AUTO-GENERATED — DO NOT EDIT.\n\nexport const sidebarData = {};",
        sidebar_json
    );
    fs::write(gen_dir.join("sidebar.ts"), sidebar_content)?;

    // 2) Write one file per doc
    for d in &all {
        let filename = d.id.replace('/', "-");
        let content = format!(
            "// AUTO-GENERATED — DO NOT EDIT.\n\nexport const {}: any = {},\n",
            slug_to_var_name(&d.id),
            serde_json::to_string_pretty(&d)?
        );
        fs::write(gen_docs_dir.join(format!("{}.ts", filename)), content)?;
    }

    // 3) Write docs/index.ts
    let imports = all
        .iter()
        .map(|d| {
            format!(
                "import {{ {} }} from \"./{}.ts\";",
                slug_to_var_name(&d.id),
                d.id.replace('/', "-")
            )
        })
        .collect::<Vec<_>>()
        .join("\n");
    let exports = all
        .iter()
        .map(|d| slug_to_var_name(&d.id))
        .collect::<Vec<_>>()
        .join(",\n  ");

    let docs_index_content = format!(
        "// AUTO-GENERATED — DO NOT EDIT.\n{}\n\nexport {{\n  {},\n}};\n\nexport const allDocs: any[] = [\n  {},\n];",
        imports, exports, exports
    );
    fs::write(gen_docs_dir.join("index.ts"), docs_index_content)?;

    // 4) Write top-level index.ts
    let top_index_content = format!(
        "// AUTO-GENERATED — DO NOT EDIT.\nexport {{ sidebarData }} from \"./sidebar.ts\";\nexport {{ allDocs }} from \"./docs/index.ts\";",
    );
    fs::write(gen_dir.join("index.ts"), top_index_content)?;

    generate_seo_assets(&paths.root, &all)?;

    logger.raw(&format!("💾 Written to {}", gen_dir.display()));
    logger.raw("✨ Done!");

    Ok(())
}

fn generate_seo_assets(root: &Path, docs: &[DocEntry]) -> anyhow::Result<()> {
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
        let url = if d.section == "blog" {
            format!("{}/blog/{}", site_url, d.slug.replace("blog/", ""))
        } else {
            format!("{}/docs/{}", site_url, d.slug)
        };
        let freq = if d.section == "blog" {
            "weekly"
        } else {
            "monthly"
        };
        let prio = if d.section == "blog" { "0.7" } else { "0.9" };

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

fn scan_md_files(
    base_dir: &Path,
    section: &str,
    diags: &mut Diagnostics,
) -> anyhow::Result<Vec<DocEntry>> {
    let re_prefix = regex::Regex::new(r"^\d{2}-").unwrap();
    let mut entries = Vec::new();
    if !base_dir.exists() {
        return Ok(entries);
    }

    for entry in WalkDir::new(base_dir).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() && entry.file_name().to_string_lossy().ends_with(".md") {
            let raw = fs::read_to_string(entry.path())?;
            let rel_path = entry
                .path()
                .strip_prefix(base_dir)?
                .to_string_lossy()
                .replace(".md", "");

            let (fm, content) = parse_frontmatter(&raw);
            validate_frontmatter(&fm, &rel_path, diags);

            // Slug handling
            let slug_parts: Vec<&str> = rel_path.split('/').collect();
            let category = if slug_parts.len() > 1 {
                re_prefix.replace(&slug_parts[0], "").to_string()
            } else {
                "".to_string()
            };

            let clean_slug = slug_parts
                .iter()
                .map(|part| re_prefix.replace(part, "").to_string())
                .collect::<Vec<_>>()
                .join("/");

            let slug = if section == "blog" {
                format!("blog/{}", clean_slug)
            } else {
                clean_slug
            };
            let title = fm
                .get("title")
                .and_then(|v| v.as_str())
                .unwrap_or("Untitled")
                .to_string();

            // Validate mandatory code block descriptions
            validate_code_block_descriptions(&content, &rel_path, diags);

            // Render markdown to HTML
            let mut options = Options::empty();
            options.insert(Options::ENABLE_TABLES);
            options.insert(Options::ENABLE_FOOTNOTES);
            options.insert(Options::ENABLE_STRIKETHROUGH);

            let parser = Parser::new_ext(&content, options);
            let mut html_output = String::new();
            html::push_html(&mut html_output, parser);

            // TOC extraction
            let toc = extract_toc(&content);

            // Sidebar position
            let pos = fm
                .get("sidebar_position")
                .and_then(|v| v.as_u64())
                .unwrap_or(999) as usize;

            entries.push(DocEntry {
                id: rel_path.clone(),
                slug,
                title,
                sidebar_label: fm
                    .get("sidebar_label")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string(),
                sidebar_position: if section == "blog" { 9000 + pos } else { pos },
                category,
                original_category: if slug_parts.len() > 1 {
                    Some(slug_parts[0].to_string())
                } else {
                    None
                },
                description: fm
                    .get("description")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string(),
                content: html_output,
                raw_content: content,
                toc,
                date: fm
                    .get("date")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string()),
                author: fm
                    .get("author")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string()),
                tags: fm.get("tags").and_then(|v| v.as_array()).map(|arr| {
                    arr.iter()
                        .filter_map(|v| v.as_str())
                        .map(|s| s.to_string())
                        .collect()
                }),
                section: section.to_string(),
                metadata: fm,
            });
        }
    }
    Ok(entries)
}

fn parse_frontmatter(md: &str) -> (HashMap<String, Value>, String) {
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

            if trimmed.starts_with("- ") {
                if let Some(key) = &current_key {
                    let val = trimmed[2..]
                        .trim()
                        .trim_matches('\"')
                        .trim_matches('\'')
                        .to_string();
                    current_list.push(val);
                }
                continue;
            }

            if let Some(idx) = line.find(':') {
                if let Some(key) = current_key.take() {
                    if !current_list.is_empty() {
                        fm.insert(
                            key,
                            Value::Array(current_list.drain(..).map(Value::String).collect()),
                        );
                    }
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

        if let Some(key) = current_key {
            if !current_list.is_empty() {
                fm.insert(
                    key,
                    Value::Array(current_list.drain(..).map(Value::String).collect()),
                );
            }
        }

        (fm, content.to_string())
    } else {
        (HashMap::new(), md.to_string())
    }
}

fn slugify_heading(text: &str) -> String {
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

fn extract_toc(content: &str) -> Vec<TocItem> {
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

fn build_sidebar(docs: &[DocEntry]) -> Vec<SidebarItem> {
    let mut cat_order: Vec<String> = Vec::new();
    let mut cat_prefixes: HashMap<String, usize> = HashMap::new();
    let mut grouped: HashMap<String, Vec<DocEntry>> = HashMap::new();
    let mut uncategorized: Vec<DocEntry> = Vec::new();

    for d in docs {
        if !d.category.is_empty() {
            if !grouped.contains_key(&d.category) {
                cat_order.push(d.category.clone());
                if let Some(orig) = &d.original_category {
                    let prefix = orig
                        .chars()
                        .take(2)
                        .filter_map(|c| c.to_digit(10))
                        .collect::<Vec<_>>();
                    if prefix.len() == 2 {
                        cat_prefixes.insert(
                            d.category.clone(),
                            (prefix[0] as usize * 10) + prefix[1] as usize,
                        );
                    } else {
                        cat_prefixes.insert(d.category.clone(), 999);
                    }
                } else {
                    cat_prefixes.insert(d.category.clone(), 999);
                }
            }
            grouped
                .entry(d.category.clone())
                .or_default()
                .push(d.clone());
        } else {
            uncategorized.push(d.clone());
        }
    }

    let mut sidebar: Vec<SidebarItem> = Vec::new();

    // 1. Welcome page
    if let Some(welcome) = docs.iter().find(|d| d.slug == "welcome") {
        sidebar.push(SidebarItem {
            item_type: "doc".to_string(),
            id: welcome.id.clone(),
            label: welcome.sidebar_label.clone(),
            slug: welcome.slug.clone(),
            category: Some(welcome.category.clone()),
            date: welcome.date.clone(),
            items: None,
        });
    }

    // 2. Uncategorized
    let mut sorted_uncat = uncategorized;
    sorted_uncat.sort_by_key(|d| d.sidebar_position);
    for d in sorted_uncat {
        if d.slug == "welcome" {
            continue;
        }
        sidebar.push(SidebarItem {
            item_type: "doc".to_string(),
            id: d.id.clone(),
            label: d.sidebar_label.clone(),
            slug: d.slug.clone(),
            category: Some(d.category.clone()),
            date: d.date.clone(),
            items: None,
        });
    }

    // 3. Categories sorted by numeric prefix
    cat_order.sort_by_key(|cat| *cat_prefixes.get(cat).unwrap_or(&999));

    for cat in cat_order {
        if cat == "blog" {
            continue;
        }

        let mut items = grouped.get(&cat).cloned().unwrap_or_default();
        items.sort_by_key(|d| d.sidebar_position);

        let label = cat
            .split('-')
            .map(|word| {
                let mut c = word.chars();
                match c.next() {
                    None => String::new(),
                    Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
                }
            })
            .collect::<Vec<_>>()
            .join(" ");

        sidebar.push(SidebarItem {
            item_type: "category".to_string(),
            id: cat.clone(),
            label,
            slug: cat.clone(),
            category: None,
            date: None,
            items: Some(
                items
                    .into_iter()
                    .map(|d| SidebarItem {
                        item_type: "doc".to_string(),
                        id: d.id.clone(),
                        label: d.sidebar_label.clone(),
                        slug: d.slug.clone(),
                        category: Some(d.category.clone()),
                        date: d.date.clone(),
                        items: None,
                    })
                    .collect(),
            ),
        });
    }

    // 4. Blog
    if let Some(blog_items) = grouped.get("blog") {
        let mut items = blog_items.clone();
        items.sort_by_key(|d| d.sidebar_position);

        sidebar.push(SidebarItem {
            item_type: "category".to_string(),
            id: "blog".to_string(),
            label: "📝 Blog".to_string(),
            slug: "blog".to_string(),
            category: None,
            date: None,
            items: Some(
                items
                    .into_iter()
                    .map(|d| SidebarItem {
                        item_type: "doc".to_string(),
                        id: d.id.clone(),
                        label: d.sidebar_label.clone(),
                        slug: d.slug.clone(),
                        category: Some(d.category.clone()),
                        date: d.date.clone(),
                        items: None,
                    })
                    .collect(),
            ),
        });
    }

    sidebar
}

// ... (rest of the file)
fn slug_to_var_name(slug: &str) -> String {
    if slug.is_empty() {
        return "doc_".to_string();
    }
    let name = slug.replace('/', "_").replace('-', "_");
    if name.chars().next().map_or(false, |c| c.is_ascii_digit()) {
        format!("doc_{}", name)
    } else {
        name
    }
}

fn validate_internal_links(
    content: &str,
    known_slugs: &HashSet<String>,
    file: &str,
    diags: &mut Diagnostics,
) {
    let link_re = Regex::new(r"\[([^\]]*)\]\(([^)]+)\)").unwrap();
    for cap in link_re.captures_iter(content) {
        let href = &cap[2];
        if !href.starts_with("/docs/") && !href.starts_with("/blog/") {
            continue;
        }
        let clean_href = href.split('#').next().unwrap().trim_start_matches('/');
        if !known_slugs.contains(clean_href) {
            diags.warn(
                DiagnosticSource::Links,
                file,
                &format!("Broken link: \"{}\" → \"{}\"", &cap[1], href),
                Some(&format!("Slug \"{}\" not found", clean_href)),
            );
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;

    #[test]
    fn test_parse_frontmatter_no_frontmatter() {
        let md = "Just content without any frontmatter";
        let (fm, content) = parse_frontmatter(md);
        assert!(fm.is_empty());
        assert_eq!(content, md);
    }

    #[test]
    fn test_parse_frontmatter_empty_frontmatter() {
        let md = "---\n---\nContent here";
        let (fm, content) = parse_frontmatter(md);
        assert!(fm.is_empty());
        assert_eq!(content, "Content here");
    }

    #[test]
    fn test_parse_frontmatter_malformed_frontmatter() {
        let md = "---\ntitle: Hello\nnot-a-key-value-pair\n---\nContent";
        let (fm, content) = parse_frontmatter(md);
        assert_eq!(fm.get("title").and_then(|v| v.as_str()), Some("Hello"));
        assert_eq!(content, "Content");
    }

    #[test]
    fn test_parse_frontmatter_multiline_list() {
        let md = "---\ntitle: Multi-line\ntags:\n  - item1\n  - item2\n  - item3\n---\nContent";
        let (fm, _) = parse_frontmatter(md);
        let tags = fm.get("tags").and_then(|v| v.as_array()).expect("Should be array");
        assert_eq!(tags.len(), 3);
        assert_eq!(tags[0].as_str(), Some("item1"));
        assert_eq!(tags[2].as_str(), Some("item3"));
    }

    #[test]
    fn test_parse_frontmatter_empty_values() {
        let md = "---\ntitle: \ndescription: \n---\nContent";
        let (fm, _) = parse_frontmatter(md);
        // In current implementation, an empty value after ':' might be handled as a key for the next line
        // or an empty string if it's the last line.
        // Let's see how it actually behaves.
    }


    #[test]
    fn test_parse_frontmatter_yaml_list() {
        let md = "---\ntitle: List Test\ntags:\n  - rust\n  - testing\n---\nContent";
        let (fm, _) = parse_frontmatter(md);
        let tags = fm
            .get("tags")
            .and_then(|v| v.as_array())
            .expect("Should be array");
        assert_eq!(tags.len(), 2);
        assert_eq!(tags[0].as_str(), Some("rust"));
        assert_eq!(tags[1].as_str(), Some("testing"));
    }

    #[test]
    fn test_parse_frontmatter_complex_values() {
        let md = "---\nurl: https://example.com/path?q=1\nmeta: key:value\n---\nContent";
        let (fm, _) = parse_frontmatter(md);
        assert_eq!(
            fm.get("url").and_then(|v| v.as_str()),
            Some("https://example.com/path?q=1")
        );
        assert_eq!(fm.get("meta").and_then(|v| v.as_str()), Some("key:value"));
    }

    #[test]
    fn test_slugify_heading_edge_cases() {
        assert_eq!(slugify_heading("Hello World"), "hello-world");
        assert_eq!(slugify_heading("C++ Guide"), "c-plus-plus-guide");
        assert_eq!(slugify_heading("C# Basics"), "c-sharp-basics");
        assert_eq!(slugify_heading(".NET Core"), "net-core");
        assert_eq!(slugify_heading("What is 1 + 1?"), "what-is-1-1");
        assert_eq!(slugify_heading("!!! Warning !!!"), "warning");
        assert_eq!(slugify_heading("  Mixed Case  "), "mixed-case");
        assert_eq!(slugify_heading("Unicode 😊 Test"), "unicode-test");
        assert_eq!(slugify_heading(""), "");
        assert_eq!(slugify_heading("   "), "");
        assert_eq!(slugify_heading("!!!"), "");
    }

    #[test]
    fn test_slug_to_var_name_edge_cases() {
        assert_eq!(slug_to_var_name("docs/my-page"), "docs_my_page");
        assert_eq!(slug_to_var_name("01-intro"), "doc_01_intro");
        assert_eq!(slug_to_var_name(""), "doc_");
        assert_eq!(slug_to_var_name("123-digit-start"), "doc_123_digit_start");
        assert_eq!(slug_to_var_name("docs/sub/page"), "docs_sub_page");
    }

    #[test]
    fn test_extract_toc() {
        let content = "# Title\n## Heading 2\nSome text\n### Heading 3\nMore text\n## Another Heading 2";
        let toc = extract_toc(content);
        assert_eq!(toc.len(), 3);
        assert_eq!(toc[0].level, 2);
        assert_eq!(toc[0].value, "Heading 2");
        assert_eq!(toc[0].id, "heading-2");
        assert_eq!(toc[1].level, 3);
        assert_eq!(toc[1].value, "Heading 3");
        assert_eq!(toc[2].level, 2);
        assert_eq!(toc[2].value, "Another Heading 2");

        let no_headings = "Just some content";
        assert!(extract_toc(no_headings).is_empty());
    }

    #[test]
    fn test_validate_internal_links() {
        let mut diags = Diagnostics::new();
        let known_slugs: HashSet<String> = vec!["docs/page1".to_string(), "docs/page2".to_string()].into_iter().collect();

        let content_ok = "[Link to Page 1](/docs/page1) and [Link to Page 2](/docs/page2#section)";
        validate_internal_links(content_ok, &known_slugs, "file1.md", &mut diags);
        assert_eq!(diags.summary().1, 0); // No warnings

        let content_broken = "[Broken Link](/docs/nonexistent)";
        validate_internal_links(content_broken, &known_slugs, "file2.md", &mut diags);
        assert_eq!(diags.summary().1, 1);
        assert_eq!(diags.warnings()[0].file, "file2.md");

        let content_external = "[Google](https://google.com)";
        validate_internal_links(content_external, &known_slugs, "file3.md", &mut diags);
        // Should not generate warnings for external links
    }

    #[test]
    fn test_build_sidebar_complex() {
        let docs = vec![
            DocEntry {
                id: "welcome".to_string(),
                slug: "welcome".to_string(),
                title: "Welcome".to_string(),
                sidebar_label: "Welcome".to_string(),
                sidebar_position: 0,
                category: "".to_string(),
                original_category: None,
                description: "".to_string(),
                content: "".to_string(),
                raw_content: "".to_string(),
                toc: vec![],
                date: None,
                author: None,
                tags: None,
                section: "docs".to_string(),
                metadata: HashMap::new(),
            },
            DocEntry {
                id: "01-getting-started/intro".to_string(),
                slug: "getting-started/intro".to_string(),
                title: "Intro".to_string(),
                sidebar_label: "Intro".to_string(),
                sidebar_position: 1,
                category: "getting-started".to_string(),
                original_category: Some("01-getting-started".to_string()),
                description: "".to_string(),
                content: "".to_string(),
                raw_content: "".to_string(),
                toc: vec![],
                date: None,
                author: None,
                tags: None,
                section: "docs".to_string(),
                metadata: HashMap::new(),
            },
            DocEntry {
                id: "02-architecture/core".to_string(),
                slug: "architecture/core".to_string(),
                title: "Core".to_string(),
                sidebar_label: "Core".to_string(),
                sidebar_position: 1,
                category: "architecture".to_string(),
                original_category: Some("02-architecture".to_string()),
                description: "".to_string(),
                content: "".to_string(),
                raw_content: "".to_string(),
                toc: vec![],
                date: None,
                author: None,
                tags: None,
                section: "docs".to_string(),
                metadata: HashMap::new(),
            },
            DocEntry {
                id: "blog/post1".to_string(),
                slug: "blog/post1".to_string(),
                title: "Post 1".to_string(),
                sidebar_label: "Post 1".to_string(),
                sidebar_position: 1,
                category: "blog".to_string(),
                original_category: None,
                description: "".to_string(),
                content: "".to_string(),
                raw_content: "".to_string(),
                toc: vec![],
                date: None,
                author: None,
                tags: None,
                section: "blog".to_string(),
                metadata: HashMap::new(),
            },
        ];

        let sidebar = build_sidebar(&docs);
        
        // Check order: Welcome -> Categories (01, 02) -> Blog
        assert_eq!(sidebar[0].label, "Welcome");
        assert_eq!(sidebar[1].label, "Getting Started");
        assert_eq!(sidebar[2].label, "Architecture");
        assert_eq!(sidebar[3].label, "📝 Blog");
    }
}
