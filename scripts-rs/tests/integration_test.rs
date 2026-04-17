use scripts_rs::core::{Logger, Paths};
use scripts_rs::build_docs::build_docs;
use std::fs;
use tempfile::tempdir;

#[test]
fn test_full_build_process() {
    let dir = tempdir().expect("Failed to create temp dir");
    let root = dir.path().to_path_buf();
    
    // Create minimal environment: package.json for Paths::new()
    fs::write(root.join("package.json"), "{}").expect("Failed to write package.json");
    
    // Create docs directory
    let docs_dir = root.join("docs");
    fs::create_dir_all(&docs_dir).expect("Failed to create docs dir");
    
    // Create a few dummy md files
    let doc1_content = "---\ntitle: Doc 1\ndescription: Desc 1\n---\n# Hello\nLink to [Other](/docs/other)";
    fs::write(docs_dir.join("first.md"), doc1_content).expect("Failed to write doc1");
    
    let doc2_content = "---\ntitle: Doc 2\ndescription: Desc 2\n---\n# Other\nContent";
    fs::write(docs_dir.join("other.md"), doc2_content).expect("Failed to write doc2");
    
    let paths = Paths::with_root(root.clone());
    let logger = Logger::new();
    
    // Run build
    let result = build_docs(&paths, &logger);
    assert!(result.is_ok(), "build_docs failed: {:?}", result.err());
    
    // Check if output files are generated
    let gen_dir = root.join("src").join("generated");
    assert!(gen_dir.exists());
    
    assert!(gen_dir.join("sidebar.ts").exists());
    assert!(gen_dir.join("index.ts").exists());
    assert!(gen_dir.join("docs").join("first.ts").exists());
    assert!(gen_dir.join("docs").join("other.ts").exists());
}
