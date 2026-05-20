use crate::docs_data::{DocEntry, DOCS};
use leptos::*;
use leptos_router::*;
use std::collections::BTreeMap;

#[component]
pub fn Sidebar(class: String, on_close: Callback<()>) -> impl IntoView {
    let location = use_location();

    let current_index = move || {
        let path = location.pathname.get();
        let resolved_path = if path == "/" || path.is_empty() {
            DOCS.first()
                .map(|e| format!("/{}", e.path))
                .unwrap_or_default()
        } else {
            path
        };
        DOCS.iter()
            .position(|entry| format!("/{}", entry.path) == resolved_path)
            .map(|i| i + 1)
            .unwrap_or(0)
    };

    let total_articles = DOCS.len();

    let grouped_docs = move || {
        let mut groups: BTreeMap<String, Vec<&DocEntry>> = BTreeMap::new();
        for entry in DOCS {
            let category = entry
                .path
                .split('/')
                .next()
                .unwrap_or("General")
                .to_string();
            groups.entry(category).or_default().push(entry);
        }
        groups
    };

    view! {
        <aside class=move || format!("sidebar {}", class)>
            <div class="sidebar-header">
                <button class="close-sidebar" on:click=move |_| on_close.call(())>"✕"</button>
            </div>

            <div class="sidebar-content">
                {move || {
                    let groups = grouped_docs();

                    if groups.is_empty() {
                        return view! { <p class="not-found">"No articles available"</p> }.into_view();
                    }

                    groups.into_iter().map(|(cat_id, entries)| {
                        let category_name = cat_id.split('-').skip(1).collect::<Vec<_>>().join(" ");

                        view! {
                            <div class="sidebar-group">
                                <h3 class="sidebar-category">{category_name}</h3>
                                <div class="sidebar-links">
                                    {entries.into_iter().map(|entry| {
                                        let path = entry.path.to_string();
                                        view! {
                                            <A
                                                href=format!("/{}", path)
                                                class=move || {
                                                    let current_path = location.pathname.get();
                                                    let resolved_path = if current_path == "/" || current_path.is_empty() {
                                                        DOCS.first().map(|e| format!("/{}", e.path)).unwrap_or_default()
                                                    } else {
                                                        current_path
                                                    };
                                                    let mut classes = "sidebar-item".to_string();
                                                    if resolved_path == format!("/{}", path) {
                                                        classes.push_str(" active");
                                                    }
                                                    classes
                                                }
                                            >
                                                {entry.title}
                                            </A>
                                        }
                                    }).collect_view()}
                                </div>
                            </div>
                        }.into_view()
                    }).collect_view()
                }}
                </div>

                <div class="sidebar-footer">
                {move || format!("{}/{}", current_index(), total_articles)}
            </div>
        </aside>
    }
}
