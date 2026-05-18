use leptos::*;
use leptos_router::*;
use leptos_meta::*;
use pulldown_cmark;

mod docs_data;
use docs_data::{DOCS, DocEntry};

// Embed CSS at compile time to avoid all MIME type and loading issues
const CSS_CONTENT: &str = include_str!("../styles/base.css");

#[component]
fn MarkdownContent() -> impl IntoView {
    let params = use_params_map();
    let filename = move || {
        params.with(|p| p.get("filename").cloned().unwrap_or_default())
    };

    let content = move || {
        let f = filename();
        // Find the entry in our embedded DOCS array
        DOCS.iter()
            .find(|entry| entry.path == f || (f.is_empty() && entry.path == "home"))
            .map(|entry| entry.content)
            .unwrap_or("Article not found")
    };

    view! {
        <div class="markdown-body">
            {move || {
                let text = content();
                let parser = pulldown_cmark::Parser::new(text);
                let mut html_output = String::new();
                pulldown_cmark::html::push_html(&mut html_output, parser);
                view! { <div inner_html=html_output></div> }.into_view()
            }}
        </div>
    }
}

#[component]
fn Sidebar() -> impl IntoView {
    view! {
        <aside class="sidebar">
            <h2>"Rigorstarter"</h2>
            <ul>
                {DOCS.iter().map(|entry| {
                    view! {
                        <li>
                            <A href=format!("/{}", entry.path)>{entry.title}</A>
                        </li>
                    }
                }).collect_view()}
            </ul>
        </aside>
    }
}

#[component]
fn Layout(children: Children) -> impl IntoView {
    view! {
        <div class="layout">
            <Sidebar />
            <main class="content">
                {children()}
            </main>
        </div>
    }
}

#[component]
fn App() -> impl IntoView {
    provide_meta_context();
    view! {
        <style>{CSS_CONTENT}</style>
        <Router>
            <Layout>
                <Routes>
                    <Route path="" view=move || view! { <MarkdownContent /> }/>
                    <Route path="/:filename" view=move || view! { <MarkdownContent /> }/>
                </Routes>
            </Layout>
        </Router>
    }
}

fn main() {
    mount_to_body(|| view! { <App /> })
}
