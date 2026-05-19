use leptos::*;
use crate::components::{Sidebar, TopPanel, ToolsSidebar};
use crate::utils::styles::SIDEBAR_CSS;

#[component]
pub fn Layout(children: Children) -> impl IntoView {
    let (sidebar_width, set_sidebar_width) = create_signal("25%".to_string());
    let (is_open, set_is_open) = create_signal(false);
    let (is_tools_open, set_is_tools_open) = create_signal(false);

    let (prev_sidebar_width, set_prev_sidebar_width) = create_signal(sidebar_width.get());

    create_effect(move |_| {
        let current = sidebar_width.get();
        let prev = prev_sidebar_width.get();
        let tools = is_tools_open.get();

        let is_increasing = (prev == "0%" && (current == "25%" || current == "50%")) || 
                           (prev == "25%" && current == "50%");

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
            <TopPanel sidebar_width=sidebar_width set_width=set_sidebar_width set_open=set_is_open set_tools_open=set_is_tools_open />
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
