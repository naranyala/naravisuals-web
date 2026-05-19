use leptos::*;
use leptos_router::*;

#[component]
pub fn TopPanel(
    sidebar_width: ReadSignal<String>,
    set_width: WriteSignal<String>,
    set_open: WriteSignal<bool>,
    set_tools_open: WriteSignal<bool>,
) -> impl IntoView {

    view! {
        <div class="top-panel">
            <div class="panel-left">
                <button class="menu-toggle" on:click=move |_| set_open.update(|o| *o = !*o)>
                    "☰"
                </button>
                <A href="/" class="sidebar-logo">
                    <span>"Rigorstarter"</span>
                </A>
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