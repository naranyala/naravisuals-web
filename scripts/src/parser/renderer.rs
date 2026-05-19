use crate::parser::ast::Node;
use crate::plugins::PluginRegistry;

/// Render AST to HTML with plugin support
pub struct Renderer {
    plugins: PluginRegistry,
}

impl Renderer {
    pub fn new(plugins: PluginRegistry) -> Self {
        Self { plugins }
    }
    
    pub fn render(&self, node: &Node) -> String {
        // Check if any plugin wants to handle this node
        if let Some(html) = self.plugins.render_node(node) {
            return html;
        }
        
        match node {
            Node::Document(children) => {
                let html: String = children.iter().map(|n| self.render(n)).collect();
                self.plugins.postprocess(&html)
            }
            
            Node::Heading { level, children } => {
                let id = heading_id(children);
                let inner: String = children.iter().map(|n| render_inline(n)).collect();
                format!("<h{} id=\"{}\">{}</h{}>", level, id, inner, level)
            }
            
            Node::Paragraph(children) => {
                let inner: String = children.iter().map(|n| render_inline(n)).collect();
                format!("<p>{}</p>", inner)
            }
            
            Node::Text(text) => escape_html(text),
            
            Node::InlineCode(code) => format!("<code>{}</code>", escape_html(code)),
            
            Node::CodeBlock { language, code } => {
                let lang = language.as_deref().unwrap_or("");
                let lang_attr = if lang.is_empty() {
                    String::new()
                } else {
                    format!(" class=\"language-{}\"", lang)
                };
                format!("<pre><code{}>{}</code></pre>", lang_attr, escape_html(code))
            }
            
            Node::Bold(children) => {
                let inner: String = children.iter().map(|n| render_inline(n)).collect();
                format!("<strong>{}</strong>", inner)
            }
            
            Node::Italic(children) => {
                let inner: String = children.iter().map(|n| render_inline(n)).collect();
                format!("<em>{}</em>", inner)
            }
            
            Node::Link { url, children } => {
                let inner: String = children.iter().map(|n| render_inline(n)).collect();
                format!("<a href=\"{}\">{}</a>", url, inner)
            }
            
            Node::Image { url, alt } => {
                format!("<img src=\"{}\" alt=\"{}\" />", url, escape_html(alt))
            }
            
            Node::UnorderedList(items) => {
                let items_html: String = items.iter().map(|item| {
                    let inner: String = item.0.iter().map(|n| self.render(n)).collect();
                    format!("<li>{}</li>", inner)
                }).collect();
                format!("<ul>{}</ul>", items_html)
            }
            
            Node::OrderedList(items) => {
                let items_html: String = items.iter().map(|item| {
                    let inner: String = item.0.iter().map(|n| self.render(n)).collect();
                    format!("<li>{}</li>", inner)
                }).collect();
                format!("<ol>{}</ol>", items_html)
            }
            
            Node::ListItem(children) => {
                let inner: String = children.iter().map(|n| self.render(n)).collect();
                format!("<li>{}</li>", inner)
            }
            
            Node::Blockquote(children) => {
                let inner: String = children.iter().map(|n| self.render(n)).collect();
                format!("<blockquote>{}</blockquote>", inner)
            }
            
            Node::HorizontalRule => "<hr />".to_string(),
            
            Node::Extension { .. } => {
                // Try to render with plugins
                if let Some(html) = self.plugins.render_extension(node) {
                    return html;
                }
                // Fallback: render children
                if let Node::Extension { children, .. } = node {
                    children.iter().map(|n| self.render(n)).collect()
                } else {
                    String::new()
                }
            }
            
            Node::RawHtml(html) => html.clone(),
        }
    }
}

fn heading_id(children: &[Node]) -> String {
    let text: String = children.iter().filter_map(|n| {
        if let Node::Text(t) = n {
            Some(t.clone())
        } else {
            None
        }
    }).collect();
    
    text.to_lowercase()
        .replace(' ', "-")
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '-')
        .collect()
}

fn render_inline(node: &Node) -> String {
    match node {
        Node::Text(text) => escape_html(text),
        Node::InlineCode(code) => format!("<code>{}</code>", escape_html(code)),
        Node::Bold(children) => {
            let inner: String = children.iter().map(|n| render_inline(n)).collect();
            format!("<strong>{}</strong>", inner)
        }
        Node::Italic(children) => {
            let inner: String = children.iter().map(|n| render_inline(n)).collect();
            format!("<em>{}</em>", inner)
        }
        Node::Link { url, children } => {
            let inner: String = children.iter().map(|n| render_inline(n)).collect();
            format!("<a href=\"{}\">{}</a>", url, inner)
        }
        Node::Image { url, alt } => {
            format!("<img src=\"{}\" alt=\"{}\" />", url, escape_html(alt))
        }
        _ => String::new(),
    }
}

fn escape_html(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}
