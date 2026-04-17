use colored::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[allow(dead_code)]
pub enum DiagnosticSeverity {
    Error,
    Warning,
    Info,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[allow(dead_code)]
pub enum DiagnosticSource {
    Frontmatter,
    Links,
    Slugs,
    Plugin,
    Content,
    Build,
    Admonitions,
}

impl std::fmt::Display for DiagnosticSource {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DiagnosticSource::Frontmatter => write!(f, "frontmatter"),
            DiagnosticSource::Links => write!(f, "links"),
            DiagnosticSource::Slugs => write!(f, "slugs"),
            DiagnosticSource::Plugin => write!(f, "plugin"),
            DiagnosticSource::Content => write!(f, "content"),
            DiagnosticSource::Build => write!(f, "build"),
            DiagnosticSource::Admonitions => write!(f, "admonitions"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Diagnostic {
    pub severity: DiagnosticSeverity,
    pub source: DiagnosticSource,
    pub file: String,
    pub message: String,
    #[allow(dead_code)]
    pub line: Option<usize>, // Not used in current output format
    pub detail: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct Diagnostics {
    items: Vec<Diagnostic>,
}

impl Diagnostics {
    #[allow(dead_code)]
    pub fn new() -> Self {
        Self { items: Vec::new() }
    }

    #[allow(dead_code)]
    pub fn report(&mut self, diag: Diagnostic) {
        self.items.push(diag);
    }

    pub fn error(
        &mut self,
        source: DiagnosticSource,
        file: &str,
        message: &str,
        detail: Option<&str>,
    ) {
        self.items.push(Diagnostic {
            severity: DiagnosticSeverity::Error,
            source,
            file: file.to_string(),
            message: message.to_string(),
            line: None,
            detail: detail.map(|s| s.to_string()),
        });
    }

    pub fn warn(
        &mut self,
        source: DiagnosticSource,
        file: &str,
        message: &str,
        detail: Option<&str>,
    ) {
        self.items.push(Diagnostic {
            severity: DiagnosticSeverity::Warning,
            source,
            file: file.to_string(),
            message: message.to_string(),
            line: None,
            detail: detail.map(|s| s.to_string()),
        });
    }

    #[allow(dead_code)]
    pub fn info(&mut self, source: DiagnosticSource, file: &str, message: &str) {
        self.items.push(Diagnostic {
            severity: DiagnosticSeverity::Info,
            source,
            file: file.to_string(),
            message: message.to_string(),
            line: None,
            detail: None,
        });
    }

    #[allow(dead_code)]
    pub fn all(&self) -> &[Diagnostic] {
        &self.items
    }

    #[allow(dead_code)]
    pub fn errors(&self) -> Vec<&Diagnostic> {
        self.items
            .iter()
            .filter(|d| d.severity == DiagnosticSeverity::Error)
            .collect()
    }

    #[allow(dead_code)]
    pub fn warnings(&self) -> Vec<&Diagnostic> {
        self.items
            .iter()
            .filter(|d| d.severity == DiagnosticSeverity::Warning)
            .collect()
    }

    #[allow(dead_code)]
    pub fn has_errors(&self) -> bool {
        self.items
            .iter()
            .any(|d| d.severity == DiagnosticSeverity::Error)
    }

    pub fn summary(&self) -> (usize, usize, usize) {
        let mut errors = 0;
        let mut warnings = 0;
        let mut info = 0;
        for d in &self.items {
            match d.severity {
                DiagnosticSeverity::Error => errors += 1,
                DiagnosticSeverity::Warning => warnings += 1,
                DiagnosticSeverity::Info => info += 1,
            }
        }
        (errors, warnings, info)
    }

    pub fn format(&self) -> String {
        if self.items.is_empty() {
            return format!("{} No diagnostics", "✓".green());
        }

        let mut lines = Vec::new();
        for d in &self.items {
            let icon = match d.severity {
                DiagnosticSeverity::Error => "✗".red(),
                DiagnosticSeverity::Warning => "⚠".yellow(),
                DiagnosticSeverity::Info => "ℹ".blue(),
            };
            let sev_text = match d.severity {
                DiagnosticSeverity::Error => "ERROR".red().bold(),
                DiagnosticSeverity::Warning => "WARNING".yellow().bold(),
                DiagnosticSeverity::Info => "INFO".blue().bold(),
            };

            let header = format!("{} [{}] {} ({})", icon, sev_text, d.file.cyan(), d.source);
            lines.push(header);
            lines.push(format!("   {}", d.message));
            if let Some(detail) = &d.detail {
                lines.push(format!("   {}→ {}", " ".dimmed(), detail));
            }
        }

        let (errors, warnings, info) = self.summary();
        lines.push("".to_string());
        lines.push(format!(
            "{} Summary: {} error(s), {} warning(s), {} info",
            "".bold(),
            errors.to_string().red(),
            warnings.to_string().yellow(),
            info.to_string().blue()
        ));
        lines.join("\n")
    }

    pub fn to_json(&self) -> String {
        serde_json::to_string_pretty(&self).unwrap_or_else(|_| "[]".to_string())
    }
}

pub fn validate_code_block_descriptions(
    markdown_content: &str,
    file: &str,
    diags: &mut Diagnostics,
) {
    let lines: Vec<&str> = markdown_content.lines().collect();
    let mut in_code_block = false;
    let mut fence_char = ' ';
    let mut fence_length = 0;

    let desc_re = regex::Regex::new(r#"desc(?:ription)?\s*=\s*["']?([^"']+)["']?"#).unwrap();

    for (index, line) in lines.iter().enumerate() {
        let trimmed = line.trim_start();
        if trimmed.starts_with("```") || trimmed.starts_with("~~~") {
            if in_code_block {
                if trimmed.starts_with(fence_char) && trimmed.len() >= fence_length {
                    let rest = &trimmed[fence_length..];
                    if rest.is_empty() || rest.trim().is_empty() {
                        in_code_block = false;
                        continue;
                    }
                }
            } else {
                in_code_block = true;
                fence_char = trimmed.chars().next().unwrap();
                let match_fence = if trimmed.starts_with("```") {
                    "```"
                } else {
                    "~~~"
                };
                fence_length = trimmed
                    .chars()
                    .take_while(|&c| c == match_fence.chars().next().unwrap())
                    .count();

                let info_string = &trimmed[fence_length..];
                let has_desc = info_string.contains(":desc=")
                    || info_string.contains(":description=")
                    || desc_re.is_match(info_string);

                if !has_desc {
                    diags.warn(
                        DiagnosticSource::Content,
                        file,
                        "Missing description for code block",
                        Some(&format!("Line {}: Code blocks should include a description. Example: ```ts:desc=Description", index + 1)),
                    );
                }
            }
        }
    }
}

pub fn validate_frontmatter(fm: &HashMap<String, Value>, file: &str, diags: &mut Diagnostics) {
    if !fm.contains_key("title") {
        diags.error(
            DiagnosticSource::Frontmatter,
            file,
            "Missing required field: title",
            None,
        );
    }
    if !fm.contains_key("description") {
        diags.warn(
            DiagnosticSource::Frontmatter,
            file,
            "Missing recommended field: description",
            None,
        );
    }
}

pub fn validate_unique_slugs(entries: &[(String, String)], diags: &mut Diagnostics) {
    let mut seen = HashMap::new();
    for (id, slug) in entries {
        if let Some(existing) = seen.get(slug) {
            diags.error(
                DiagnosticSource::Slugs,
                id,
                &format!("Duplicate slug: \"{}\"", slug),
                Some(&format!(
                    "Also used by \"{}\". Each document must have a unique slug.",
                    existing
                )),
            );
        } else {
            seen.insert(slug.clone(), id.clone());
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diagnostics_reporting() {
        let mut diags = Diagnostics::new();
        diags.error(
            DiagnosticSource::Frontmatter,
            "file1.md",
            "Error message",
            Some("Detail"),
        );
        diags.warn(DiagnosticSource::Links, "file2.md", "Warn message", None);

        let (errors, warnings, info) = diags.summary();
        assert_eq!(errors, 1);
        assert_eq!(warnings, 1);
        assert_eq!(info, 0);
        assert!(diags.has_errors());
    }

    #[test]
    fn test_validate_frontmatter() {
        let mut diags = Diagnostics::new();

        // Test missing title (error)
        let mut fm_missing_title = HashMap::new();
        fm_missing_title.insert("description".to_string(), Value::String("desc".to_string()));
        validate_frontmatter(&fm_missing_title, "test.md", &mut diags);

        // Test missing description (warning)
        let mut fm_missing_desc = HashMap::new();
        fm_missing_desc.insert("title".to_string(), Value::String("title".to_string()));
        validate_frontmatter(&fm_missing_desc, "test.md", &mut diags);

        let (errors, warnings, _) = diags.summary();
        assert_eq!(errors, 1);
        assert_eq!(warnings, 1);
    }

    #[test]
    fn test_validate_unique_slugs() {
        let mut diags = Diagnostics::new();
        let entries = vec![
            ("file1.md".to_string(), "slug1".to_string()),
            ("file2.md".to_string(), "slug2".to_string()),
            ("file3.md".to_string(), "slug1".to_string()), // Duplicate
        ];
        validate_unique_slugs(&entries, &mut diags);

        let (errors, _, _) = diags.summary();
        assert_eq!(errors, 1);
        assert_eq!(diags.errors()[0].file, "file3.md");
    }

    #[test]
    fn test_validate_code_block_descriptions() {
        let mut diags = Diagnostics::new();

        let content_ok = "```ts:desc=Correct description\nlet x = 1;\n```";
        validate_code_block_descriptions(content_ok, "ok.md", &mut diags);

        let content_bad = "```ts\nlet x = 1;\n```";
        validate_code_block_descriptions(content_bad, "bad.md", &mut diags);

        let (_, warnings, _) = diags.summary();
        assert_eq!(warnings, 1);
        assert_eq!(diags.warnings()[0].file, "bad.md");
    }
}
