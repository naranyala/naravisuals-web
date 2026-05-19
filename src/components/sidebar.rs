use leptos::*;
use leptos_router::*;
use std::collections::BTreeMap;
use crate::docs_data::{DOCS, DocEntry};

#[component]
pub fn Sidebar(class: String, on_close: Callback<()>) -> impl IntoView {
    let location = use_location();

    let grouped_docs = move || {
        let mut groups: BTreeMap<String, Vec<&DocEntry>> = BTreeMap::new();
        for entry in DOCS {
            let category = entry.path.split('/').next().unwrap_or("General").to_string();
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
                                                    let mut classes = "sidebar-item".to_string();
                                                    if current_path == format!("/{}", path) || (current_path == "/" && path == DOCS[0].path) {
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
        </aside>
    }
}