use std::fs;
use std::path::Path;

fn has_valid_prefix(name: &str) -> bool {
    let parts: Vec<&str> = name.splitn(2, '-').collect();
    if parts.len() < 2 {
        return false;
    }
    !parts[0].is_empty() && parts[0].chars().all(|c| c.is_ascii_digit())
}

fn walk_dir(dir: &Path, base_dir: &Path, entries: &mut Vec<(String, String, String)>) {
    if let Ok(read_dir) = fs::read_dir(dir) {
        let mut paths: Vec<_> = read_dir.flatten().collect();
        paths.sort_by_key(|e| e.path());

        for entry in paths {
            let path = entry.path();
            let filename = path.file_name().unwrap().to_string_lossy();

            if path.is_dir() {
                if !has_valid_prefix(&filename) {
                    println!("cargo:warning=Directory '{}' should start with a numeric prefix (e.g., '01-category')", filename);
                }
                walk_dir(&path, base_dir, entries);
            } else if path.extension().map_or(false, |ext| ext == "md") {
                if !has_valid_prefix(&filename) {
                    println!("cargo:warning=Markdown file '{}' should start with a numeric prefix (e.g., '01-title.md')", filename);
                }
                
                let content = fs::read_to_string(&path).unwrap_or_default();
                let title = content
                    .lines()
                    .find(|line| line.trim().starts_with("# "))
                    .map(|line| line.trim().trim_start_matches("# ").trim().to_string())
                    .unwrap_or_else(|| filename.trim_end_matches(".md").to_string());

                let relative_path = path.strip_prefix(base_dir).unwrap()
                    .with_extension("")
                    .to_string_lossy()
                    .into_owned();

                entries.push((relative_path, title, path.to_string_lossy().into_owned()));
            }
        }
    }
}

fn main() {
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let docs_dir = Path::new(&manifest_dir).join("docs");
    
    let mut entries = Vec::new();

    if docs_dir.is_dir() {
        walk_dir(&docs_dir, &docs_dir, &mut entries);
    }

    let mut rust_code = String::from("pub struct DocEntry { pub path: &'static str, pub title: &'static str, pub content: &'static str }\n\n");
    rust_code.push_str("pub const DOCS: &[DocEntry] = &[\n");
    
    for (rel_path, title, _full_path) in entries {
        // The include_str! path must be relative to src/docs_data.rs
        // rel_path is like "folder/file" or "file"
        rust_code.push_str(&format!(
            "    DocEntry {{ path: \"{}\", title: \"{}\", content: include_str!(\"../docs/{}.md\") }},\n",
            rel_path, title, rel_path
        ));
    }
    rust_code.push_str("];\n");

    let out_path = Path::new(&manifest_dir).join("src").join("docs_data.rs");
    fs::write(out_path, rust_code).expect("Unable to write docs_data.rs");

    println!("cargo:rerun-if-changed=docs");
}
