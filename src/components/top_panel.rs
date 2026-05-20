use crate::docs_data::DOCS;
use crate::state::AppState;
use leptos::*;
use leptos_router::*;

#[component]
pub fn TopPanel(set_tools_open: WriteSignal<bool>) -> impl IntoView {
    let state = AppState::use_state();
    let set_open = state.sidebar.set_is_open;
    let location = use_location();

    let breadcrumbs = move || {
        let pathname = location.pathname.get();
        let path = pathname.trim_start_matches('/');
        let resolved_path = if path.is_empty() {
            DOCS.first().map(|e| e.path).unwrap_or_default()
        } else {
            path
        };

        let entry = DOCS.iter().find(|e| e.path == resolved_path);
        let title = entry.map(|e| e.title).unwrap_or("Unknown Page");

        let category_id = resolved_path.split('/').next().unwrap_or("");
        let category_name = category_id
            .split('-')
            .skip(1)
            .map(|s| {
                let mut c = s.chars();
                match c.next() {
                    None => String::new(),
                    Some(first) => first.to_uppercase().collect::<String>() + c.as_str(),
                }
            })
            .collect::<Vec<_>>()
            .join(" ");

        view! {
            <div class="breadcrumbs">
                <A href="/" class="breadcrumb-item">"Docs"</A>
                <span class="breadcrumb-separator">" / "</span>
                <span class="breadcrumb-item category">{category_name}</span>
                <span class="breadcrumb-separator">" / "</span>
                <span class="breadcrumb-item current">{title}</span>
            </div>
        }
        .into_view()
    };

    view! {
        <div class="top-panel">
            <div class="panel-left">
                <button class="menu-toggle" on:click=move |_| set_open.update(|o| *o = !*o)>
                    "☰"
                </button>
                <A href="/" class="sidebar-logo">
                    <span>"Rigorstarter"</span>
                </A>
                <div class="panel-center">
                    {breadcrumbs}
                </div>
            </div>
            <div class="panel-right">
                <button class="tools-btn" on:click=move |_| set_tools_open.update(|o| *o = !*o)>
                    "🧰"
                </button>
            </div>
        </div>
    }
}
