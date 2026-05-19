mod parser;
mod plugins;

use std::fs;
use std::path::Path;
use std::env;
use parser::{parse, rustgen::RustGenerator};
use plugins::{PluginRegistry, callout::CalloutPlugin};

fn has_valid_prefix(name: &str) -> bool {
    let parts: Vec<&str> = name.splitn(2, '-').collect();
    if parts.len() < 2 { return false; }
    !parts[0].is_empty() && parts[0].chars().all(|c| c.is_ascii_digit())
}

fn extract_title(content: &str) -> String {
    content.lines()
        .find(|line| line.trim().starts_with("# "))
        .map(|line| line.trim().trim_start_matches("# ").trim().to_string())
        .unwrap_or_default()
}

fn path_to_component_name(rel_path: &str) -> String {
    let mut result = String::from("Doc");
    result.push_str(&rel_path.split('/')
        .flat_map(|part| part.split('-'))
        .map(|s| {
            let mut chars = s.chars();
            match chars.next() {
                None => String::new(),
                Some(c) => c.to_uppercase().to_string() + chars.as_str(),
            }
        })
        .collect::<String>());
    result
}

fn path_to_module_name(rel_path: &str) -> String {
    let clean = rel_path.replace('-', "_");
    format!("doc_{}", clean.replace('/', "_"))
}

fn walk_dir(dir: &Path, base_dir: &Path, entries: &mut Vec<(String, String, parser::ast::Node)>) {
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

fn create_plugin_registry() -> PluginRegistry {
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
        
        let dist_json_dir = project_root.join("dist").join("generated").join("json");
        fs::create_dir_all(&dist_json_dir).expect("Failed to create dist json directory");

        for (rel_path, _title, ast) in &entries {
            let json_content = serde_json::to_string_pretty(ast).expect("Failed to serialize AST");
            
            // Save to generated/
            let output_path = json_dir.join(format!("{}.json", rel_path));
            if let Some(parent) = output_path.parent() {
                fs::create_dir_all(parent).expect("Failed to create parent dir");
            }
            fs::write(&output_path, &json_content).expect("Failed to write JSON file");

            // Save to dist/ (so it's served)
            let dist_path = dist_json_dir.join(format!("{}.json", rel_path));
            if let Some(parent) = dist_path.parent() {
                fs::create_dir_all(parent).expect("Failed to create dist parent dir");
            }
            fs::write(&dist_path, &json_content).expect("Failed to write dist JSON file");
        }
        println!("Generated JSON ASTs in generated/json/ and dist/generated/json/");
    }

    // 3. Generate manifest
    let mut manifest = String::from("// Auto-generated - DO NOT EDIT\n");
    manifest.push_str("use leptos::*;\n\n");
    manifest.push_str("mod generated;\nuse generated:*;\n\n");
    manifest.push_str("pub fn get_doc_component(path: &str) -> Option<impl Fn() -> leptos::View + Clone> {\n");
    manifest.push_str("    match path {\n");
    
    for (rel_path, _title, _) in &entries {
        let component_name = path_to_component_name(rel_path);
        manifest.push_str(&format!(
            "        \"{}\" => Some(|| {}.into_view()),\n",
            rel_path, component_name
        ));
    }
    
    manifest.push_str("        _ => None,\n");
    manifest.push_str("    }\n");
    manifest.push_str("}\n");

    let manifest_path = generated_dir.join("docs_data.rs");
    fs::write(&manifest_path, manifest).expect("Failed to write manifest");

    println!("\nMarkdown compilation complete: {} files processed", entries.len());
}

fn generate_rust_mod_files(generated_dir: &Path, entries: &[(String, String, parser::ast::Node)]) {
    let mut root_mod = String::new();
    for (rel_path, _, _) in entries {
        let module_name = path_to_module_name(rel_path);
        root_mod.push_str(&format!("pub mod {};\n", module_name));
    }
    let root_mod_path = generated_dir.join("mod.rs");
    fs::write(&root_mod_path, root_mod).expect("Failed to write root mod.rs");
}
