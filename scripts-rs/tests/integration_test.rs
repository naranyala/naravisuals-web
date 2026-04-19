use scripts_rs::core::{Logger, Paths};
use scripts_rs::build_docs::build_docs;
use std::fs;
use tempfile::tempdir;

#[test]
fn test_full_build_process_success() {
    let dir = tempdir().expect("Failed to create temp dir");
    let root = dir.path().to_path_buf();
    
    // Setup environment
    fs::write(root.join("package.json"), "{}").expect("Failed to write package.json");
    let docs_dir = root.join("docs");
    fs::create_dir_all(&docs_dir).expect("Failed to create docs dir");
    
    // Document with everything
    let doc1_content = "---
title: Welcome
sidebar_label: Welcome Home
sidebar_position: 1
---
# Welcome
:::tip
Hello
:::
Math: $E=mc^2$";
    fs::write(docs_dir.join("welcome.md"), doc1_content).expect("Failed to write welcome.md");
    
    // Document in a category
    let guides_dir = docs_dir.join("01-guides");
    fs::create_dir_all(&guides_dir).expect("Failed to create guides dir");
    let doc2_content = "---
title: Guide One
---
# Guide
Link to [Welcome](/docs/welcome)";
    fs::write(guides_dir.join("guide1.md"), doc2_content).expect("Failed to write guide1.md");
    
    let paths = Paths::with_root(root.clone());
    let logger = Logger::new();
    
    // Run build
    let result = build_docs(&paths, &logger);
    assert!(result.is_ok(), "build_docs failed: {:?}", result.err());
    
    // Verify output
    let gen_dir = root.join("src").join("generated");
    assert!(gen_dir.join("sidebar.ts").exists());
    assert!(gen_dir.join("docs").join("welcome.ts").exists());
    assert!(gen_dir.join("docs").join("01-guides-guide1.ts").exists());
    
    // Check content of generated file
    let welcome_ts = fs::read_to_string(gen_dir.join("docs").join("welcome.ts")).unwrap();
    assert!(welcome_ts.contains("Welcome Home"));
    assert!(welcome_ts.contains("admonition-tip"));
    assert!(welcome_ts.contains("math-inline"));
}

#[test]
fn test_build_fails_on_missing_title() {
    let dir = tempdir().expect("Failed to create temp dir");
    let root = dir.path().to_path_buf();
    fs::write(root.join("package.json"), "{}").unwrap();
    let docs_dir = root.join("docs");
    fs::create_dir_all(&docs_dir).unwrap();
    
    // Missing title in frontmatter
    let doc_content = "---\ndescription: Oops\n---\n# Content";
    fs::write(docs_dir.join("bad.md"), doc_content).unwrap();
    
    let paths = Paths::with_root(root.clone());
    let logger = Logger::new();
    
    let result = build_docs(&paths, &logger);
    assert!(result.is_err());
    let err_msg = format!("{:?}", result.err());
    assert!(err_msg.contains("Compilation failed due to errors"));
}

#[test]
fn test_sidebar_generation_ordering() {
    let dir = tempdir().expect("Failed to create temp dir");
    let root = dir.path().to_path_buf();
    fs::write(root.join("package.json"), "{}").unwrap();
    let docs_dir = root.join("docs");
    fs::create_dir_all(&docs_dir).unwrap();
    
    fs::write(docs_dir.join("a.md"), "---\ntitle: A\nsidebar_position: 10\n---\n").unwrap();
    fs::write(docs_dir.join("b.md"), "---\ntitle: B\nsidebar_position: 1\n---\n").unwrap();
    
    let paths = Paths::with_root(root.clone());
    let logger = Logger::new();
    build_docs(&paths, &logger).unwrap();
    
    let sidebar_ts = fs::read_to_string(root.join("src").join("generated").join("sidebar.ts")).unwrap();
    // B should come before A in the JSON array because its position is 1
    let pos_a = sidebar_ts.find("\"title\": \"A\"").unwrap_or_else(|| sidebar_ts.find("\"label\": \"A\"").unwrap());
    let pos_b = sidebar_ts.find("\"title\": \"B\"").unwrap_or_else(|| sidebar_ts.find("\"label\": \"B\"").unwrap());
    assert!(pos_b < pos_a);
}
