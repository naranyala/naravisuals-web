use leptos::*;
use leptos_router::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = applyCodeEnhancements)]
    fn apply_code_enhancements();
}

use crate::utils::search::render_markdown_with_heading_ids;
use crate::docs_data::DOCS;

#[component]
pub fn MarkdownContent() -> impl IntoView {
    let params = use_params_map();
    let filename = move || {
        params.with(|p| p.get("filename").cloned().unwrap_or_default())
    };

    let current_index = move || {
        let f = filename();
        DOCS.iter().position(|entry| entry.path == f).unwrap_or(0)
    };

    let content = move || {
        let idx = current_index();
        DOCS.get(idx).map(|entry| entry.content).unwrap_or("Article not found")
    };

    let prev_article = move || {
        let idx = current_index();
        if idx > 0 {
            Some(&DOCS[idx - 1])
        } else {
            None
        }
    };

    let next_article = move || {
        let idx = current_index();
        if idx < DOCS.len() - 1 {
            Some(&DOCS[idx + 1])
        } else {
            None
        }
    };

    create_effect(move |_| {
        content();
        apply_code_enhancements();
    });

    view! {
        <div class="markdown-container">
            <div class="markdown-body">
                {move || {
                    let text = content();
                    let html_output = render_markdown_with_heading_ids(&text);
                    view! { <div inner_html=html_output></div> }.into_view()
                }}
            </div>
            <div class="article-nav">
                {move || {
                    let prev = prev_article();
                    let next = next_article();
                    let current = current_index() + 1;
                    let total = DOCS.len();
                    view! {
                        <div class="nav-links">
                            {prev.map(|entry| view! {
                                <A class="nav-btn" href=format!("/{}", entry.path)>
                                    "← " {entry.title}
                                </A>
                            })}
                            <span class="nav-counter">{format!("{}/{}", current, total)}</span>
                            {next.map(|entry| view! {
                                <A class="nav-btn" href=format!("/{}", entry.path)>
                                    {entry.title} " →"
                                </A>
                            })}
                        </div>
                    }.into_view()
                }}
            </div>
        </div>
    }
}