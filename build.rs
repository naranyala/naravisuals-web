// build.rs - Generates docs_data.rs that imports pre-compiled Leptos components

fn main() {
    println!("cargo:rerun-if-changed=generated");
}
