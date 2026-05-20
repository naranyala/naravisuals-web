use crate::components::{Sidebar, ToolsSidebar, TopPanel};
use crate::state::AppState;
use crate::utils::styles::SIDEBAR_CSS;
use leptos::*;

#[component]
pub fn Layout(children: Children) -> impl IntoView {
    let state = AppState::use_state();
    let sidebar_width = state.sidebar.width;
    let set_sidebar_width = state.sidebar.set_width;
    let is_open = state.sidebar.is_open;
    let set_is_open = state.sidebar.set_is_open;
    let is_tools_open = state.tools.is_open;
    let set_is_tools_open = state.tools.set_is_open;

    let (prev_sidebar_width, set_prev_sidebar_width) = create_signal(sidebar_width.get());

    create_effect(move |_| {
        let current = sidebar_width.get();
        let prev = prev_sidebar_width.get();
        let tools = is_tools_open.get();

        let is_increasing = (prev == "0%" && (current == "25%" || current == "50%"))
            || (prev == "25%" && current == "50%");

        if is_increasing && tools {
            set_is_tools_open.set(false);
        }

        if current == "50%" && tools {
            set_sidebar_width.set("25%".to_string());
        }

        set_prev_sidebar_width.set(current);
    });

    view! {
        <>
            <style>{SIDEBAR_CSS}</style>
            <TopPanel set_tools_open=set_is_tools_open />
            <div class="layout" style=move || format!("--sidebar-width: {};", sidebar_width.get())>
                {move || {
                    if sidebar_width.get() != "0%" {
                        let class = if is_open.get() { "open".to_string() } else { "".to_string() };
                        let class_clone = class.clone();
                        let overlay_class = class_clone.clone();
                        view! {
                            <>
                                <div class=move || format!("sidebar-wrapper {}", class_clone)>
                                    <Sidebar
                                        class=class
                                        on_close=Callback::new(move |_| set_is_open.set(false))
                                    />
                                </div>
                                <div class="sidebar-overlay" class=overlay_class on:click=move |_| set_is_open.set(false) />
                            </>
                        }.into_view()
                    } else {
                        view! { }.into_view()
                    }
                }}
                <main class="content">
                    {children()}
                </main>
                <ToolsSidebar is_open=is_tools_open on_close=Callback::new(move |_| set_is_tools_open.set(false)) />
            </div>
            {move || if is_tools_open.get() {
                view! {
                    <div class="sidebar-overlay" class="open" on:click=move |_| set_is_tools_open.set(false) />
                }.into_view()
            } else {
                view! { }.into_view()
            }}
        </>
    }
}
