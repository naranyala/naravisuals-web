mod utils;
mod components;
mod docs_data;
mod renderer;

use leptos::*;
use components::App;

const CSS_CONTENT: &str = include_str!("../styles/base.css");

fn main() {
    mount_to_body(|| view! { 
        <style>{CSS_CONTENT}</style>
        <App /> 
    })
}