use regex::Regex;
use pulldown_cmark::Event;
use crate::compiler::pipeline::CompilerMiddleware;
use crate::compiler::unit::CompilationUnit;
use crate::compiler::container::CompilerContainer;

pub struct AdmonitionPlugin;

impl CompilerMiddleware for AdmonitionPlugin {
    fn name(&self) -> &'static str {
        "Admonitions"
    }

    fn on_transform_events<'a>(&mut self, events: &mut Vec<Event<'a>>, _container: &mut CompilerContainer) {
        let mut new_events = Vec::new();
        let mut i = 0;
        
        while i < events.len() {
            let event = &events[i];
            
            // Look for ::: at the start of a paragraph or as a standalone text
            if let Event::Text(text) = event {
                if text.starts_with(":::") {
                    // Very basic state machine for now, should be improved for full nesting
                    // To truly support nesting, we'd need to recursively process.
                }
            }
            
            new_events.push(events[i].clone());
            i += 1;
        }
        
        // For now, let's stick to the Regex pre-process but wrapped in on_pre_parse
        // to fulfill the "Middleware" requirement while we work on the event stream.
    }

    fn on_pre_parse(&mut self, unit: &mut CompilationUnit, _container: &mut CompilerContainer) {
        let re = Regex::new(r"(?m)^(:::|!!!)\s*(?P<type>\w+)\s*(?P<title>.*)\n(?P<body>[\s\S]*?)^(:::|!!!)").unwrap();

        let result = re.replace_all(&unit.content, |caps: &regex::Captures| {
            let t = &caps["type"];
            let title = caps["title"].trim();
            let body = &caps["body"];

            let class = match t {
                "tip" => "admonition-tip",
                "warning" => "admonition-warning",
                "note" => "admonition-note",
                "danger" => "admonition-danger",
                "info" => "admonition-info",
                "caution" => "admonition-caution",
                _ => "admonition-default",
            };

            let icon = match t {
                "tip" => "💡",
                "warning" => "⚠️",
                "note" => "ℹ️",
                "danger" => "🚫",
                "info" => "ℹ️",
                "caution" => "⚠️",
                _ => "📝",
            };

            let title_html = if !title.is_empty() {
                format!("<div class=\"admonition-heading\"><span class=\"admonition-icon\">{}</span> {}</div>", icon, title)
            } else {
                let label = t[0..1].to_uppercase() + &t[1..];
                format!("<div class=\"admonition-heading\"><span class=\"admonition-icon\">{}</span> {}</div>", icon, label)
            };

            format!(
                "<div class=\"admonition {}\">\n{}\n<div class=\"admonition-content\">\n{}\n</div>\n</div>",
                class, title_html, body
            )
        });

        unit.content = result.into_owned();
    }
}

pub struct MathPlugin;

impl CompilerMiddleware for MathPlugin {
    fn name(&self) -> &'static str {
        "Math"
    }

    fn on_pre_parse(&mut self, unit: &mut CompilationUnit, _container: &mut CompilerContainer) {
        // Protect display math: $$ ... $$
        let re_display = Regex::new(r"(?s)\$\$(.*?)\$\$").unwrap();
        let result = re_display.replace_all(&unit.content, |caps: &regex::Captures| {
            format!("<div class=\"math-display\">\\[{}\\]</div>", &caps[1])
        });
        unit.content = result.into_owned();

        // Protect inline math: $ ... $
        let re_inline = Regex::new(r"\$([^$\n]+)\$").unwrap();
        let result = re_inline.replace_all(&unit.content, |caps: &regex::Captures| {
            format!("<span class=\"math-inline\">\\({}\\)</span>", &caps[1])
        });
        unit.content = result.into_owned();
    }
}

pub struct MermaidPlugin;

impl CompilerMiddleware for MermaidPlugin {
    fn name(&self) -> &'static str {
        "Mermaid"
    }

    fn on_post_process(&mut self, unit: &mut CompilationUnit, _container: &mut CompilerContainer) {
        if let Some(html) = &unit.html {
            let mermaid_types = [
                "mermaid", "graph", "flowchart", "sequencediagram", "classdiagram", "statediagram", 
                "erdiagram", "gantt", "pie", "quadrantchart", "xychart", "mindmap", 
                "timeline", "journey", "requirementdiagram", "gitgraph", "sankey"
            ];
            
            let pattern = format!(
                r#"(?s)<pre><code class="language-(?:{})(?::desc=(?P<desc>[^">]+))?">(?P<diagram>.*?)</code></pre>"#,
                mermaid_types.join("|")
            );
            let re = Regex::new(&pattern).unwrap();

            let result = re.replace_all(html, |caps: &regex::Captures| {
                let raw_diagram = &caps["diagram"];
                // Unescape HTML entities from pulldown-cmark (e.g. &gt; -> >)
                let diagram = html_escape::decode_html_entities(raw_diagram).to_string();

                let desc = caps.name("desc").map(|m| m.as_str()).unwrap_or("");
                let desc_html = if !desc.is_empty() {
                    format!("<div class=\"mermaid-diagram-desc\">{}</div>", desc)
                } else {
                    "".to_string()
                };

                let zoom_btn_html = r#"      <button class="mermaid-zoom-btn" title="Zoom" aria-label="Zoom diagram">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
          <path d="M11 8v6"/>
          <path d="M8 11h6"/>
        </svg>
      </button>"#;

                let download_btn_html = r#"      <button class="mermaid-download-btn" title="Download SVG" aria-label="Download diagram SVG">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>"#;

                let code_btn_html = r#"      <button class="mermaid-code-btn" title="Show/Hide Mermaid Source" aria-label="Toggle diagram source code">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      </button>"#;

                format!(
                    r#"<div class="mermaid-diagram" data-processed="false" data-zoom="true">
  <div class="mermaid-diagram-header">
    <span class="mermaid-diagram-label">Diagram</span>
    <div class="mermaid-diagram-actions">
      {zoom_btn}
      {download_btn}
      {code_btn}
      <span class="mermaid-loading"><span class="mermaid-spinner"></span></span>
    </div>
  </div>
  <div class="mermaid" style="display:none;" data-source="{diag_escaped}">{diag_escaped}</div>
  {desc_html}
  <div class="mermaid-source-container" style="display:none;">
    <div class="mermaid-source-header">
      <span>Mermaid Notation</span>
      <button class="mermaid-source-copy-btn">Copy</button>
    </div>
    <pre class="mermaid-source-code"><code>{diag_escaped}</code></pre>
  </div>
  <div class="mermaid-error" style="display:none;"></div>
</div>"#,
                    zoom_btn = zoom_btn_html,
                    download_btn = download_btn_html,
                    code_btn = code_btn_html,
                    diag_escaped = diagram.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;"),
                    desc_html = desc_html
                )
            });
            unit.html = Some(result.into_owned());
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::unit::CompilationUnit;
    use crate::compiler::container::CompilerContainer;
    use crate::compiler::context::CompilerConfig;
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

    fn create_test_container(temp_dir: &tempfile::TempDir) -> CompilerContainer {
        let config = CompilerConfig {
            docs_dir: temp_dir.path().join("docs").to_string_lossy().to_string(),
            output_dir: temp_dir.path().join("out").to_string_lossy().to_string(),
            site_url: "http://localhost".to_string(),
        };
        CompilerContainer::new(config, None)
    }

    #[test]
    fn test_admonition_plugin() {
        let mut plugin = AdmonitionPlugin;
        let mut unit = create_test_unit(":::tip My Tip\nThis is the body\n:::");
        let dir = tempdir().unwrap();
        let mut container = create_test_container(&dir);
        
        plugin.on_pre_parse(&mut unit, &mut container);
        
        assert!(unit.content.contains("admonition-tip"));
        assert!(unit.content.contains("💡"));
        assert!(unit.content.contains("My Tip"));
        assert!(unit.content.contains("This is the body"));
    }

    #[test]
    fn test_math_plugin() {
        let mut plugin = MathPlugin;
        let mut unit = create_test_unit("Inline $E=mc^2$ and block:\n$$\nx^2 + y^2 = z^2\n$$");
        let dir = tempdir().unwrap();
        let mut container = create_test_container(&dir);
        
        plugin.on_pre_parse(&mut unit, &mut container);
        
        assert!(unit.content.contains("<span class=\"math-inline\">\\(E=mc^2\\)</span>"));
        assert!(unit.content.contains("<div class=\"math-display\">\\[\nx^2 + y^2 = z^2\n\\]</div>"));
    }

    #[test]
    fn test_mermaid_plugin() {
        let mut plugin = MermaidPlugin;
        let mut unit = create_test_unit("");
        unit.html = Some("<pre><code class=\"language-mermaid:desc=My Diagram\">graph TD\nA-->B</code></pre>".to_string());
        let dir = tempdir().unwrap();
        let mut container = create_test_container(&dir);
        
        plugin.on_post_process(&mut unit, &mut container);
        
        let html = unit.html.unwrap();
        assert!(html.contains("mermaid-diagram"));
        assert!(html.contains("My Diagram"));
        assert!(html.contains("mermaid-code-btn"));
        assert!(html.contains("mermaid-source-container"));
        assert!(html.contains("graph TD"));
    }
}
