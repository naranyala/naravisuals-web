use crate::state::AppState;
use leptos::*;

#[component]
#[derive(Clone, Copy, PartialEq)]
enum ToolsSubView {
    Main,
    Theme,
    Layout,
}

#[component]
pub fn ToolsSidebar(is_open: ReadSignal<bool>, on_close: Callback<()>) -> impl IntoView {
    let state = AppState::use_state();
    let (sub_view, set_sub_view) = create_signal(ToolsSubView::Main);

    let is_light = state.theme.is_light;
    let set_is_light = state.theme.set_is_light;
    let set_is_search_open = state.search.set_is_open;
    let sidebar_width = state.sidebar.width;
    let set_width = state.sidebar.set_width;

    // Reset sub_view when sidebar closes
    create_effect(move |_| {
        if !is_open.get() {
            set_sub_view.set(ToolsSubView::Main);
        }
    });

    let render_header = move |title: &'static str, show_back: bool| {
        view! {
            <div class="tools-sidebar-header">
                <div class="header-left">
                    {if show_back {
                        view! {
                            <button class="back-btn" on:click=move |_| set_sub_view.set(ToolsSubView::Main)>
                                "←"
                            </button>
                        }.into_view()
                    } else {
                        view! { }.into_view()
                    }}
                    <span class="tools-sidebar-title">{title}</span>
                </div>
                <button class="tools-sidebar-close" on:click=move |_| {
                    on_close.call(());
                }>"✕"</button>
            </div>
        }
    };

    view! {
        <div class=move || if is_open.get() { "tools-sidebar open" } else { "tools-sidebar" }>
            {move || match sub_view.get() {
                ToolsSubView::Main => view! {
                    <>
                        {render_header("Quick Controls", false)}
                        <div class="tools-sidebar-content">
                            <div class="tools-grid">
                                <button class="tool-item" on:click=move |_| set_sub_view.set(ToolsSubView::Theme)>
                                    <span class="tool-icon">"🎨"</span>
                                    <span class="tool-name">"Theme"</span>
                                </button>
                                <button class="tool-item" on:click=move |_| set_sub_view.set(ToolsSubView::Layout)>
                                    <span class="tool-icon">"📏"</span>
                                    <span class="tool-name">"Layout"</span>
                                </button>
                                <button class="tool-item" on:click=move |_| {
                                    set_is_search_open.set(true);
                                    on_close.call(());
                                }>
                                    <span class="tool-icon">"🔍"</span>
                                    <span class="tool-name">"Search"</span>
                                </button>
                            </div>
                        </div>
                    </>
                }.into_view(),
                ToolsSubView::Theme => view! {
                    <>
                        {render_header("Theme", true)}
                        <div class="tools-sidebar-content">
                            <div class="tools-section">
                                <h3>"Select Mode"</h3>
                                <div class="tools-column">
                                    <button
                                        class=move || format!("tool-btn {}", if !is_light.get() { "active" } else { "" })
                                        on:click=move |_| set_is_light.set(false)
                                    >
                                        "🌙 Dark Mode"
                                    </button>
                                    <button
                                        class=move || format!("tool-btn {}", if is_light.get() { "active" } else { "" })
                                        on:click=move |_| set_is_light.set(true)
                                    >
                                        "☀️ Light Mode"
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                }.into_view(),
                ToolsSubView::Layout => view! {
                    <>
                        {render_header("Layout", true)}
                        <div class="tools-sidebar-content">
                            <div class="tools-section">
                                <h3>"Sidebar Width"</h3>
                                <div class="tools-column">
                                    <button
                                        class=move || format!("tool-btn {}", if sidebar_width.get() == "0%" { "active" } else { "" })
                                        on:click=move |_| set_width.set("0%".to_string())
                                    >
                                        "None (Hidden)"
                                    </button>
                                    <button
                                        class=move || format!("tool-btn {}", if sidebar_width.get() == "25%" { "active" } else { "" })
                                        on:click=move |_| set_width.set("25%".to_string())
                                    >
                                        "Standard (25%)"
                                    </button>
                                    <button
                                        class=move || format!("tool-btn {}", if sidebar_width.get() == "50%" { "active" } else { "" })
                                        on:click=move |_| set_width.set("50%".to_string())
                                    >
                                        "Wide (50%)"
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                }.into_view(),
            }}
        </div>
    }
}
