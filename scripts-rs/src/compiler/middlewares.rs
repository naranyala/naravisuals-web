use crate::compiler::pipeline::CompilerMiddleware;
use crate::compiler::unit::{CompilationUnit, DocMetadata};
use crate::compiler::context::CompilationContext;
use crate::diagnostics::{validate_frontmatter, validate_unique_slugs, validate_internal_links};
use crate::build_docs::{parse_frontmatter, extract_toc, build_sidebar_from_json, slug_to_var_name};
use std::collections::{HashSet};
use std::fs;
use std::path::Path;
use smol_str::SmolStr;
use fxhash::FxHashMap;
use indoc::formatdoc;
use cow_utils::CowUtils;
use serde_json::{json, Value, Map};
use pulldown_cmark::{Event, Tag, TagEnd, CodeBlockKind};

pub struct FrontmatterMiddleware;

impl CompilerMiddleware for FrontmatterMiddleware {
    fn name(&self) -> &'static str { "Frontmatter" }

    fn on_pre_parse(&mut self, unit: &mut CompilationUnit, ctx: &mut CompilationContext) {
        let (fm, content) = parse_frontmatter(&unit.raw_content);
        validate_frontmatter(&fm, &unit.rel_path, &mut ctx.diagnostics);
        
        unit.clean_content = content.clone();
        unit.content = content;
        
        let re_prefix = regex::Regex::new(r"^\d{2}-").unwrap();
        let slug_parts: Vec<&str> = unit.rel_path.split('/').collect();
        let category = if slug_parts.len() > 1 {
            re_prefix.replace(slug_parts[0], "").to_string()
        } else {
            "".to_string()
        };

        let slug = slug_parts
            .iter()
            .map(|part| re_prefix.replace(part, "").to_string())
            .collect::<Vec<_>>()
            .join("/");

        let title = fm
            .get("title")
            .and_then(|v| v.as_str())
            .unwrap_or("Untitled")
            .to_string();

        let mut custom = FxHashMap::default();
        for (k, v) in fm {
            custom.insert(SmolStr::from(k), v);
        }

        unit.metadata = Some(DocMetadata {
            title: title.clone().into(),
            description: custom.get("description").and_then(|v| v.as_str()).unwrap_or("").into(),
            sidebar_label: custom.get("sidebar_label").and_then(|v| v.as_str()).unwrap_or(&title).into(),
            sidebar_position: custom.get("sidebar_position").and_then(|v| v.as_u64()).unwrap_or(999) as usize,
            category: category.into(),
            original_category: if slug_parts.len() > 1 { Some(slug_parts[0].into()) } else { None },
            slug: slug.into(),
            date: custom.get("date").and_then(|v| v.as_str()).map(|s| s.into()),
            author: custom.get("author").and_then(|v| v.as_str()).map(|s| s.into()),
            tags: custom.get("tags").and_then(|v| v.as_array()).map(|arr| {
                arr.iter().filter_map(|v| v.as_str()).map(|s| SmolStr::from(s)).collect()
            }),
            custom,
        });
    }
}

pub struct ValidationMiddleware;

impl CompilerMiddleware for ValidationMiddleware {
    fn name(&self) -> &'static str { "Validation" }

    fn on_assemble(&mut self, units: &mut [CompilationUnit], ctx: &mut CompilationContext) {
        // Unique Slugs
        let slug_entries: Vec<(String, String)> = units
            .iter()
            .filter_map(|u| u.metadata.as_ref().map(|m| (u.id.to_string(), m.slug.to_string())))
            .collect();
        validate_unique_slugs(&slug_entries, &mut ctx.diagnostics);

        // Internal Links
        let known_slugs: HashSet<String> = units
            .iter()
            .filter_map(|u| u.metadata.as_ref().map(|m| m.slug.to_string()))
            .collect();
        
        for unit in units {
            validate_internal_links(&unit.raw_content, &known_slugs, &unit.id, &mut ctx.diagnostics);
        }
    }
}

pub struct TocMiddleware;

impl CompilerMiddleware for TocMiddleware {
    fn name(&self) -> &'static str { "TOC" }

    fn on_transform(&mut self, unit: &mut CompilationUnit, _ctx: &mut CompilationContext) {
        unit.toc = Some(extract_toc(&unit.content));
    }
}

pub struct HighlightMiddleware;

impl CompilerMiddleware for HighlightMiddleware {
    fn name(&self) -> &'static str { "Highlight" }

    fn on_transform_events<'a>(&mut self, events: &mut Vec<Event<'a>>, _ctx: &mut CompilationContext) {
        let mut new_events = Vec::with_capacity(events.len());
        let mut i = 0;
        
        while i < events.len() {
            let event = &events[i];
            
            if let Event::Start(Tag::CodeBlock(kind)) = event {
                let info = match kind {
                    CodeBlockKind::Fenced(s) => Some(s.as_ref()),
                    CodeBlockKind::Indented => None,
                };
                
                let meta = crate::compiler::utils::parse_code_info(info);
                let lang = &meta.lang;

                // Skip mermaid diagrams - handled by MermaidMiddleware
                let mermaid_types = [
                    "mermaid", "graph", "flowchart", "sequencediagram", "classdiagram", "statediagram", 
                    "erdiagram", "gantt", "pie", "quadrantchart", "xychart", "mindmap", 
                    "timeline", "journey", "requirementdiagram", "gitgraph", "sankey"
                ];

                if mermaid_types.contains(&lang.to_lowercase().as_str()) {
                    new_events.push(events[i].clone());
                    i += 1;
                    continue;
                }

                // Collect code content
                let mut code = String::new();
                i += 1;
                while i < events.len() {
                    match &events[i] {
                        Event::Text(t) => code.push_str(t.as_ref()),
                        Event::End(TagEnd::CodeBlock) => break,
                        _ => {}
                    }
                    i += 1;
                }

                // Simply escape HTML and wrap. Highlighting will happen in React.
                let escaped = html_escape::encode_safe(&code);
                let inner_html = format!("<pre><code class=\"language-{}\">{}</code></pre>", lang, escaped);
                let wrapped_html = crate::compiler::utils::code_block_wrapper(&inner_html, &meta);
                
                new_events.push(Event::Html(wrapped_html.into()));
            } else {
                new_events.push(events[i].clone());
            }
            i += 1;
        }
        
        *events = new_events;
    }
}

pub struct MermaidMiddleware;

impl CompilerMiddleware for MermaidMiddleware {
    fn name(&self) -> &'static str { "Mermaid" }

    fn on_transform_events<'a>(&mut self, events: &mut Vec<pulldown_cmark::Event<'a>>, ctx: &mut CompilationContext) {
        use pulldown_cmark::{Event, Tag, CodeBlockKind, TagEnd};

        for i in 0..events.len() {
            if let Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(info))) = &events[i] {
                let mermaid_types = [
                    "mermaid", "graph", "flowchart", "sequencediagram", "classdiagram", "statediagram", 
                    "erdiagram", "gantt", "pie", "quadrantchart", "xychart", "mindmap", 
                    "timeline", "journey", "requirementdiagram", "gitgraph", "sankey"
                ];

                let lang = info.as_ref().split(':').next().unwrap_or("").to_lowercase();
                if mermaid_types.contains(&lang.as_str()) {
                    // Find the text event inside
                    let mut j = i + 1;
                    while j < events.len() {
                        if let Event::Text(content) = &events[j] {
                            let mut diagram = content.to_string();
                            
                            // Normalization
                            let trimmed = diagram.trim();
                            let first_line = trimmed.lines().next().unwrap_or("").to_lowercase();
                            let first_word = first_line.split_whitespace().next().unwrap_or("");

                            if mermaid_types.contains(&first_word) {
                                if (first_word == "graph" || first_word == "flowchart") && !first_line.contains(" lr") && !first_line.contains(" td") && !first_line.contains(" tb") && !first_line.contains(" bt") && !first_line.contains(" rl") {
                                    if !first_line.contains('\n') && first_line == first_word {
                                        diagram = format!("{} TD\n{}", first_word.to_uppercase(), trimmed.lines().skip(1).collect::<Vec<_>>().join("\n"));
                                    }
                                }
                            } else {
                                diagram = format!("flowchart TD\n{}", trimmed);
                            }

                            // Validation
                            crate::diagnostics::validate_mermaid_content(&diagram, "diagram", &mut ctx.diagnostics);

                            events[j] = Event::Text(diagram.into());
                            break;
                        } else if let Event::End(TagEnd::CodeBlock) = &events[j] {
                            break;
                        }
                        j += 1;
                    }
                }
            }
        }
    }
}

pub struct GeneratorMiddleware;

impl CompilerMiddleware for GeneratorMiddleware {
    fn name(&self) -> &'static str { "Generator" }

    fn on_assemble(&mut self, units: &mut [CompilationUnit], ctx: &mut CompilationContext) {
        let all_docs: Vec<Value> = units.iter().map(|u| {
            let meta = u.metadata.as_ref().unwrap();
            
            // Map custom fields to match TS exactly
            let mut metadata = Map::new();
            for (k, v) in &meta.custom {
                metadata.insert(k.to_string(), v.clone());
            }

            json!({
                "id": u.id.to_string(),
                "slug": meta.slug.to_string(),
                "title": meta.title.to_string(),
                "sidebarLabel": meta.sidebar_label.to_string(),
                "sidebarPosition": meta.sidebar_position,
                "category": meta.category.to_string(),
                "originalCategory": meta.original_category.as_ref().map(|s| s.to_string()),
                "description": meta.description.to_string(),
                "content": u.html.clone().unwrap_or_default(),
                "rawContent": u.clean_content.clone(), // Use clean content for Raw mode
                "toc": u.toc.clone().unwrap_or_default(),
                "date": meta.date.as_ref().map(|s| s.to_string()),
                "author": meta.author.as_ref().map(|s| s.to_string()),
                "tags": meta.tags,
                "section": u.section.to_string(),
                "metadata": metadata,
                "ast": u.ast.clone().unwrap_or(json!([])),
            })
        }).collect();

        let sidebar = build_sidebar_from_json(&all_docs);
        let gen_dir = Path::new(&ctx.config.output_dir);
        let gen_docs_dir = gen_dir.join("docs");

        fs::create_dir_all(&gen_docs_dir).ok();

        // 1) Write sidebar.ts
        let sidebar_json = serde_json::to_string_pretty(&sidebar).unwrap();
        let sidebar_content = formatdoc!(
            "// AUTO-GENERATED — DO NOT EDIT.

             export const sidebarData = {sidebar_json};",
            sidebar_json = sidebar_json
        );
        fs::write(gen_dir.join("sidebar.ts"), sidebar_content).ok();

        // 2) Write one file per doc
        for d in &all_docs {
            let id = d["id"].as_str().unwrap();
            let filename = id.cow_replace("/", "-");
            let var_name = slug_to_var_name(id);
            let json = serde_json::to_string_pretty(&d).unwrap();
            
            let content = formatdoc!(
                "// AUTO-GENERATED — DO NOT EDIT.
                 import type {{ DocEntry }} from \"../types.ts\";

                 export const {var_name}: DocEntry = {json};",
                var_name = var_name,
                json = json
            );
            fs::write(gen_docs_dir.join(format!("{}.ts", filename)), content).ok();
        }

        // 3) Write docs/index.ts
        let imports = all_docs
            .iter()
            .map(|d| {
                let id = d["id"].as_str().unwrap();
                format!(
                    "import {{ {} }} from \"./{}.ts\";",
                    slug_to_var_name(id),
                    id.cow_replace("/", "-")
                )
            })
            .collect::<Vec<_>>()
            .join("\n");
        let exports = all_docs
            .iter()
            .map(|d| slug_to_var_name(d["id"].as_str().unwrap()))
            .collect::<Vec<_>>()
            .join(",\n  ");

        let docs_index_content = formatdoc!(
            "// AUTO-GENERATED — DO NOT EDIT.
             import type {{ DocEntry }} from \"../types.ts\";
             {imports}

             export {{
               {exports},
             }};

             export const allDocs: DocEntry[] = [
               {exports},
             ];",
            imports = imports,
            exports = exports
        );
        fs::write(gen_docs_dir.join("index.ts"), docs_index_content).ok();

        // 4) Write top-level index.ts
        let top_index_content = formatdoc!(
            "// AUTO-GENERATED — DO NOT EDIT.
             export {{ sidebarData }} from \"./sidebar.ts\";
             export {{ allDocs }} from \"./docs/index.ts\";"
        );
        fs::write(gen_dir.join("index.ts"), top_index_content).ok();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::unit::CompilationUnit;
    use crate::compiler::context::CompilationContext;
    use crate::core::Paths;
    use tempfile::tempdir;
    use std::path::PathBuf;
    use smol_str::SmolStr;

    fn create_test_unit(content: &str) -> CompilationUnit {
        CompilationUnit {
            id: SmolStr::from("test"),
            file_path: PathBuf::from("test.md"),
            rel_path: SmolStr::from("test"),
            raw_content: content.to_string(),
            section: SmolStr::from("docs"),
            metadata: None,
            clean_content: content.to_string(),
            content: content.to_string(),
            html: None,
            toc: None,
            ast: None,
        }
    }

    #[test]
    fn test_frontmatter_middleware() {
        let mut mw = FrontmatterMiddleware;
        let mut unit = create_test_unit("---\ntitle: Hello World\ncategory: guide\n---\n# Content");
        let dir = tempdir().unwrap();
        let mut ctx = CompilationContext::new(&Paths::with_root(dir.path().to_path_buf()));
        
        mw.on_pre_parse(&mut unit, &mut ctx);
        
        let meta = unit.metadata.unwrap();
        assert_eq!(meta.title, "Hello World");
        assert_eq!(meta.slug, "test");
        assert!(unit.content.contains("# Content"));
    }

    #[test]
    fn test_validation_middleware_duplicate_slugs() {
        let mut mw = ValidationMiddleware;
        let mut unit1 = create_test_unit("---\ntitle: One\nslug: same\n---");
        let mut unit2 = create_test_unit("---\ntitle: Two\nslug: same\n---");
        
        let dir = tempdir().unwrap();
        let mut ctx = CompilationContext::new(&Paths::with_root(dir.path().to_path_buf()));
        
        // Setup metadata manually or via FrontmatterMiddleware
        let mut fm_mw = FrontmatterMiddleware;
        fm_mw.on_pre_parse(&mut unit1, &mut ctx);
        fm_mw.on_pre_parse(&mut unit2, &mut ctx);
        
        let mut units = vec![unit1, unit2];
        mw.on_assemble(&mut units, &mut ctx);
        
        assert!(ctx.diagnostics.has_errors());
        let errors = ctx.diagnostics.errors();
        assert!(errors.iter().any(|e| e.message.contains("Duplicate slug")));
    }

    #[test]
    fn test_validation_middleware_broken_links() {
        let mut mw = ValidationMiddleware;
        let unit = create_test_unit("Check [this](/docs/non-existent)");
        let dir = tempdir().unwrap();
        let mut ctx = CompilationContext::new(&Paths::with_root(dir.path().to_path_buf()));
        
        let mut units = vec![unit];
        mw.on_assemble(&mut units, &mut ctx);
        
        let warnings = ctx.diagnostics.warnings();
        assert!(warnings.iter().any(|w| w.message.contains("Broken link")));
    }
}
