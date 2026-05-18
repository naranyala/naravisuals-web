use std::fs;
use std::path::Path;

pub struct DocEntry {
    pub path: &'static str,
    pub title: &'static str,
    pub content: &'static str,
}

fn main() {
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let docs_dir = Path::new(&manifest_dir).join("docs");
    
    let mut entries = Vec::new();

    if docs_dir.is_dir() {
        let mut paths: Vec<_> = fs::read_dir(&docs_dir)
            .unwrap()
            .filter_map(|res| res.ok())
            .map(|e| e.path())
            .filter(|p| p.extension().map_or(false, |ext| ext == "md"))
            .collect();

        paths.sort();

        for path in paths {
            let filename = path.file_stem().unwrap().to_str().unwrap().to_string();
            let content = fs::read_to_string(&path).unwrap_or_default();
            
            let title = content
                .lines()
                .find(|line| line.trim().starts_with("# "))
                .map(|line| line.trim().trim_start_matches("# ").trim().to_string())
                .unwrap_or_else(|| filename.clone());

            entries.push((filename, title));
        }
    }

    let mut rust_code = String::from("pub struct DocEntry { pub path: &'static str, pub title: &'static str, pub content: &'static str }\n\n");
    rust_code.push_str("pub const DOCS: &[DocEntry] = &[\n");
    
    for (path, title) in entries {
        rust_code.push_str(&format!(
            "    DocEntry {{ path: \"{}\", title: \"{}\", content: include_str!(\"../docs/{}.md\") }},\n",
            path, title, path
        ));
    }
    rust_code.push_str("];\n");

    let out_path = Path::new(&manifest_dir).join("src").join("docs_data.rs");
    fs::write(out_path, rust_code).expect("Unable to write docs_data.rs");

    println!("cargo:rerun-if-changed=docs");
}
