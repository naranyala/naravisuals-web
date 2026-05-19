use leptos::*;
use leptos_router::*;
use leptos_meta::*;
use crate::components::{Layout, MarkdownContent};

#[component]
pub fn App() -> impl IntoView {
    provide_meta_context();
    view! {
        <Router>
            <Layout>
                <Routes>
                    <Route path="" view=move || view! { <MarkdownContent /> }/>
                    <Route path="/*filename" view=move || view! { <MarkdownContent /> }/>
                </Routes>
            </Layout>
        </Router>
    }
}