use md_compiler::parser::{parse, rustgen::RustGenerator};
use md_compiler::plugins::{PluginRegistry, callout::CalloutPlugin};
use md_compiler::utils::*;

use std::fs;
use std::path::Path;
use std::env;

#[cfg(test)]
mod build_tests;

pub(crate) fn walk_dir(dir: &Path, base_dir: &Path, entries: &mut Vec<(String, String, md_compiler::parser::ast::Node)>) {
    if let Ok(read_dir) = fs::read_dir(dir) {
        let mut paths: Vec<_> = read_dir.flatten().collect();
        paths.sort_by_key(|e| e.path());

        for entry in paths {
            let path = entry.path();
            let filename = path.file_name().unwrap().to_string_lossy();

            if path.is_dir() {
                if !has_valid_prefix(&filename) {
                    eprintln!("Warning: Directory '{}' should start with a numeric prefix", filename);
                }
                walk_dir(&path, base_dir, entries);
            } else if path.extension().map_or(false, |ext| ext == "md") {
                if !has_valid_prefix(&filename) {
                    eprintln!("Warning: Markdown file '{}' should start with a numeric prefix", filename);
                }
                
                let content = fs::read_to_string(&path).unwrap_or_default();
                let title = extract_title(&content);
                let ast = parse(&content);

                let relative_path = path.strip_prefix(base_dir).unwrap()
                    .with_extension("")
                    .to_string_lossy()
                    .into_owned();

                entries.push((relative_path, title, ast));
            }
        }
    }
}

pub(crate) fn create_plugin_registry() -> PluginRegistry {
    let mut registry = PluginRegistry::new();
    registry.register(Box::new(CalloutPlugin));
    registry
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let do_rust = !args.contains(&"--no-rust".to_string());
    let do_json = !args.contains(&"--no-json".to_string());

    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap_or_else(|_| ".".to_string());
    let project_root = if manifest_dir.ends_with("scripts") {
        Path::new(&manifest_dir).parent().unwrap_or(Path::new(".")).to_path_buf()
    } else {
        Path::new(&manifest_dir).to_path_buf()
    };
    
    let docs_dir = project_root.join("docs");
    let generated_dir = project_root.join("generated");
    
    fs::create_dir_all(&generated_dir).expect("Failed to create generated directory");
    
    let mut entries = Vec::new();

    if docs_dir.is_dir() {
        walk_dir(&docs_dir, &docs_dir, &mut entries);
    }

    // 1. Generate Rust components
    if do_rust {
        for (rel_path, _title, ast) in &entries {
            let component_name = path_to_component_name(rel_path);
            let rust_code = RustGenerator::new(create_plugin_registry()).generate(ast, &component_name);
            let output_path = generated_dir.join(format!("{}.rs", path_to_module_name(rel_path)));
            fs::write(&output_path, rust_code).expect("Failed to write Rust file");
        }
        generate_rust_mod_files(&generated_dir, &entries);
    }

    // 2. Generate JSON ASTs
    if do_json {
        let json_dir = generated_dir.join("json");
        fs::create_dir_all(&json_dir).expect("Failed to create json directory");
        
        let public_json_dir = project_root.join("public").join("generated").join("json");
        fs::create_dir_all(&public_json_dir).expect("Failed to create public json directory");

        for (rel_path, _title, ast) in &entries {
            let json_content = serde_json::to_string_pretty(ast).expect("Failed to serialize AST");
            
            // Save to generated/
            let output_path = json_dir.join(format!("{}.json", rel_path));
            if let Some(parent) = output_path.parent() {
                fs::create_dir_all(parent).expect("Failed to create parent dir");
            }
            fs::write(&output_path, &json_content).expect("Failed to write JSON file");

            // Save to public/ (so Trunk serves it)
            let public_path = public_json_dir.join(format!("{}.json", rel_path));
            if let Some(parent) = public_path.parent() {
                fs::create_dir_all(parent).expect("Failed to create public parent dir");
            }
            fs::write(&public_path, &json_content).expect("Failed to write public JSON file");
        }
        println!("Generated JSON ASTs in generated/json/ and public/generated/json/");
    }

    // 3. Generate Embedded Rust Data
    let mut rust_data = String::from("use md_compiler::parser::ast::Node;\n");
    rust_data.push_str("use serde_json;\n\n");
    
    rust_data.push_str("pub struct DocEntry {\n");
    rust_data.push_str("    pub path: &'static str,\n");
    rust_data.push_str("    pub title: &'static str,\n");
    rust_data.push_str("}\n\n");

    rust_data.push_str("pub const DOCS: &[DocEntry] = &[\n");
    for (rel_path, title, _) in &entries {
        rust_data.push_str(&format!(
            "    DocEntry {{ path: \"{}\", title: \"{}\" }},\n",
            rel_path, title
        ));
    }
    rust_data.push_str("];\n\n");

    rust_data.push_str("pub fn get_ast(path: &str) -> Option<Node> {\n");
    rust_data.push_str("    let json = match path {\n");
    for (rel_path, _, _) in &entries {
        // Use include_str! to embed the JSON file generated in Step 2
        rust_data.push_str(&format!(
            "        \"{}\" => include_str!(\"../generated/json/{}.json\"),\n",
            rel_path, rel_path
        ));
    }
    rust_data.push_str("        _ => return None,\n");
    rust_data.push_str("    };\n");
    rust_data.push_str("    serde_json::from_str(json).ok()\n");
    rust_data.push_str("}\n");

    let docs_data_path = project_root.join("src").join("docs_data.rs");
    fs::write(&docs_data_path, rust_data).expect("Failed to write docs_data.rs");

    println!("\nMarkdown compilation complete: {} files embedded in src/docs_data.rs", entries.len());
}

pub(crate) fn generate_rust_mod_files(generated_dir: &Path, entries: &[(String, String, md_compiler::parser::ast::Node)]) {
    let mut root_mod = String::new();
    for (rel_path, _, _) in entries {
        let module_name = path_to_module_name(rel_path);
        root_mod.push_str(&format!("pub mod {};\n", module_name));
    }
    let root_mod_path = generated_dir.join("mod.rs");
    fs::write(&root_mod_path, root_mod).expect("Failed to write root mod.rs");
}
