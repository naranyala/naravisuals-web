pub mod callout;

use crate::parser::ast::Node;

/// Plugin trait for extending markdown parsing
pub trait MarkdownPlugin: Send + Sync {
    /// Plugin name
    fn name(&self) -> &str;
    
    /// Render an extension node as Rust/Leptos code
    /// Return Some(code) to handle, None to skip
    fn render_extension_rust(&self, node: &Node) -> Option<String> {
        let _ = node;
        None
    }
    
    /// Override standard node rendering as Rust/Leptos code
    fn render_node_rust(&self, node: &Node) -> Option<String> {
        let _ = node;
        None
    }
}

/// Plugin registry
pub struct PluginRegistry {
    plugins: Vec<Box<dyn MarkdownPlugin>>,
}

impl PluginRegistry {
    pub fn new() -> Self {
        Self { plugins: Vec::new() }
    }
    
    pub fn register(&mut self, plugin: Box<dyn MarkdownPlugin>) {
        self.plugins.push(plugin);
    }
    
    pub fn render_extension(&self, node: &Node) -> Option<String> {
        for plugin in &self.plugins {
            if let Some(code) = plugin.render_extension_rust(node) {
                return Some(code);
            }
        }
        None
    }
    
    pub fn render_node(&self, node: &Node) -> Option<String> {
        for plugin in &self.plugins {
            if let Some(code) = plugin.render_node_rust(node) {
                return Some(code);
            }
        }
        None
    }
}

impl Default for PluginRegistry {
    fn default() -> Self {
        Self::new()
    }
}
