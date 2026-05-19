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
                                RuntimeRenderer::render(&node)
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
