use leptos::*;
use leptos_router::*;
use leptos_meta::*;
use crate::components::{Layout, MarkdownContent};
use crate::docs_data::{DOCS, DocEntry};

#[component]
pub fn App() -> impl IntoView {
    provide_meta_context();
    
    // We now provide the static DOCS array as a context
    provide_context(DOCS);

    view! {
        <div class="app-wrapper">
            <Router>
                <Layout>
                    <Routes>
                        <Route path="" view=move || view! { <MarkdownContent /> }/>
                        <Route path="/*filename" view=move || view! { <MarkdownContent /> }/>
                    </Routes>
                </Layout>
            </Router>
        </div>
    }
}
