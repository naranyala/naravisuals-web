use crate::core::Paths;
use crate::diagnostics::{Diagnostics, DiagnosticSource, Diagnostic};
use std::time::Instant;

#[derive(Clone, Debug)]
pub struct CompilerConfig {
    pub docs_dir: String,
    pub output_dir: String,
    pub site_url: String,
}

pub struct CompilationContext {
    pub config: CompilerConfig,
    pub diagnostics: Diagnostics,
    pub start_time: Instant,
}

impl CompilationContext {
    pub fn new(paths: &Paths) -> Self {
        Self::from_config(CompilerConfig {
            docs_dir: paths.root.join("docs").to_string_lossy().to_string(),
            output_dir: paths.root.join("src").join("generated").to_string_lossy().to_string(),
            site_url: "https://your-docs-site.com".to_string(), // TODO: config
        })
    }

    pub fn from_config(config: CompilerConfig) -> Self {
        Self {
            config,
            diagnostics: Diagnostics::new(),
            start_time: Instant::now(),
        }
    }

    pub fn report(&mut self, diag: Diagnostic) {
        self.diagnostics.report(diag);
    }

    pub fn error(&mut self, source: DiagnosticSource, file: &str, message: &str, detail: Option<&str>) {
        self.diagnostics.error(source, file, message, detail);
    }

    pub fn warn(&mut self, source: DiagnosticSource, file: &str, message: &str, detail: Option<&str>) {
        self.diagnostics.warn(source, file, message, detail);
    }

    pub fn info(&mut self, source: DiagnosticSource, file: &str, message: &str) {
        self.diagnostics.info(source, file, message);
    }
}
