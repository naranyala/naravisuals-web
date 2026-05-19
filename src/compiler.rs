use wasm_bindgen::prelude::*;
use md_compiler::parser::parse;

#[wasm_bindgen]
pub fn compile_markdown(input: &str) -> String {
    let ast = parse(input);
    serde_json::to_string(&ast).unwrap_or_else(|_| "{}".to_string())
}
