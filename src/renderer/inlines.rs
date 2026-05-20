use leptos::*;
use md_compiler::parser::ast::Node;

pub struct InlineRenderer;

impl InlineRenderer {
    pub fn render(nodes: &[Node]) -> View {
        view! {
            <>
                {nodes.iter().map(|n| {
                    match n {
                        Node::Text(text) => view! { {text} }.into_view(),
                        Node::InlineCode(code) => view! { <code>{code}</code> }.into_view(),
                        Node::Bold(c) => view! { <strong>{Self::render(c)}</strong> }.into_view(),
                        Node::Italic(c) => view! { <em>{Self::render(c)}</em> }.into_view(),
                        Node::Link { url, text } => view! { <a href=url>{text}</a> }.into_view(),
                        Node::Image { url, alt } => view! { <img src=url alt=alt /> }.into_view(),
                        _ => view! { <span></span> }.into_view(),
                    }
                }).collect::<Vec<_>>()}
            </>
        }
        .into_view()
    }
}
