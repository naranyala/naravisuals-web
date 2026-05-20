use crate::renderer::blocks::BlockRenderer;
use crate::renderer::inlines::InlineRenderer;
use leptos::*;
use md_compiler::parser::ast::Node;

pub struct RuntimeRenderer;

// #[cfg(test)]
// mod runtime_tests;

impl RuntimeRenderer {
    #[allow(unused_braces)]
    pub fn render(node: &Node) -> View {
        match node {
            Node::Document(children) => Self::render_nodes(children),

            Node::Heading { level, children } => {
                BlockRenderer::render_heading(*level as u8, children)
            }

            Node::Paragraph(children) => {
                view! { <p>{Self::render_inline(children)}</p> }.into_view()
            }

            Node::Text(text) => view! { {text} }.into_view(),

            Node::InlineCode(code) => view! { <code>{code}</code> }.into_view(),

            Node::CodeBlock { language, code } => {
                if language.as_deref() == Some("mermaid") {
                    view! { <div class="mermaid">{code}</div> }.into_view()
                } else {
                    let lang_class = language
                        .as_ref()
                        .map(|l| format!("language-{}", l))
                        .unwrap_or_default();
                    view! { <pre><code class=lang_class>{code}</code></pre> }.into_view()
                }
            }

            Node::Bold(children) => {
                view! { <strong>{Self::render_inline(children)}</strong> }.into_view()
            }

            Node::Italic(children) => {
                view! { <em>{Self::render_inline(children)}</em> }.into_view()
            }

            Node::Link { url, text } => view! { <a href=url>{text}</a> }.into_view(),

            Node::Image { url, alt } => view! { <img src=url alt=alt /> }.into_view(),

            Node::UnorderedList(items) => BlockRenderer::render_list(items, false),

            Node::OrderedList(items) => BlockRenderer::render_list(items, true),

            Node::ListItem(children) => {
                view! { <li>{Self::render_nodes(children)}</li> }.into_view()
            }

            Node::Blockquote(children) => {
                view! { <blockquote>{Self::render_nodes(children)}</blockquote> }.into_view()
            }

            Node::Table { headers, rows } => BlockRenderer::render_table(headers, rows),

            Node::HorizontalRule => view! { <hr /> }.into_view(),

            Node::Extension { name, children, .. } => view! {
                <div class=format!("extension-{}", name)>
                    {Self::render_nodes(children)}
                </div>
            }
            .into_view(),

            Node::RawHtml(html) => view! { <div inner_html=html /> }.into_view(),
        }
    }

    pub fn render_inline(children: &[Node]) -> View {
        InlineRenderer::render(children)
    }

    pub fn render_nodes(children: &[Node]) -> View {
        view! {
            <>
                {children.iter().map(Self::render).collect::<Vec<_>>()}
            </>
        }
        .into_view()
    }

    pub fn generate_id(children: &[Node]) -> String {
        children
            .iter()
            .filter_map(|n| {
                if let Node::Text(t) = n {
                    Some(t.clone())
                } else {
                    None
                }
            })
            .collect::<String>()
            .to_lowercase()
            .replace(' ', "-")
            .chars()
            .filter(|c| c.is_alphanumeric() || *c == '-')
            .collect()
    }
}
