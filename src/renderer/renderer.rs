use leptos::*;
use crate::renderer::ast::Node;

pub struct RuntimeRenderer;

impl RuntimeRenderer {
    pub fn render(node: &Node) -> View {
        match node {
            Node::Document(children) => {
                view! {
                    <>
                        {children.iter().map(|n| Self::render(n)).collect::<Vec<_>>()}
                    </>
                }.into_view()
            }
            
            Node::Heading { level, children } => {
                let id = Self::generate_id(children);
                let inner = Self::render_inline(children);
                match level {
                    1 => view! { <h1 id=id>{inner}</h1> }.into_view(),
                    2 => view! { <h2 id=id>{inner}</h2> }.into_view(),
                    3 => view! { <h3 id=id>{inner}</h3> }.into_view(),
                    4 => view! { <h4 id=id>{inner}</h4> }.into_view(),
                    5 => view! { <h5 id=id>{inner}</h5> }.into_view(),
                    _ => view! { <h6 id=id>{inner}</h6> }.into_view(),
                }
            }
            
            Node::Paragraph(children) => {
                view! { <p>{Self::render_inline(children)}</p> }.into_view()
            }
            
            Node::Text(text) => view! { {text} }.into_view(),
            
            Node::InlineCode(code) => view! { <code>{code}</code> }.into_view(),
            
            Node::CodeBlock { language, code } => {
                let lang_class = language.as_ref().map(|l| format!("language-{}", l)).unwrap_or_default();
                view! { <pre><code class=lang_class>{code}</code></pre> }.into_view()
            }
            
            Node::Bold(children) => {
                view! { <strong>{Self::render_inline(children)}</strong> }.into_view()
            }
            
            Node::Italic(children) => {
                view! { <em>{Self::render_inline(children)}</em> }.into_view()
            }
            
            Node::Link { url, text } => {
                view! { <a href=url>{text}</a> }.into_view()
            }
            
            Node::Image { url, alt } => {
                view! { <img src=url alt=alt /> }.into_view()
            }
            
            Node::UnorderedList(items) => {
                view! { 
                    <ul>
                        {items.iter().map(|item| {
                            view! { <li>{Self::render_children(&item.0)}</li> }.into_view()
                        }).collect::<Vec<_>>()}
                    </ul> 
                }.into_view()
            }
            
            Node::OrderedList(items) => {
                view! { 
                    <ol>
                        {items.iter().map(|item| {
                            view! { <li>{Self::render_children(&item.0)}</li> }.into_view()
                        }).collect::<Vec<_>>()}
                    </ol> 
                }.into_view()
            }
            
            Node::Blockquote(children) => {
                view! { <blockquote>{Self::render_children(children)}</blockquote> }.into_view()
            }
            
            Node::HorizontalRule => view! { <hr /> }.into_view(),
            
            Node::Extension { name, children, .. } => {
                view! { 
                    <div class=format!("extension-{}", name)>
                        {Self::render_children(children)}
                    </div> 
                }.into_view()
            }
            
            Node::RawHtml(html) => {
                view! { <div inner_html=html /> }.into_view()
            }
        }
    }
    
    fn render_inline(children: &[Node]) -> View {
        view! {
            <>
                {children.iter().map(|n| {
                    match n {
                        Node::Text(text) => view! { {text} }.into_view(),
                        Node::InlineCode(code) => view! { <code>{code}</code> }.into_view(),
                        Node::Bold(c) => view! { <strong>{Self::render_inline(c)}</strong> }.into_view(),
                        Node::Italic(c) => view! { <em>{Self::render_inline(c)}</em> }.into_view(),
                        Node::Link { url, text } => view! { <a href=url>{text}</a> }.into_view(),
                        _ => view! { <span></span> }.into_view(),
                    }
                }).collect::<Vec<_>>()}
            </>
        }.into_view()
    }
    
    fn render_children(children: &[Node]) -> View {
        view! {
            <>
                {children.iter().map(|n| Self::render(n)).collect::<Vec<_>>()}
            </>
        }.into_view()
    }
    
    fn generate_id(children: &[Node]) -> String {
        children.iter().filter_map(|n| {
            if let Node::Text(t) = n { Some(t.clone()) } else { None }
        }).collect::<String>()
        .to_lowercase()
        .replace(' ', "-")
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '-')
        .collect()
    }
}
