use crate::compiler::context::{CompilationContext, CompilerConfig};
use crate::core::Logger;
use std::fs;
use std::path::Path;

pub trait IFileSystem {
    fn read(&self, path: &Path) -> anyhow::Result<String>;
    fn write(&self, path: &Path, content: &str) -> anyhow::Result<()>;
    fn exists(&self, path: &Path) -> bool;
    fn mkdir(&self, path: &Path, recursive: bool) -> anyhow::Result<()>;
    fn rm(&self, path: &Path, recursive: bool, force: bool) -> anyhow::Result<()>;
}

pub struct DefaultFileSystem;
impl IFileSystem for DefaultFileSystem {
    fn read(&self, path: &Path) -> anyhow::Result<String> {
        fs::read_to_string(path).map_err(Into::into)
    }
    fn write(&self, path: &Path, content: &str) -> anyhow::Result<()> {
        fs::write(path, content).map_err(Into::into)
    }
    fn exists(&self, path: &Path) -> bool {
        path.exists()
    }
    fn mkdir(&self, path: &Path, recursive: bool) -> anyhow::Result<()> {
        if recursive {
            fs::create_dir_all(path).map_err(Into::into)
        } else {
            fs::create_dir(path).map_err(Into::into)
        }
    }
    fn rm(&self, path: &Path, recursive: bool, _force: bool) -> anyhow::Result<()> {
        if recursive {
            fs::remove_dir_all(path).map_err(Into::into)
        } else if path.is_dir() {
            fs::remove_dir(path).map_err(Into::into)
        } else {
            fs::remove_file(path).map_err(Into::into)
        }
    }
}

pub struct CompilerContainer {
    pub config: CompilerConfig,
    pub logger: Logger,
    pub context: CompilationContext,
    pub fs: Box<dyn IFileSystem>,
}

impl CompilerContainer {
    pub fn new(config: CompilerConfig, fs: Option<Box<dyn IFileSystem>>) -> Self {
        let context = CompilationContext::from_config(config.clone());
        let logger = Logger::new();
        let fs = fs.unwrap_or_else(|| Box::new(DefaultFileSystem));
        
        Self {
            config,
            logger,
            context,
            fs,
        }
    }
}
