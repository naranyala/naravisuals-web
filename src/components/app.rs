use crate::components::{Layout, MarkdownContent, SearchModal};
use crate::docs_data::DOCS;
use crate::state::AppState;
use leptos::*;
use leptos_meta::*;
use leptos_router::*;

#[component]
pub fn App() -> impl IntoView {
    provide_meta_context();

    // Unified state provision
    let state = AppState::new();
    provide_context(state);

    // We now provide the static DOCS array as a context
    provide_context(DOCS);

    let is_light = state.theme.is_light;
    let is_search_open = state.search.is_open;
    let set_is_search_open = state.search.set_is_open;

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
            <WelcomeScreen />
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

#[component]
fn WelcomeScreen() -> impl IntoView {
    let (visible, set_visible) = create_signal(true);

    set_timeout(
        move || {
            set_visible.set(false);
        },
        std::time::Duration::from_millis(1600),
    );

    view! {
        <Show when=move || visible.get()>
            <div class="welcome-screen">
                <div class="welcome-content">
                    <h1>"Rigorstarter"</h1>
                </div>
            </div>
        </Show>
    }
}
