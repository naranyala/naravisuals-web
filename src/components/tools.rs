use leptos::*;
use leptos_router::*;
use std::collections::BTreeMap;
use crate::utils::search::{SearchResult, highlight_match, extract_headings_simple};
use crate::docs_data::DOCS;
use crate::search_index::SEARCH_INDEX;

#[component]
pub fn ToolsSidebar(is_open: ReadSignal<bool>, on_close: Callback<()>) -> impl IntoView {
    let (query, set_query) = create_signal("".to_string());
    let (show_search, set_show_search) = create_signal(false);

    let tools: Vec<(&str, &str, &str)> = vec![
        ("🔧", "CLI Generator", "cli"),
        ("📦", "Package Builder", "package"),
        ("🚀", "Deploy", "deploy"),
        ("📊", "Analytics", "analytics"),
        ("🔒", "Security", "security"),
    ];

    let results = move || {
        let q = query.get();
        if q.is_empty() {
            return Vec::<SearchResult>::new();
        }

        let q_lower = q.to_lowercase();
        let mut path_matches: BTreeMap<String, (String, Option<String>, Option<String>)> = BTreeMap::new();
        
        for entry in SEARCH_INDEX {
            let mut matched_title = false;
            let mut matched_content = false;

            if entry.path.contains('/') {
                // Find the title from DOCS
                if let Some(doc) = DOCS.iter().find(|d| d.path == entry.path) {
                    if doc.title.to_lowercase().contains(&q_lower) {
                        matched_title = true;
                    }
                }
            } else {
                // Simple path
                if let Some(doc) = DOCS.iter().find(|d| d.path == entry.path) {
                    if doc.title.to_lowercase().contains(&q_lower) {
                        matched_title = true;
                    }
                }
            }

            if entry.content.to_lowercase().contains(&q_lower) {
                matched_content = true;
            }
            
            if matched_title || matched_content {
                let title = DOCS.iter()
                    .find(|d| d.path == entry.path)
                    .map(|d| highlight_match(&d.title, &q))
                    .unwrap_or_else(|| entry.path.to_string());

                let snippet = if matched_content {
                    Some(highlight_match(entry.content, &q))
                } else {
                    None
                };

                path_matches.entry(entry.path.to_string())
                    .or_insert((title, None, snippet));
            }
        }

        let mut all_results = Vec::new();
        for (path, (title, heading, snippet)) in path_matches {
            all_results.push(SearchResult {
                title,
                path,
                heading,
                snippet,
            });
        }
        all_results
    };

    view! {
        <div class=move || if is_open.get() { "tools-sidebar open" } else { "tools-sidebar" }>
            <div class="tools-sidebar-header">
                <span class="tools-sidebar-title">"Tools"</span>
                <button class="tools-sidebar-close" on:click=move |_| {
                    set_show_search.set(false);
                    on_close.call(());
                }>"✕"</button>
            </div>
            <div class="tools-sidebar-content">
                {move || {
                    view! {
                        <div class="tools-grid">
                            {tools.iter().map(|(icon, name, id)| {
                                let icon = *icon;
                                let name = *name;
                                let id = *id;
                                view! {
                                    <div class="tool-item" on:click=move |_| {
                                        // Handle specific tool actions here
                                    }>
                                        <span class="tool-icon">{icon}</span>
                                        <span class="tool-name">{name}</span>
                                    </div>
                                }
                            }).collect_view()}
                        </div>
                    }
                }}
            </div>
        </div>
    }
}
