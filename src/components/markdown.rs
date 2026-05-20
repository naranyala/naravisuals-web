use crate::docs_data::DOCS;
use crate::renderer::RuntimeRenderer;
use leptos::*;
use leptos_router::*;
use md_compiler::parser::ast::Node;
use serde_json;
use wasm_bindgen::prelude::*;

#[derive(Clone, Copy, PartialEq)]
enum RenderMode {
    View,
    Ast,
    Raw,
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = applyCodeEnhancements)]
    fn apply_code_enhancements();
}

#[component]
pub fn MarkdownContent() -> impl IntoView {
    let params = use_params_map();
    let (mode, set_mode) = create_signal(RenderMode::View);
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

    let content = create_resource(filename, |path| async move {
        let ast = crate::docs_data::get_ast(&path);
        if ast.is_none() {
            web_sys::console::error_1(
                &format!("❌ Article not found in embedded data: {}", path).into(),
            );
        }
        ast
    });

    let raw_content = move || crate::docs_data::get_raw(&filename());

    create_effect(move |_| {
        if let Some(Some(_)) = content.get() {
            apply_code_enhancements();
        }
    });

    view! {
        <div class="markdown-container">
            <div class="render-switcher">
                <button
                    class=move || format!("switcher-btn {}", if mode.get() == RenderMode::View { "active" } else { "" })
                    on:click=move |_| set_mode.set(RenderMode::View)
                >
                    "View"
                </button>
                <button
                    class=move || format!("switcher-btn {}", if mode.get() == RenderMode::Ast { "active" } else { "" })
                    on:click=move |_| set_mode.set(RenderMode::Ast)
                >
                    "AST"
                </button>
                <button
                    class=move || format!("switcher-btn {}", if mode.get() == RenderMode::Raw { "active" } else { "" })
                    on:click=move |_| set_mode.set(RenderMode::Raw)
                >
                    "Raw"
                </button>
            </div>
            <div class="markdown-body">
                <Suspense fallback=move || view! { <p class="loading">"Loading article..."</p> }.into_view()>
                    {move || {
                        content.get().map(|ast| {
                            if let Some(node) = ast {
                                view! {
                                    <>
                                        {move || match mode.get() {
                                            RenderMode::View => view! {
                                                <>
                                                    <TableOfContents node=node.clone() />
                                                    {RuntimeRenderer::render(&node)}
                                                </>
                                            }.into_view(),
                                            RenderMode::Ast => view! {
                                                <div class="debug-ast">
                                                    <JsonTreeView value=serde_json::to_value(&node).unwrap_or_default() />
                                                </div>
                                            }.into_view(),
                                            RenderMode::Raw => view! {
                                                <div class="debug-raw">
                                                    <pre>
                                                        {raw_content().unwrap_or_default()}
                                                    </pre>
                                                </div>
                                            }.into_view(),
                                        }}
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

use crate::utils::ast::ASTUtils;

#[component]
fn TableOfContents(node: Node) -> impl IntoView {
    let headings = ASTUtils::extract_headings(&node);
    if headings.is_empty() {
        return view! {}.into_view();
    }

    let (is_open, set_is_open) = create_signal(false);

    view! {
        <div class="toc-container">
            <button class="toc-toggle" on:click=move |_| set_is_open.update(|v| *v = !*v)>
                <div class="toc-toggle-content">
                    <span class="toc-icon">"📜"</span>
                    <span class="toc-title">"Table of Contents"</span>
                </div>
                <span class=move || if is_open.get() { "arrow open" } else { "arrow" }>"▼"</span>
            </button>
            <Show when=move || is_open.get()>
                <ul class="toc-list">
                    {headings.clone().into_iter().map(|(level, title, id)| {
                        let class = format!("toc-item level-{}", level);
                        view! {
                            <li class=class>
                                <a href=format!("#{}", id)>{title}</a>
                            </li>
                        }
                    }).collect_view()}
                </ul>
            </Show>
        </div>
    }
    .into_view()
}

#[component]
fn JsonTreeView(value: serde_json::Value) -> impl IntoView {
    view! {
        <div class="json-tree">
            <JsonNode name="root".to_string() value=value is_last=true depth=0 />
        </div>
    }
}

#[component]
fn JsonNode(name: String, value: serde_json::Value, is_last: bool, depth: usize) -> impl IntoView {
    let (is_expanded, set_is_expanded) = create_signal(depth < 2);

    let indent = "  ".repeat(depth);

    match value {
        serde_json::Value::Object(map) => {
            let keys_count = map.len();
            let map_clone = map.clone();
            view! {
                <div class="json-object">
                    <div class="json-line collapsible" on:click=move |_| set_is_expanded.update(|v| *v = !*v)>
                        <span class="json-indent">{&indent}</span>
                        <span class="json-arrow">{move || if is_expanded.get() { "▼" } else { "▶" }}</span>
                        <span class="json-key">{format!("\"{}\"", name)}</span>
                        <span class="json-punct">": {"</span>
                        <Show when=move || !is_expanded.get()>
                            <span class="json-placeholder">{format!(" {} items ", keys_count)}</span>
                            <span class="json-punct">"}"</span>
                            {if !is_last { view! { <span class="json-punct">","</span> }.into_view() } else { view! { }.into_view() }}
                        </Show>
                    </div>
                    <Show when=move || is_expanded.get()>
                        <div class="json-children">
                            {map_clone.iter().enumerate().map(|(i, (k, v))| {
                                let is_last_child = i == keys_count - 1;
                                view! { <JsonNode name=k.clone() value=v.clone() is_last=is_last_child depth=depth + 1 /> }
                            }).collect_view()}
                        </div>
                        <div class="json-line">
                            <span class="json-indent">{&indent}</span>
                            <span class="json-punct">"}"</span>
                            {if !is_last { view! { <span class="json-punct">","</span> }.into_view() } else { view! { }.into_view() }}
                        </div>
                    </Show>
                </div>
            }.into_view()
        }
        serde_json::Value::Array(arr) => {
            let len = arr.len();
            let arr_clone = arr.clone();
            view! {
                <div class="json-array">
                    <div class="json-line collapsible" on:click=move |_| set_is_expanded.update(|v| *v = !*v)>
                        <span class="json-indent">{&indent}</span>
                        <span class="json-arrow">{move || if is_expanded.get() { "▼" } else { "▶" }}</span>
                        <span class="json-key">{format!("\"{}\"", name)}</span>
                        <span class="json-punct">": ["</span>
                        <Show when=move || !is_expanded.get()>
                            <span class="json-placeholder">{format!(" {} items ", len)}</span>
                            <span class="json-punct">"]"</span>
                            {if !is_last { view! { <span class="json-punct">","</span> }.into_view() } else { view! { }.into_view() }}
                        </Show>
                    </div>
                    <Show when=move || is_expanded.get()>
                        <div class="json-children">
                            {arr_clone.iter().enumerate().map(|(i, v)| {
                                let is_last_child = i == len - 1;
                                view! { <JsonNode name=i.to_string() value=v.clone() is_last=is_last_child depth=depth + 1 /> }
                            }).collect_view()}
                        </div>
                        <div class="json-line">
                            <span class="json-indent">{&indent}</span>
                            <span class="json-punct">"]"</span>
                            {if !is_last { view! { <span class="json-punct">","</span> }.into_view() } else { view! { }.into_view() }}
                        </div>
                    </Show>
                </div>
            }.into_view()
        }
        _ => {
            let val_str = match &value {
                serde_json::Value::String(s) => format!("\"{}\"", s),
                serde_json::Value::Number(n) => n.to_string(),
                serde_json::Value::Bool(b) => b.to_string(),
                serde_json::Value::Null => "null".to_string(),
                _ => unreachable!(),
            };
            let val_class = match value {
                serde_json::Value::String(_) => "json-value string",
                serde_json::Value::Number(_) => "json-value number",
                serde_json::Value::Bool(_) => "json-value boolean",
                serde_json::Value::Null => "json-value null",
                _ => "json-value",
            };
            view! {
                <div class="json-line">
                    <span class="json-indent">{&indent}</span>
                    <span class="json-spacer">"  "</span>
                    <span class="json-key">{format!("\"{}\"", name)}</span>
                    <span class="json-punct">": "</span>
                    <span class=val_class>{val_str}</span>
                    {if !is_last { view! { <span class="json-punct">","</span> }.into_view() } else { view! { }.into_view() }}
                </div>
            }.into_view()
        }
    }
}

#[component]
fn ArticleNavigation(filename: String) -> impl IntoView {
    let current_index = DOCS.iter().position(|e| e.path == filename);

    let prev = current_index.and_then(|i| if i > 0 { Some(&DOCS[i - 1]) } else { None });

    let next = current_index.and_then(|i| {
        if i < DOCS.len() - 1 {
            Some(&DOCS[i + 1])
        } else {
            None
        }
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
