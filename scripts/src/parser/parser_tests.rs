#[cfg(test)]
mod tests {
    use crate::parser::{parse, ast::Node};

    #[test]
    fn test_parse_simple_paragraph() {
        let input = "Hello world";
        let ast = parse(input);
        if let Node::Document(children) = ast {
            assert_eq!(children.len(), 1);
            if let Node::Paragraph(p_children) = &children[0] {
                assert_eq!(p_children[0], Node::Text("Hello world".to_string()));
            } else { panic!("Expected Paragraph"); }
        } else { panic!("Expected Document"); }
    }

    #[test]
    fn test_parse_nested_bold_italic() {
        let input = "**bold _italic_**";
        let ast = parse(input);
        if let Node::Document(children) = ast {
            if let Node::Paragraph(p_children) = &children[0] {
                if let Node::Bold(b_children) = &p_children[0] {
                    assert!(b_children.contains(&Node::Italic(vec![Node::Text("italic".to_string())])));
                } else { panic!("Expected Bold"); }
            } else { panic!("Expected Paragraph"); }
        } else { panic!("Expected Document"); }
    }

    #[test]
    fn test_parse_lists() {
        let input = "- item 1\n- item 2";
        let ast = parse(input);
        if let Node::Document(children) = ast {
            if let Node::UnorderedList(items) = &children[0] {
                assert_eq!(items.len(), 2);
            } else { panic!("Expected UnorderedList"); }
        } else { panic!("Expected Document"); }
    }

    #[test]
    fn test_parse_empty_input() {
        let ast = parse("");
        if let Node::Document(children) = ast {
            assert!(children.is_empty());
        } else { panic!("Expected Document"); }
    }

    #[test]
    fn test_parse_only_blank_lines() {
        let ast = parse("\n\n\n");
        if let Node::Document(children) = ast {
            assert!(children.is_empty());
        } else { panic!("Expected Document"); }
    }

    #[test]
    fn test_parse_malformed_extension() {
        let input = ":::info\nNo closing tag";
        let ast = parse(input);
        // Should not crash and should handle it gracefully
        match ast {
            Node::Document(_) => (),
            _ => panic!("Should always return Document"),
        }
    }
}
