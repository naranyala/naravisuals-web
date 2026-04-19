use colored::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::{HashMap, HashSet};

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

pub fn validate_internal_links(
    content: &str,
    known_slugs: &HashSet<String>,
    file: &str,
    diags: &mut Diagnostics,
) {
    let link_re = regex::Regex::new(r"\[([^\]]*)\]\(([^)]+)\)").unwrap();
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

pub struct AdmonitionStats {
    pub total: usize,
    pub by_type: HashMap<String, usize>,
}

pub struct AdmonitionAnalysis {
    pub file: String,
    pub stats: AdmonitionStats,
    pub has_admonitions: bool,
    pub recommendations: Vec<String>,
}

pub fn analyze_admonitions(
    markdown_content: &str,
    file: &str,
    _diags: &mut Diagnostics,
) -> AdmonitionAnalysis {
    let admonition_regex = regex::Regex::new(r":::(\w+)").unwrap();
    let mut types = HashMap::new();
    let mut total = 0;

    for cap in admonition_regex.captures_iter(markdown_content) {
        let t = cap[1].to_lowercase();
        *types.entry(t).or_insert(0) += 1;
        total += 1;
    }

    AdmonitionAnalysis {
        file: file.to_string(),
        stats: AdmonitionStats { total, by_type: types },
        has_admonitions: total > 0,
        recommendations: Vec::new(),
    }
}

#[derive(Clone)]
pub struct ContentStats {
    pub code_blocks: usize,
    pub mermaid_blocks: usize,
    pub admonitions: usize,
    pub references: usize,
    pub footnotes: usize,
}

pub struct ContentAnalysis {
    pub file: String,
    pub stats: ContentStats,
    pub recommendations: Vec<String>,
}

pub fn analyze_content(
    markdown_content: &str,
    file: &str,
    _diags: &mut Diagnostics,
) -> ContentAnalysis {
    let mut stats = ContentStats {
        code_blocks: 0,
        mermaid_blocks: 0,
        admonitions: 0,
        references: 0,
        footnotes: 0,
    };

    let code_re = regex::Regex::new(r"(?m)^```(\w+)?").unwrap();
    for cap in code_re.captures_iter(markdown_content) {
        stats.code_blocks += 1;
        if let Some(lang) = cap.get(1) {
            if lang.as_str().to_lowercase() == "mermaid" {
                stats.mermaid_blocks += 1;
            }
        }
    }

    let adm_re = regex::Regex::new(r":::(\w+)").unwrap();
    stats.admonitions = adm_re.find_iter(markdown_content).count();

    let ref_re = regex::Regex::new(r"\[([^\]]+)\]\(([^)]+)\)").unwrap();
    for cap in ref_re.captures_iter(markdown_content) {
        let href = &cap[2];
        if !href.starts_with('/') && !href.starts_with('#') {
            stats.references += 1;
        }
    }

    let foot_re = regex::Regex::new(r"\[\^(\w+)\]").unwrap();
    stats.footnotes = foot_re.find_iter(markdown_content).count();

    ContentAnalysis {
        file: file.to_string(),
        stats,
        recommendations: Vec::new(),
    }
}

pub struct ReportGenerator {
    sections: Vec<ReportSection>,
    diagnostics: Diagnostics,
}

struct ReportSection {
    title: String,
    subtitle: Option<String>,
    content: Vec<String>,
}

impl ReportGenerator {
    pub fn new() -> Self {
        Self {
            sections: Vec::new(),
            diagnostics: Diagnostics::new(),
        }
    }

    pub fn add_diagnostic(&mut self, diag: Diagnostic) {
        self.diagnostics.report(diag);
    }

    pub fn add_section(&mut self, title: &str, subtitle: Option<&str>) -> usize {
        let section = ReportSection {
            title: title.to_string(),
            subtitle: subtitle.map(|s| s.to_string()),
            content: Vec::new(),
        };
        self.sections.push(section);
        self.sections.len() - 1
    }

    pub fn add_line(&mut self, section_idx: usize, line: &str) {
        if let Some(section) = self.sections.get_mut(section_idx) {
            section.content.push(line.to_string());
        }
    }

    pub fn print(&self) {
        // 1. Print formal validation issues
        for d in &self.diagnostics.items {
            let icon = match d.severity {
                DiagnosticSeverity::Error => "✗".red(),
                DiagnosticSeverity::Warning => "⚠".yellow(),
                DiagnosticSeverity::Info => "ℹ".blue(),
            };
            let sev_text = match d.severity {
                DiagnosticSeverity::Error => "[ERROR]".red().bold(),
                DiagnosticSeverity::Warning => "[WARN]".yellow().bold(),
                DiagnosticSeverity::Info => "[INFO]".cyan().bold(),
            };

            println!("{}  {} ({})", icon, d.file.dimmed(), d.source.to_string().dimmed());
            println!("       {}", d.message);
            if let Some(detail) = &d.detail {
                println!("       {} {}", "→".dimmed(), detail.dimmed());
            }
            println!();
        }

        // 2. Print analysis sections
        for section in &self.sections {
            println!("\n{}", section.title.cyan().bold());
            if let Some(sub) = &section.subtitle {
                println!("{}", sub.dimmed());
            }
            println!("{}", "═".repeat(60).dimmed());

            for l in &section.content {
                println!("{}", l);
            }
        }

        // 3. Print global summary
        let (errors, warnings, info) = self.diagnostics.summary();
        if errors > 0 || warnings > 0 || info > 0 || !self.sections.is_empty() {
            self.print_summary();
        }
    }

    fn print_summary(&self) {
        println!();
        println!("{}", "─".repeat(80).dimmed());

        let (errors, warnings, info) = self.diagnostics.summary();
        let total = errors + warnings + info;
        print!("{}  ", format!("Total Issues: {}", total).bold());
        print!("| {} errors ", errors.to_string().red());
        print!("| {} warnings ", warnings.to_string().yellow());
        println!("| {} info", info.to_string().cyan());
        println!();
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
