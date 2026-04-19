pub mod unit;
pub mod context;
pub mod pipeline;
pub mod engine;
pub mod middlewares;
pub mod ast;
pub mod utils;

pub use unit::{CompilationUnit, DocMetadata};
pub use context::{CompilationContext, CompilerConfig};
pub use pipeline::CompilerMiddleware;
pub use engine::DocumentationCompiler;
pub use middlewares::*;
