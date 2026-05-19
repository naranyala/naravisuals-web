use leptos::*;
use leptos_router::*;
use wasm_bindgen::prelude::*;
use gloo_net::http::Request;
use crate::renderer::{ast::Node, RuntimeRenderer};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = applyCodeEnhancements)]
    fn apply_code_enhancements();
}

#[component]
pub fn MarkdownContent() -> impl IntoView {
    let params = use_params_map();
    let filename = move || {
        params.with(|p| p.get("filename").cloned().unwrap_or_default())
    };

    let content = create_resource(
        move || filename(),
        move |path| async move {
            let url = format!("/generated/json/{}.json", path);
            let resp = Request::get(&url).send().await;
            match resp {
                Ok(res) => res.json::<Node>().await.ok(),
                Err(_) => None,
            }
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
                <Suspense fallback=move || view! { <p>"Loading..."</p> }.into_view()>
                    {move || {
                        content.get().map(|ast| {
                            if let Some(node) = ast {
                                RuntimeRenderer::render(&node)
                            } else {
                                view! { <p class="not-found">Article not found</p> }.into_view()
                            }
                        })
                    }}
                </Suspense>
            </div>
        </div>
    }
}
