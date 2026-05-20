use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use thiserror::Error;

#[derive(Error, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum CompilerError {
    #[error("IO error: {0}")]
    Io(String),

    #[error("JSON error: {0}")]
    Json(String),

    #[error("Parsing error at {line}:{col}: {message}")]
    ParseError {
        line: usize,
        col: usize,
        message: String,
    },

    #[error("Invalid heading level: {0}")]
    InvalidHeadingLevel(u8),

    #[error("Malformed attribute: {0}")]
    MalformedAttribute(String),

    #[error("File not found: {0}")]
    FileNotFound(PathBuf),
}

pub type CompilerResult<T> = Result<T, CompilerError>;
