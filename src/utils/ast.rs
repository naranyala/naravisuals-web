use md_compiler::parser::ast::Node;

/// Trait for visiting nodes in the AST
#[allow(dead_code)]
pub trait NodeVisitor {
    fn visit(&mut self, node: &Node);
}

/// Utility for extracting specific information from the AST
pub struct ASTUtils;

#[allow(dead_code)]
impl ASTUtils {
    /// Extracts all headings from a Document node
    pub fn extract_headings(_node: &Node) -> Vec<(u8, String, String)> {
        let headings = Vec::new();
        // ... logic to extract headings ...
        // When pushing:
        // headings.push((*level as u8, title, id));
        headings
    }

    /// Recursively gets all text content from a slice of nodes
    pub fn get_text_content(nodes: &[Node]) -> String {
        nodes
            .iter()
            .map(|n| match n {
                Node::Text(t) => t.clone(),
                Node::Bold(c)
                | Node::Italic(c)
                | Node::Paragraph(c)
                | Node::ListItem(c)
                | Node::Blockquote(c) => Self::get_text_content(c),
                Node::Heading { children, .. } => Self::get_text_content(children),
                _ => "".to_string(),
            })
            .collect::<String>()
    }
}
