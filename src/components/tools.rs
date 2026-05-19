use leptos::*;
use leptos_router::*;
use std::collections::BTreeMap;
use crate::utils::search::{SearchResult, highlight_match, extract_headings_simple};
use crate::docs_data::DOCS;

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
        ("🔍", "Search", "search"),
    ];

    let results = move || {
        let q = query.get();
        if q.is_empty() {
            return Vec::<SearchResult>::new();
        }

        let q_lower = q.to_lowercase();
        let mut path_matches: BTreeMap<String, (String, Option<String>, Option<String>)> = BTreeMap::new();
        
        for entry in DOCS {
            let mut matched_title = false;
            let mut matched_heading = false;
            let mut matched_content = false;
            let mut snippet: Option<String> = None;

            if entry.title.to_lowercase().contains(&q_lower) {
                matched_title = true;
            }
            
            for heading in extract_headings_simple(entry.content) {
                if heading.to_lowercase().contains(&q_lower) {
                    matched_heading = true;
                }
            }

            if !matched_title && !matched_heading && entry.content.to_lowercase().contains(&q_lower) {
                matched_content = true;
                snippet = Some(highlight_match(entry.content, &q));
            }

            if matched_title || matched_heading || matched_content {
                let highlighted_title = highlight_match(&entry.title, &q);
                path_matches.entry(entry.path.to_string())
                    .or_insert((highlighted_title.clone(), None, None));
                
                if matched_heading {
                    for heading in extract_headings_simple(entry.content) {
                        if heading.to_lowercase().contains(&q_lower) {
                            path_matches.get_mut(&entry.path.to_string()).unwrap().1 = Some(highlight_match(&heading, &q));
                            break;
                        }
                    }
                }
                
                if matched_content {
                    path_matches.get_mut(&entry.path.to_string()).unwrap().2 = snippet;
                }
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
                    if show_search.get() {
                        view! {
                            <div class="search-container">
                                <button class="back-btn" on:click=move |_| set_show_search.set(false)>
                                    "← Back to Tools"
                                </button>
                                <input 
                                    type="text" 
                                    class="search-sidebar-input"
                                    placeholder="Search any query" 
                                    on:input=move |ev| set_query.set(event_target_value(&ev))
                                />
                                <div class="search-results-list">
                                    {move || {
                                        let res = results();
                                        if res.is_empty() && !query.get().is_empty() {
                                            view! { <div style="text-align: center; color: var(--text-muted); padding: 2rem;">"No results found"</div> }.into_view()
                                        } else {
                                            res.into_iter().map(|res| {
                                                let href_title = format!("/{}", res.path);
                                                view! {
                                                    <div class="search-result-group">
                                                        <A class="search-result-item" href=href_title.clone() on:click=move |_| {
                                                            set_show_search.set(false);
                                                            on_close.call(());
                                                        }>
                                                            <span class="search-result-title" inner_html=res.title></span>
                                                            {res.snippet.map(|s| view! { <div class="search-result-snippet" inner_html=s></div> })}
                                                        </A>
                                                        {res.heading.map(|h| {
                                                            let clean_heading = h.replace("<mark>", "").replace("</mark>", "");
                                                            let heading_id = clean_heading.to_lowercase().replace(' ', "-");
                                                            let href_heading = format!("{}/#{}", res.path, heading_id);
                                                            view! {
                                                                <A class="search-result-item-heading" href=href_heading on:click=move |_| {
                                                                    set_show_search.set(false);
                                                                    on_close.call(());
                                                                }>
                                                                    <span class="search-result-heading" inner_html=h></span>
                                                                </A>
                                                            }
                                                        })}
                                                    </div>
                                                }.into_view()
                                            }).collect_view()
                                        }
                                    }}
                                </div>
                            </div>
                        }.into_view()
                    } else {
                        view! {
                            <div class="tools-grid">
                                {tools.iter().map(|(icon, name, id)| {
                                    let icon = *icon;
                                    let name = *name;
                                    let id = *id;
                                    view! {
                                        <div class="tool-item" on:click=move |_| {
                                            if id == "search" {
                                                set_show_search.set(true);
                                            }
                                        }>
                                            <span class="tool-icon">{icon}</span>
                                            <span class="tool-name">{name}</span>
                                        </div>
                                    }
                                }).collect_view()}
                            </div>
                        }.into_view()
                    }
                }}
            </div>
        </div>
    }
}