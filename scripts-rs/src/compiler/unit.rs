use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use crate::build_docs::TocItem;
use smol_str::SmolStr;
use fxhash::FxHashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocMetadata {
    pub title: SmolStr,
    pub description: SmolStr,
    pub sidebar_label: SmolStr,
    pub sidebar_position: usize,
    pub category: SmolStr,
    pub original_category: Option<SmolStr>,
    pub slug: SmolStr,
    pub date: Option<SmolStr>,
    pub author: Option<SmolStr>,
    pub tags: Option<Vec<SmolStr>>,
    pub custom: FxHashMap<SmolStr, Value>,
}

#[derive(Debug, Clone)]
pub struct CompilationUnit {
    pub id: SmolStr,
    pub file_path: PathBuf,
    pub rel_path: SmolStr,
    pub raw_content: String, // Full file content
    pub section: SmolStr,
    pub metadata: Option<DocMetadata>,
    pub clean_content: String, // Markdown without frontmatter
    pub content: String,       // Transformed markdown content
    pub html: Option<String>,
    pub toc: Option<Vec<TocItem>>,
    pub ast: Option<Value>, // Serialized token stream
}

