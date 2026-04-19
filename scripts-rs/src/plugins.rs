use regex::Regex;

#[allow(dead_code)]
pub trait Plugin {
    fn name(&self) -> &str;
    fn pre_process(&self, content: &mut String) {}
    fn post_process(&self, html: &mut String) {}
}

pub struct AdmonitionPlugin;

impl Plugin for AdmonitionPlugin {
    fn name(&self) -> &str {
        "Admonitions"
    }

    fn pre_process(&self, content: &mut String) {
        let re =
            Regex::new(r"(?m)^:::(?P<type>\w+)\s*(?P<title>.*)\n(?P<body>[\s\S]*?)^:::").unwrap();

        let result = re.replace_all(content, |caps: &regex::Captures| {
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

        *content = result.into_owned();
    }
}

pub struct MathPlugin;

impl Plugin for MathPlugin {
    fn name(&self) -> &str {
        "Math"
    }

    fn pre_process(&self, content: &mut String) {
        // Protect display math: $$ ... $$
        let re_display = Regex::new(r"(?s)\$\$(.*?)\$\$").unwrap();
        let result = re_display.replace_all(content, |caps: &regex::Captures| {
            format!("<div class=\"math-display\">\\[{}\\]</div>", &caps[1])
        });
        *content = result.into_owned();

        // Protect inline math: $ ... $
        let re_inline = Regex::new(r"\$([^$\n]+)\$").unwrap();
        let result = re_inline.replace_all(content, |caps: &regex::Captures| {
            format!("<span class=\"math-inline\">\\({}\\)</span>", &caps[1])
        });
        *content = result.into_owned();
    }
}

pub struct MermaidPlugin;

impl Plugin for MermaidPlugin {
    fn name(&self) -> &str {
        "Mermaid"
    }

    fn post_process(&self, html: &mut String) {
        // Match mermaid code blocks
        // The HTML from pulldown-cmark for a code block looks like:
        // <pre><code class="language-mermaid">...</code></pre>
        let re = Regex::new(r#"(?s)<pre><code class="language-mermaid(?::desc=(?P<desc>[^">]+))?">(?P<diagram>.*?)</code></pre>"#).unwrap();

        let result = re.replace_all(html, |caps: &regex::Captures| {
            let diagram = &caps["diagram"];
            let desc = caps.name("desc").map(|m| m.as_str()).unwrap_or("");
            let desc_html = if !desc.is_empty() {
                format!("<div class=\"mermaid-diagram-desc\">{}</div>", desc)
            } else {
                "".to_string()
            };

            format!(
                "<div class=\"mermaid-diagram\" data-processed=\"false\" data-zoom=\"true\">\n  <div class=\"mermaid-diagram-header\">\n    <span class=\"mermaid-diagram-label\">Diagram</span>\n    <div class=\"mermaid-diagram-actions\">\n      <button class=\"mermaid-zoom-btn\" title=\"Zoom\" aria-label=\"Zoom diagram\">🔍</button>\n      <button class=\"mermaid-download-btn\" title=\"Download SVG\" aria-label=\"Download diagram SVG\">💾</button>\n      <span class=\"mermaid-loading\"><span class=\"mermaid-spinner\"></span></span>\n    </div>\n  </div>\n  <div class=\"mermaid\" style=\"display:none;\">{}</div>\n  {}\n  <div class=\"mermaid-error\" style=\"display:none;\"></div>\n</div>",
                diagram, desc_html
            )
        });

        *html = result.into_owned();
    }
}

pub fn get_plugins() -> Vec<Box<dyn Plugin>> {
    vec![
        Box::new(MathPlugin),
        Box::new(AdmonitionPlugin),
        Box::new(MermaidPlugin),
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_math_plugin() {
        let plugin = MathPlugin;
        let mut content = "Inline $E=mc^2$ and block:\n$$\nx^2 + y^2 = z^2\n$$".to_string();
        plugin.pre_process(&mut content);
        assert!(content.contains("<span class=\"math-inline\">\\(E=mc^2\\)</span>"));
        assert!(content.contains("<div class=\"math-display\">\\[\nx^2 + y^2 = z^2\n\\]</div>"));
    }

    #[test]
    fn test_admonition_plugin() {
        let plugin = AdmonitionPlugin;
        let mut content = ":::tip My Tip\nThis is the body\n:::".to_string();
        plugin.pre_process(&mut content);
        assert!(content.contains("admonition-tip"));
        assert!(content.contains("💡"));
        assert!(content.contains("My Tip"));
        assert!(content.contains("This is the body"));
    }

    #[test]
    fn test_mermaid_plugin() {
        let plugin = MermaidPlugin;
        let mut html = "<pre><code class=\"language-mermaid:desc=My Diagram\">graph TD\nA-->B</code></pre>".to_string();
        plugin.post_process(&mut html);
        assert!(html.contains("mermaid-diagram"));
        assert!(html.contains("My Diagram"));
        assert!(html.contains("graph TD"));
    }
}
