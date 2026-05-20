use crate::renderer::RuntimeRenderer;
use leptos::*;
use md_compiler::parser::parse;

#[component]
pub fn MarkdownEditor() -> impl IntoView {
    let (input, set_input) =
        create_signal("## Hello\n\nTry typing some **markdown** here!".to_string());

    let ast = create_memo(move |_| parse(&input.get()));

    view! {
        <div class="markdown-editor">
            <div class="editor-grid">
                <textarea
                    class="markdown-input"
                    on:input=move |ev| {
                        set_input.set(event_target_value(&ev));
                    }
                    prop:value=input
                />
                <div class="markdown-preview">
                    {move || match ast.get() {
                        Ok(node) => RuntimeRenderer::render(&node),
                        Err(e) => view! { <div class="error-message">{format!("Parsing error: {}", e)}</div> }.into_view(),
                    }}
                </div>
            </div>
        </div>
    }
}
