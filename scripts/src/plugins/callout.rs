use crate::parser::ast::Node;
use crate::plugins::MarkdownPlugin;

/// Callout plugin for :::note, :::warning, :::tip, etc.
pub struct CalloutPlugin;

impl MarkdownPlugin for CalloutPlugin {
    fn name(&self) -> &str {
        "callout"
    }
    
    fn render_extension_rust(&self, node: &Node) -> Option<String> {
        if let Node::Extension { name, children, .. } = node {
            let callout_type = name.to_lowercase();
            
            let (icon, class) = match callout_type.as_str() {
                "note" => ("ℹ️", "callout-note"),
                "warning" => ("⚠️", "callout-warning"),
                "tip" => ("💡", "callout-tip"),
                "info" => ("ℹ️", "callout-info"),
                "danger" => ("🚨", "callout-danger"),
                "example" => ("📝", "callout-example"),
                _ => return None,
            };
            
            let content = render_children_rust(children);
            
            Some(format!(
                r#"<div class="callout {class}">
                    <div class="callout-header">
                        <span class="callout-icon">"{icon}"</span>
                        <span class="callout-title">"{title}"</span>
                    </div>
                    <div class="callout-content">
                        {content}
                    </div>
                </div>"#,
                class = class,
                icon = icon,
                title = name.to_uppercase(),
                content = content
            ))
        } else {
            None
        }
    }
}

fn render_children_rust(children: &[Node]) -> String {
    children.iter().map(|n| render_node_rust(n)).collect::<Vec<_>>().join("\n")
}

fn render_node_rust(node: &Node) -> String {
    match node {
        Node::Paragraph(c) => {
            let inner = render_inline_rust(c);
            format!("<p>{}</p>", inner)
        }
        Node::Text(t) => format!("\"{}\"", escape_rust_string(t)),
        Node::Heading { level, children } => {
            let inner = render_inline_rust(children);
            format!("<h{level}>{inner}</h{level}>")
        }
        Node::CodeBlock { language, code } => {
            let lang = language.as_deref().unwrap_or("");
            format!("<pre><code class=\"language-{}\">\"{}\"</code></pre>", lang, escape_rust_string(code))
        }
        Node::InlineCode(c) => format!("<code>\"{}\"</code>", escape_rust_string(c)),
        Node::Bold(c) => format!("<strong>{}</strong>", render_inline_rust(c)),
        Node::Italic(c) => format!("<em>{}</strong>", render_inline_rust(c)),
        Node::Link { url, text } => format!("<a href=\"{}\">\"{}\"</a>", url, escape_rust_string(text)),
        Node::UnorderedList(items) => {
            let items_str = items.iter().map(|item| {
                let inner = render_children_rust(&item.children);
                format!("<li>{}</li>", inner)
            }).collect::<Vec<_>>().join("");
            format!("<ul>{}</ul>", items_str)
        }
        Node::OrderedList(items) => {
            let items_str = items.iter().map(|item| {
                let inner = render_children_rust(&item.children);
                format!("<li>{}</li>", inner)
            }).collect::<Vec<_>>().join("");
            format!("<ol>{}</ol>", items_str)
        }
        Node::Blockquote(c) => format!("<blockquote>{}</blockquote>", render_children_rust(c)),
        _ => String::new(),
    }
}

fn render_inline_rust(nodes: &[Node]) -> String {
    nodes.iter().map(|n| {
        match n {
            Node::Text(t) => format!("\"{}\"", escape_rust_string(t)),
            Node::InlineCode(c) => format!("<code>\"{}\"</code>", escape_rust_string(c)),
            Node::Bold(c) => format!("<strong>{}</strong>", render_inline_rust(c)),
            Node::Italic(c) => format!("<em>{}</em>", render_inline_rust(c)),
            Node::Link { url, text } => format!("<a href=\"{}\">\"{}\"</a>", url, escape_rust_string(text)),
            _ => String::new(),
        }
    }).collect::<Vec<_>>().join("")
}

fn escape_rust_string(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('"', "\\\"")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
        .replace('\t', "\\t")
}
