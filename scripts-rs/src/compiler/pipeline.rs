use crate::compiler::unit::CompilationUnit;
use crate::compiler::container::CompilerContainer;
use pulldown_cmark::Event;

pub trait CompilerMiddleware {
    fn name(&self) -> &'static str;
    
    /// Run during file discovery, before any parsing
    fn on_ingest(&mut self, _unit: &mut CompilationUnit, _container: &mut CompilerContainer) {}
    
    /// Run after frontmatter is parsed but before markdown lexing
    fn on_pre_parse(&mut self, _unit: &mut CompilationUnit, _container: &mut CompilerContainer) {}
    
    /// Run after string-based transformations, before pulldown-cmark parsing
    fn on_transform(&mut self, _unit: &mut CompilationUnit, _container: &mut CompilerContainer) {}
    
    /// Run during token-aware parsing (Rust specific)
    fn on_transform_events<'a>(&mut self, _events: &mut Vec<Event<'a>>, _container: &mut CompilerContainer) {}
    
    /// Run after HTML is generated
    fn on_post_process(&mut self, _unit: &mut CompilationUnit, _container: &mut CompilerContainer) {}

    /// Run after all units are processed (for global analysis)
    fn on_assemble(&mut self, _units: &mut [CompilationUnit], _container: &mut CompilerContainer) {}
}
