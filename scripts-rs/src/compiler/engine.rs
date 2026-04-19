use std::fs;
use std::path::Path;
use walkdir::WalkDir;
use pulldown_cmark::{html, Options, Parser};

use crate::compiler::unit::CompilationUnit;
use crate::compiler::context::CompilationContext;
use crate::compiler::pipeline::CompilerMiddleware;
use crate::core::Logger;

pub struct DocumentationCompiler<P: CompilerMiddleware> {
    pub ctx: CompilationContext,
    pub units: Vec<CompilationUnit>,
    pub pipeline: P,
    pub logger: Logger,
}

impl<P: CompilerMiddleware> DocumentationCompiler<P> {
    pub fn new(ctx: CompilationContext, pipeline: P) -> Self {
        Self {
            ctx,
            units: Vec::new(),
            pipeline,
            logger: Logger::new(),
        }
    }

    pub fn compile(&mut self) -> anyhow::Result<()> {
        self.logger.raw("🚀 Starting Rust Documentation Compiler…");

        // 1. Ingest
        self.scan_directory(&self.ctx.config.docs_dir.clone(), "docs")?;

        // 2. Pre-Parse
        for unit in &mut self.units {
            self.pipeline.on_pre_parse(unit, &mut self.ctx);
        }

        // 3. Transform (Markdown -> Events -> HTML)
        for unit in &mut self.units {
            let mut options = Options::empty();
            options.insert(Options::ENABLE_TABLES);
            options.insert(Options::ENABLE_FOOTNOTES);
            options.insert(Options::ENABLE_STRIKETHROUGH);
            options.insert(Options::ENABLE_TASKLISTS);

            // Trigger on_transform (string-based)
            self.pipeline.on_transform(unit, &mut self.ctx);

            // Parse to events
            let parser = Parser::new_ext(&unit.content, options);
            let mut events: Vec<pulldown_cmark::Event> = parser.collect();

            // Capture AST (tree-based matching the frontend expectation)
            unit.ast = Some(crate::compiler::ast::events_to_ast(&events));

            // Trigger on_transform_events (token-aware)
            self.pipeline.on_transform_events(&mut events, &mut self.ctx);

            // Render events to HTML
            let mut html_output = String::new();
            html::push_html(&mut html_output, events.into_iter());
            unit.html = Some(html_output);

            // Trigger on_post_process (HTML-based)
            self.pipeline.on_post_process(unit, &mut self.ctx);
        }

        // 4. Assemble
        self.pipeline.on_assemble(&mut self.units, &mut self.ctx);

        // 5. Report
        println!("{}", self.ctx.diagnostics.format());
        if self.ctx.diagnostics.has_errors() {
            anyhow::bail!("Compilation failed due to errors.");
        }

        self.logger.raw(&format!("✨ Compilation finished in {:?}ms", self.ctx.start_time.elapsed().as_millis()));
        Ok(())
    }

    fn scan_directory(&mut self, base_dir: &str, section: &str) -> anyhow::Result<()> {
        let path = Path::new(base_dir);
        if !path.exists() {
            return Ok(());
        }

        for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
            if entry.file_type().is_file() && entry.file_name().to_string_lossy().ends_with(".md") {
                let rel_path = entry
                    .path()
                    .strip_prefix(path)?
                    .to_string_lossy()
                    .replace(".md", "");
                
                let raw_content = fs::read_to_string(entry.path())?;
                
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

                self.pipeline.on_ingest(&mut unit, &mut self.ctx);
                self.units.push(unit);
            }
        }

        Ok(())
    }
}
