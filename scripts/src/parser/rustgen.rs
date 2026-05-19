use crate::parser::ast::Node;
use crate::plugins::PluginRegistry;

/// Generate Rust/Leptos code from AST
pub struct RustGenerator {
    plugins: PluginRegistry,
    indent: usize,
}

impl RustGenerator {
    pub fn new(plugins: PluginRegistry) -> Self {
        Self { plugins, indent: 0 }
    }
    
    pub fn generate(&self, ast: &Node, component_name: &str) -> String {
        let mut code = String::new();
        code.push_str("use leptos::*;\n\n");
        code.push_str(&format!("#[component]\n"));
        code.push_str(&format!("pub fn {}() -> impl IntoView {{\n", component_name));
        code.push_str("    view! {\n");
        
        let mut gen = RustGenerator {
            plugins: PluginRegistry::new(),
            indent: 3,
        };
        
        code.push_str(&gen.render_node(ast));
        code.push_str("    }\n");
        code.push_str("}\n");
        
        code
    }
    
    fn indent(&self) -> String {
        "    ".repeat(self.indent)
    }
    
    fn render_node(&mut self, node: &Node) -> String {
        // Check plugins first
        if let Some(html) = self.plugins.render_node(node) {
            return html;
        }
        
        match node {
            Node::Document(children) => {
                children.iter()
                    .filter(|n| !n.is_empty_text())
                    .map(|n| self.render_node(n))
                    .collect::<Vec<_>>()
                    .join("\n")
            }
            
            Node::Heading { level, children } => {
                let id = heading_id(children);
                let inner = self.render_inline(children);
                format!(
                    "{}<h{} id=\"{}\">{}</h{}>",
                    self.indent(), level, id, inner, level
                )
            }
            
            Node::Paragraph(children) => {
                let inner = self.render_inline(children);
                format!("{}<p>{}</p>", self.indent(), inner)
            }
            
            Node::Text(text) => {
                format!("{}\"{}\"", self.indent(), escape_rust_string(text))
            }
            
            Node::InlineCode(code) => {
                format!("{}<code>\"{}\"</code>", self.indent(), escape_rust_string(code))
            }
            
            Node::CodeBlock { language, code } => {
                let lang = language.as_deref().unwrap_or("");
                let class = if lang.is_empty() {
                    String::new()
                } else {
                    format!(" class=\"language-{}\"", lang)
                };
                // Use raw string for code blocks to preserve formatting
                format!(
                    "{}<pre{}><code class=\"language-{}\">\"{}\"</code></pre>",
                    self.indent(), class, lang, escape_rust_string(code)
                )
            }
            
            Node::Bold(children) => {
                let inner = self.render_inline(children);
                format!("<strong>{}</strong>", inner)
            }
            
            Node::Italic(children) => {
                let inner = self.render_inline(children);
                format!("<em>{}</em>", inner)
            }
            
            Node::Link { url, text } => {
                format!("<a href=\"{}\">\"{}\"</a>", url, escape_rust_string(text))
            }
            
            Node::Image { url, alt } => {
                format!("{}<img src=\"{}\" alt=\"{}\" />", self.indent(), url, escape_rust_string(alt))
            }
            
            Node::UnorderedList(items) => {
                let mut out = format!("{}<ul>\n", self.indent());
                let old_indent = self.indent;
                self.indent += 1;
                for item in items {
                    out.push_str(&self.render_list_item(item));
                }
                self.indent = old_indent;
                out.push_str(&format!("{}</ul>", self.indent()));
                out
            }
            
            Node::OrderedList(items) => {
                let mut out = format!("{}<ol>\n", self.indent());
                let old_indent = self.indent;
                self.indent += 1;
                for item in items {
                    out.push_str(&self.render_list_item(item));
                }
                self.indent = old_indent;
                out.push_str(&format!("{}</ol>", self.indent()));
                out
            }
            
            Node::Blockquote(children) => {
                let inner: String = children.iter().map(|n| self.render_node(n)).collect();
                format!("{}<blockquote>{}</blockquote>", self.indent(), inner)
            }
            
            Node::HorizontalRule => {
                format!("{}<hr />", self.indent())
            }
            
            Node::Extension { name, attributes: _, children, content: _ } => {
                // Try plugins
                if let Some(html) = self.plugins.render_extension(node) {
                    return html;
                }
                // Fallback: render children
                children.iter().map(|n| self.render_node(n)).collect()
            }
            
            Node::RawHtml(html) => {
                format!("{}<div inner_html=\"{}\" />", self.indent(), escape_rust_string(html))
            }
            
            _ => String::new(),
        }
    }
    
    fn render_list_item(&mut self, item: &crate::parser::ast::ListItem) -> String {
        let inner: String = item.0.iter().map(|n| self.render_node(n)).collect();
        format!("{}<li>{}</li>\n", self.indent(), inner)
    }
    
    fn render_inline(&mut self, children: &[Node]) -> String {
        children.iter().map(|n| {
            match n {
                Node::Text(text) => format!("\"{}\"", escape_rust_string(text)),
                Node::InlineCode(code) => format!("<code>\"{}\"</code>", escape_rust_string(code)),
                Node::Bold(c) => format!("<strong>{}</strong>", self.render_inline(c)),
                Node::Italic(c) => format!("<em>{}</em>", self.render_inline(c)),
                Node::Link { url, text } => format!("<a href=\"{}\">\"{}\"</a>", url, escape_rust_string(text)),
                Node::Image { url, alt } => format!("<img src=\"{}\" alt=\"{}\" />", url, escape_rust_string(alt)),
                _ => String::new(),
            }
        }).collect::<Vec<_>>().join("")
    }
}

fn heading_id(children: &[Node]) -> String {
    let text: String = children.iter().filter_map(|n| {
        if let Node::Text(t) = n { Some(t.clone()) } else { None }
    }).collect();
    
    text.to_lowercase()
        .replace(' ', "-")
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '-')
        .collect()
}

fn escape_rust_string(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('"', "\\\"")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
        .replace('\t', "\\t")
}
