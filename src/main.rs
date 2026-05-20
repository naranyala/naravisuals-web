mod compiler;
mod components;
mod docs_data;
mod renderer;
mod search_index;
mod state;
mod utils;

use components::App;
use leptos::*;

const CSS_CONTENT: &str = include_str!("../styles/base.css");

fn main() {
    mount_to_body(|| {
        view! {
            <style>{CSS_CONTENT}</style>
            <App />
        }
    })
}
