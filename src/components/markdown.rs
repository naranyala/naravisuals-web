use leptos::*;
use leptos_router::*;
use wasm_bindgen::prelude::*;
use crate::renderer::RuntimeRenderer;
use md_compiler::parser::ast::Node;
use crate::docs_data::DOCS;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = applyCodeEnhancements)]
    fn apply_code_enhancements();
}

#[component]
pub fn MarkdownContent() -> impl IntoView {
    let params = use_params_map();
    let filename = move || {
        params.with(|p| {
            let f = p.get("filename").cloned().unwrap_or_default();
            if f.is_empty() {
                DOCS[0].path.to_string()
            } else {
                f
            }
        })
    };

    let content = create_resource(
        move || filename(),
        move |path| async move {
            let ast = crate::docs_data::get_ast(&path);
            if ast.is_none() {
                web_sys::console::error_1(&format!("❌ Article not found in embedded data: {}", path).into());
            } else if let Some(ref node) = ast {
                // Strict Validation: Ensure the root is always a Document
                if !matches!(node, Node::Document(_)) {
                    web_sys::console::error_1(&"❌ Invalid AST Structure: Root must be Node::Document".into());
                    return None;
                }
            }
            ast
        },
    );

    create_effect(move |_| {
        if let Some(Some(_)) = content.get() {
            apply_code_enhancements();
        }
    });

    view! {
        <div class="markdown-container">
            <div class="markdown-body">
                <Suspense fallback=move || view! { <p class="loading">"Loading article..."</p> }.into_view()>
                    {move || {
                        content.get().map(|ast| {
                            if let Some(node) = ast {
                                view! {
                                    <>
                                        {RuntimeRenderer::render(&node)}
                                        <ArticleNavigation filename=filename() />
                                    </>
                                }.into_view()
                            } else {
                                view! { 
                                    <div class="not-found">
                                        <h3>"Article not found"</h3>
                                        <p>"The requested document could not be loaded. Please check the URL or try another article."</p>
                                    </div> 
                                }.into_view()
                            }
                        })
                    }}
                </Suspense>
            </div>
        </div>
    }
}

#[component]
fn ArticleNavigation(filename: String) -> impl IntoView {
    let current_index = DOCS.iter().position(|e| e.path == filename);
    
    let prev = current_index.and_then(|i| {
        if i > 0 { Some(&DOCS[i-1]) } else { None }
    });
    
    let next = current_index.and_then(|i| {
        if i < DOCS.len() - 1 { Some(&DOCS[i+1]) } else { None }
    });

    view! {
        <div class="article-nav">
            <div class="nav-links">
                <div class="nav-prev">
                    {prev.map(|e| view! { 
                        <A class="nav-btn" href=format!("/{}", e.path)>
                            <span class="nav-arrow">"←"</span>
                            <div class="nav-text">
                                <span class="nav-label">"Previous"</span>
                                <span class="nav-title">{e.title}</span>
                            </div>
                        </A> 
                    })}
                </div>
                <div class="nav-next">
                    {next.map(|e| view! { 
                        <A class="nav-btn" href=format!("/{}", e.path)>
                            <div class="nav-text">
                                <span class="nav-label">"Next"</span>
                                <span class="nav-title">{e.title}</span>
                            </div>
                            <span class="nav-arrow">"→"</span>
                        </A> 
                    })}
                </div>
            </div>
        </div>
    }
}
