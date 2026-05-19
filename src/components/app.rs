use leptos::*;
use leptos_router::*;
use leptos_meta::*;
use crate::components::{Layout, MarkdownContent, SearchModal};
use crate::docs_data::{DOCS, DocEntry};

#[component]
pub fn App() -> impl IntoView {
    provide_meta_context();
    
    let (is_light, set_is_light) = create_signal(false);
    let (is_search_open, set_is_search_open) = create_signal(false);
    
    // We now provide the static DOCS array as a context
    provide_context(DOCS);
    provide_context(set_is_light);
    provide_context(is_light);
    provide_context(set_is_search_open);
    provide_context(is_search_open);

    create_effect(move |_| {
        let body = web_sys::window()
            .and_then(|win| win.document())
            .and_then(|doc| doc.body());
        
        if let Some(body) = body {
            if is_light.get() {
                body.class_list().add_1("light-theme").ok();
            } else {
                body.class_list().remove_1("light-theme").ok();
            }
        }
    });

    view! {
        <div class="app-wrapper">
            <Router>
                <Layout>
                    <Routes>
                        <Route path="" view=move || view! { <MarkdownContent /> }/>
                        <Route path="/*filename" view=move || view! { <MarkdownContent /> }/>
                    </Routes>
                </Layout>
                <SearchModal 
                    is_open=is_search_open 
                    on_close=Callback::new(move |_| set_is_search_open.set(false)) 
                />
            </Router>
        </div>
    }
}
