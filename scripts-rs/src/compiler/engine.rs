use std::path::Path;
use walkdir::WalkDir;
use pulldown_cmark::{html, Options, Parser};
use crate::compiler::unit::CompilationUnit;
use crate::compiler::container::CompilerContainer;
use crate::compiler::pipeline::CompilerMiddleware;
use crate::build_docs::{parse_frontmatter, extract_toc, build_sidebar_from_json, slug_to_var_name};
use smol_str::SmolStr;
use fxhash::FxHashMap;
use indoc::formatdoc;
use cow_utils::CowUtils;
use serde_json::{json, Value, Map};
use std::collections::HashSet;

use crate::diagnostics::{DiagnosticSource};

const STOP_WORDS: &[&str] = &[
    "the", "and", "a", "an", "in", "on", "at", "to", "for", "with", "is", "are", "was", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "of", "by", "from", "it", "its",
    "they", "them", "their", "this", "that", "these", "those", "which", "who", "whom", "can",
    "will", "would", "should", "could", "may", "might", "must", "if", "then", "else", "or", "as",
    "but", "not", "no", "yes", "all", "any", "each", "every", "some", "more", "most", "less",
    "least", "than", "also", "very", "too", "own", "other", "such", "only", "well", "how", "when",
    "where", "why", "both", "either", "neither", "just", "even", "still", "back", "away", "out",
    "into", "onto", "over", "under", "again", "further", "once", "here", "there", "about", "above",
    "below", "up", "down", "left", "right", "example", "using", "used", "use", "within", "between",
    "through", "across", "during", "without", "following", "provides", "features", "allows",
    "support", "supported", "system", "tool", "project", "documentation", "files", "file", "build",
    "process", "details", "found", "available", "information", "overview", "section", "table",
    "contents", "next", "steps",
];

pub struct DocumentationCompiler {
    pub container: CompilerContainer,
    pub units: Vec<CompilationUnit>,
    pub middlewares: Vec<Box<dyn CompilerMiddleware>>,
}

impl DocumentationCompiler {
    pub fn new(container: CompilerContainer) -> Self {
        Self {
            container,
            units: Vec::new(),
            middlewares: Vec::new(),
        }
    }

    pub fn use_middleware(&mut self, middleware: Box<dyn CompilerMiddleware>) -> &mut Self {
        self.middlewares.push(middleware);
        self
    }

    pub fn compile(&mut self) -> anyhow::Result<()> {
        self.container.logger.raw("🚀 Starting Rust Documentation Compiler…");

        // 1. Ingest
        let docs_dir = self.container.config.docs_dir.clone();
        self.scan_directory(&docs_dir, "docs")?;

        // 1.1 Validate mandatory abstract
        if !self.units.iter().any(|u| u.rel_path == "00-abstract") {
            self.container.context.error(
                DiagnosticSource::Frontmatter,
                "docs/00-abstract.md",
                "Mandatory file missing: docs/00-abstract.md",
                Some("This file is required for the site abstract/home page."),
            );
        }

        // 2. Process Units
        let unit_ids: Vec<SmolStr> = self.units.iter().map(|u| u.id.clone()).collect();
        for id in unit_ids {
            self.process_unit_by_id(&id)?;
        }

        // 3. Assemble
        for mw in &mut self.middlewares {
            mw.on_assemble(&mut self.units, &mut self.container);
        }

        // 4. Report
        println!("{}", self.container.context.diagnostics.format());
        if self.container.context.diagnostics.has_errors() {
            anyhow::bail!("Compilation failed due to errors.");
        }

        // 5. Generate
        self.generate()?;
        self.generate_word_stats()?;

        self.container.logger.raw(&format!("✨ Compilation finished in {:?}ms", self.container.context.start_time.elapsed().as_millis()));
        Ok(())
    }

    fn scan_directory(&mut self, base_dir: &str, section: &str) -> anyhow::Result<()> {
        let path = Path::new(base_dir);
        if !self.container.fs.exists(path) {
            return Ok(());
        }

        for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
            if entry.file_type().is_file() && entry.file_name().to_string_lossy().ends_with(".md") {
                let rel_path = entry
                    .path()
                    .strip_prefix(path)?
                    .to_string_lossy()
                    .replace(".md", "");
                
                let raw_content = self.container.fs.read(entry.path())?;
                
                let mut unit = CompilationUnit {
                    id: rel_path.clone().into(),
                    file_path: entry.path().to_path_buf(),
                    rel_path: rel_path.into(),
                    raw_content: raw_content.clone(),
                    section: section.to_string().into(),
                    metadata: None,
                    clean_content: raw_content.clone(),
                    content: raw_content,
                    html: None,
                    toc: None,
                    ast: None,
                };

                for mw in &mut self.middlewares {
                    mw.on_ingest(&mut unit, &mut self.container);
                }

                self.units.push(unit);
            }
        }

        Ok(())
    }

    fn process_unit_by_id(&mut self, id: &SmolStr) -> anyhow::Result<()> {
        let unit_idx = self.units.iter().position(|u| &u.id == id).unwrap();
        
        // 1. Frontmatter parsing
        let raw_content = self.units[unit_idx].raw_content.clone();
        let (fm, content) = parse_frontmatter(&raw_content);
        
        // 1.1 Validation
        crate::diagnostics::validate_frontmatter(&fm, &self.units[unit_idx].rel_path, &mut self.container.context.diagnostics);
        
        {
            let unit = &mut self.units[unit_idx];
            unit.clean_content = content.clone();
            unit.content = content;

            // 2. Metadata construction
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
                .unwrap_or("")
                .to_string();

            let mut custom = FxHashMap::default();
            for (k, v) in fm {
                custom.insert(SmolStr::from(k), v);
            }

            unit.metadata = Some(crate::compiler::unit::DocMetadata {
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
                    arr.iter().filter_map(|v| v.as_str()).map(SmolStr::from).collect()
                }),
                custom,
            });
        }

        // 3. Middleware: Pre-Parse
        for mw in &mut self.middlewares {
            mw.on_pre_parse(&mut self.units[unit_idx], &mut self.container);
        }

        // 4. Middleware: Transform (string)
        for mw in &mut self.middlewares {
            mw.on_transform(&mut self.units[unit_idx], &mut self.container);
        }

        // 5. Parsing (Events)
        let content_to_parse = self.units[unit_idx].content.clone();
        let mut events: Vec<pulldown_cmark::Event> = {
            let mut options = Options::empty();
            options.insert(Options::ENABLE_TABLES);
            options.insert(Options::ENABLE_FOOTNOTES);
            options.insert(Options::ENABLE_STRIKETHROUGH);
            options.insert(Options::ENABLE_TASKLISTS);

            let parser = Parser::new_ext(&content_to_parse, options);
            parser.collect()
        };

        // 6. AST Capture
        let ast = crate::compiler::ast::events_to_ast(&events);
        
        // 7. Middleware: Transform Events
        for mw in &mut self.middlewares {
            mw.on_transform_events(&mut events, &mut self.container);
        }

        // 8. Render HTML
        let mut html_output = String::new();
        html::push_html(&mut html_output, events.into_iter());
        
        // 9. TOC
        let toc = extract_toc(&content_to_parse);

        let unit = &mut self.units[unit_idx];
        unit.ast = Some(ast);
        unit.html = Some(html_output);
        unit.toc = Some(toc);

        // 10. Middleware: Post-Process
        for mw in &mut self.middlewares {
            mw.on_post_process(unit, &mut self.container);
        }

        Ok(())
    }

    fn generate_word_stats(&mut self) -> anyhow::Result<()> {
        let mut word_counts: FxHashMap<String, usize> = FxHashMap::default();
        let mut filtered_counts: FxHashMap<String, usize> = FxHashMap::default();
        let stop_words: HashSet<_> = STOP_WORDS.iter().collect();

        for unit in &self.units {
            let text = &unit.content;
            // Simplified cleanup for counting
            let cleaned = text.to_lowercase()
                .cow_replace("#", " ")
                .cow_replace("[", " ")
                .cow_replace("]", " ")
                .cow_replace("(", " ")
                .cow_replace(")", " ")
                .cow_replace("`", " ")
                 .cow_replace(":::", " ")
                 .cow_replace("!!!", " ")
                .to_string();

            for word in cleaned.split_whitespace() {
                let word = word.trim_matches(|c: char| !c.is_alphanumeric());
                if word.len() < 3 { continue; }
                if word.chars().all(|c| c.is_ascii_digit()) { continue; }

                if stop_words.contains(&word) {
                    *filtered_counts.entry(word.to_string()).or_insert(0) += 1;
                } else {
                    *word_counts.entry(word.to_string()).or_insert(0) += 1;
                }
            }
        }

        let mut sorted_words: Vec<_> = word_counts.into_iter().collect();
        sorted_words.sort_by(|a, b| b.1.cmp(&a.1));
        let top_words: Vec<_> = sorted_words.into_iter().take(200).map(|(word, count)| json!({ "word": word, "count": count })).collect();

        let mut sorted_filtered: Vec<_> = filtered_counts.into_iter().collect();
        sorted_filtered.sort_by(|a, b| b.1.cmp(&a.1));
        let top_filtered: Vec<_> = sorted_filtered.into_iter().map(|(word, count)| json!({ "word": word, "count": count })).collect();

        let content = formatdoc!(
            "// AUTO-GENERATED — DO NOT EDIT.
             export const wordStats = {word_stats};
             export const filteredStats = {filtered_stats};",
            word_stats = serde_json::to_string_pretty(&top_words)?,
            filtered_stats = serde_json::to_string_pretty(&top_filtered)?
        );

        let gen_dir = Path::new(&self.container.config.output_dir);
        self.container.fs.write(&gen_dir.join("word-stats.ts"), &content)?;

        Ok(())
    }

    fn generate(&mut self) -> anyhow::Result<()> {
        let all_docs: Vec<Value> = self.units.iter().map(|u| {
            let meta = u.metadata.as_ref().unwrap();
            
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
                "rawContent": u.clean_content.clone(),
                "toc": u.toc.clone().unwrap_or_default(),
                "date": meta.date.as_ref().map(|s| s.to_string()),
                "author": meta.author.as_ref().map(|s| s.to_string()),
                "tags": meta.tags.clone().unwrap_or_default(),
                "section": u.section.to_string(),
                "metadata": metadata,
                "ast": u.ast.clone().unwrap_or(json!([])),
            })
        }).collect();

        let sidebar = build_sidebar_from_json(&all_docs);
        let gen_dir = Path::new(&self.container.config.output_dir);
        let gen_docs_dir = gen_dir.join("docs");

        self.container.fs.mkdir(&gen_docs_dir, true).ok();

        // 1) Write sidebar.ts
        let sidebar_json = serde_json::to_string_pretty(&sidebar).unwrap();
        let sidebar_content = formatdoc!(
            "// AUTO-GENERATED — DO NOT EDIT.
             export const sidebarData = {sidebar_json};",
            sidebar_json = sidebar_json
        );
        self.container.fs.write(&gen_dir.join("sidebar.ts"), &sidebar_content).ok();

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
            self.container.fs.write(&gen_docs_dir.join(format!("{}.ts", filename)), &content).ok();
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
        self.container.fs.write(&gen_docs_dir.join("index.ts"), &docs_index_content).ok();

        // 4) Write top-level index.ts
        let top_index_content = formatdoc!(
            "// AUTO-GENERATED — DO NOT EDIT.
             export {{ sidebarData }} from \"./sidebar.ts\";
             export {{ allDocs }} from \"./docs/index.ts\";
             export {{ wordStats, filteredStats }} from \"./word-stats.ts\";"
        );
        self.container.fs.write(&gen_dir.join("index.ts"), &top_index_content).ok();

        Ok(())
    }
}
