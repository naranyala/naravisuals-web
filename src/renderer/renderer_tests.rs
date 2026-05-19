#[cfg(test)]
mod tests {
    use super::*;
    use md_compiler::parser::ast::Node;

    #[test]
    fn test_generate_id_simple() {
        let children = vec![Node::Text("Hello World".to_string())];
        assert_eq!(RuntimeRenderer::generate_id(&children), "hello-world");
    }

    #[test]
    fn test_generate_id_complex() {
        let children = vec![
            Node::Text("Getting ".to_string()),
            Node::Bold(vec![Node::Text("Started".to_string())]),
            Node::Text(" with Rust!".to_string()),
        ];
        // Only text nodes are used for IDs in current implementation
        assert_eq!(RuntimeRenderer::generate_id(&children), "getting-with-rust");
    }

    #[test]
    fn test_generate_id_special_chars() {
        let children = vec![Node::Text("Hello @ World #2024!".to_string())];
        assert_eq!(RuntimeRenderer::generate_id(&children), "hello--world-2024");
    }
}
