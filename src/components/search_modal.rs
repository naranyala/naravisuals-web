use crate::docs_data::DOCS;
use crate::search_index::SEARCH_INDEX;
use crate::utils::search::{highlight_match, SearchResult};
use leptos::*;
use leptos_router::*;
use std::collections::BTreeMap;

#[component]
pub fn SearchModal(is_open: ReadSignal<bool>, on_close: Callback<()>) -> impl IntoView {
    let (query, set_query) = create_signal("".to_string());

    // Focus input automatically when opened
    create_effect(move |_| {
        if is_open.get() {
            // We can't easily get the element here without a NodeRef,
            // but we can handle it in the view with an autofocus attribute.
        }
    });

    let results = move || {
        let q = query.get();
        if q.is_empty() {
            return Vec::<SearchResult>::new();
        }

        let q_lower = q.to_lowercase();
        let mut path_matches: BTreeMap<String, (String, Option<String>, Option<String>)> =
            BTreeMap::new();

        for entry in SEARCH_INDEX {
            let mut matched_title = false;
            let mut matched_content = false;

            if let Some(doc) = DOCS.iter().find(|d| d.path == entry.path) {
                if doc.title.to_lowercase().contains(&q_lower) {
                    matched_title = true;
                }
            }

            if entry.content.to_lowercase().contains(&q_lower) {
                matched_content = true;
            }

            if matched_title || matched_content {
                let title = DOCS
                    .iter()
                    .find(|d| d.path == entry.path)
                    .map(|d| highlight_match(d.title, &q))
                    .unwrap_or_else(|| entry.path.to_string());

                let snippet = if matched_content {
                    Some(highlight_match(entry.content, &q))
                } else {
                    None
                };

                path_matches
                    .entry(entry.path.to_string())
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
        <div class=move || format!("search-modal-overlay {}", if is_open.get() { "open" } else { "" }) on:click=move |_| on_close.call(())>
            <div class="search-modal" on:click=move |ev| ev.stop_propagation()>
                <div class="search-modal-header">
                    <div class="search-input-wrapper">
                        <span class="search-icon">"🔍"</span>
                        <input
                            type="text"
                            class="search-modal-input"
                            placeholder="Search documentation... (Esc to close)"
                            autofocus
                            on:input=move |ev| set_query.set(event_target_value(&ev))
                            on:keydown=move |ev| {
                                if ev.key() == "Escape" {
                                    on_close.call(());
                                }
                            }
                        />
                    </div>
                    <div class="search-modal-shortcuts">
                        <span class="shortcut-key">"⌘"</span>
                        <span class="shortcut-key">"K"</span>
                    </div>
                </div>
                <div class="search-modal-content">
                    {move || {
                        let res = results();
                        if query.get().is_empty() {
                            view! {
                                <div class="search-empty-state">
                                    <span class="empty-title">"Search the docs"</span>
                                    <span class="empty-subtitle">"Type something to start searching"</span>
                                </div>
                            }.into_view()
                        } else if res.is_empty() {
                            view! { <div class="search-no-results">"No results found for \"" {query.get()} "\""</div> }.into_view()
                        } else {
                            view! {
                                <div class="search-results-list">
                                    {res.into_iter().map(|res| {
                                        let href_title = format!("/{}", res.path);
                                        view! {
                                            <A class="search-modal-result-item" href=href_title.clone() on:click=move |_| on_close.call(())>
                                                <div class="result-main">
                                                    <span class="result-title" inner_html=res.title></span>
                                                    <span class="result-path">{res.path}</span>
                                                </div>
                                                {res.snippet.map(|s| view! { <div class="result-snippet" inner_html=s></div> })}
                                            </A>
                                        }.into_view()
                                    }).collect_view()}
                                </div>
                            }.into_view()
                        }
                    }}
                </div>
                <div class="search-modal-footer">
                    <span>"Press ESC to close"</span>
                </div>
            </div>
        </div>
    }
}
