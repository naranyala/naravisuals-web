use leptos::*;
use leptos_router::*;
use crate::docs_data::DOCS;

#[component]
pub fn TopPanel(
    sidebar_width: ReadSignal<String>,
    set_width: WriteSignal<String>,
    set_open: WriteSignal<bool>,
    set_tools_open: WriteSignal<bool>,
) -> impl IntoView {
    let location = use_location();

    let breadcrumbs = move || {
        let pathname = location.pathname.get();
        let path = pathname.trim_start_matches('/');
        if path.is_empty() {
            return view! { <span>"Home"</span> }.into_view();
        }

        let entry = DOCS.iter().find(|e| e.path == path);
        let title = entry.map(|e| e.title).unwrap_or("Unknown Page");
        
        let category_id = path.split('/').next().unwrap_or("");
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
                <span class="breadcrumb-separator">" /, "</span>
                <span class="breadcrumb-item current">{title}</span>
            </div>
        }.into_view()
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
                <div class="btn-group">
                    <button 
                        class=move || format!("mode-btn {}", if sidebar_width.get() == "0%" { "active" } else { "" })
                        on:click=move |_| set_width.set("0%".to_string())
                    >
                        "No"
                    </button>
                    <button 
                        class=move || format!("mode-btn {}", if sidebar_width.get() == "25%" { "active" } else { "" })
                        on:click=move |_| set_width.set("25%".to_string())
                    >
                        "25%"
                    </button>
                    <button 
                        class=move || format!("mode-btn {}", if sidebar_width.get() == "50%" { "active" } else { "" })
                        on:click=move |_| set_width.set("50%".to_string())
                    >
                        "50%"
                    </button>
                </div>
                <button class="tools-btn" on:click=move |_| set_tools_open.update(|o| *o = !*o)>
                    "🧰"
                </button>
            </div>
        </div>
    }
}
