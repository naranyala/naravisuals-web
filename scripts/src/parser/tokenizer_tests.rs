#[cfg(test)]
mod tests {
    use crate::parser::tokenizer::{tokenize, Token};

    #[test]
    fn test_tokenize_headings() {
        assert_eq!(tokenize("# H1"), vec![Token::Heading { level: 1, content: "H1".to_string() }, Token::BlankLine]);
        assert_eq!(tokenize("### H3"), vec![Token::Heading { level: 3, content: "H3".to_string() }, Token::BlankLine]);
        // Edge case: Heading without space should be treated as text
        let tokens = tokenize("#NoSpace");
        assert!(!matches!(tokens[0], Token::Heading { .. }));
    }

    #[test]
    fn test_tokenize_code_blocks() {
        let input = "```rust\nlet x = 1;\n```";
        let tokens = tokenize(input);
        assert_eq!(tokens[0], Token::CodeBlock { 
            language: Some("rust".to_string()), 
            code: "let x = 1;".to_string() 
        });

        // Edge case: Markdown inside code block should NOT be tokenized
        let input_with_md = "```\n# Not a heading\n**Not bold**\n```";
        let tokens_with_md = tokenize(input_with_md);
        if let Token::CodeBlock { code, .. } = &tokens_with_md[0] {
            assert!(code.contains("# Not a heading"));
            assert!(code.contains("**Not bold**"));
        } else { panic!("Expected CodeBlock"); }
    }

    #[test]
    fn test_tokenize_inline_elements() {
        let input = "This is **bold** and `code`";
        let tokens = tokenize(input);
        assert!(tokens.contains(&Token::BoldStart));
        assert!(tokens.contains(&Token::InlineCode("code".to_string())));

        // Edge case: Imbalanced bold
        let tokens_imbalanced = tokenize("This is **bold but no end");
        assert!(!tokens_imbalanced.contains(&Token::BoldEnd));
    }

    #[test]
    fn test_tokenize_lists() {
        let input = "- item 1\n1. item 2";
        let tokens = tokenize(input);
        assert_eq!(tokens[0], Token::UnorderedListItem("item 1".to_string()));
        assert_eq!(tokens[1], Token::BlankLine);
        assert_eq!(tokens[2], Token::OrderedListItem("item 2".to_string()));

        // Edge case: Malformed ordered list
        let tokens_malformed = tokenize("not_a_number. item");
        assert!(!matches!(tokens_malformed[0], Token::OrderedListItem(_)));
    }

    #[test]
    fn test_tokenize_extensions() {
        let input = ":::info\nHello\n:::";
        let tokens = tokenize(input);
        assert!(matches!(tokens[0], Token::ExtensionStart { .. }));
        assert!(tokens.contains(&Token::Text("Hello".to_string())));
        assert!(tokens.contains(&Token::ExtensionEnd));

        // Edge case: Complex attributes
        let input_attrs = ":::callout type=\"warning\" priority=\"high\"\nContent\n:::";
        let tokens_attrs = tokenize(input_attrs);
        if let Token::ExtensionStart { attributes, .. } = &tokens_attrs[0] {
            assert_eq!(attributes.len(), 2);
            assert!(attributes.contains(&("type".to_string(), "\"warning\"".to_string())));
        } else { panic!("Expected ExtensionStart with attributes"); }
    }

    #[test]
    fn test_tokenize_links_images() {
        let input = "[Google](https://google.com) ![Alt](img.png)";
        let tokens = tokenize(input);
        assert!(matches!(tokens[0], Token::LinkStart { .. }));
        assert!(matches!(tokens[tokens.len()-2], Token::Image { .. }));

        // Edge case: Link with missing closing parenthesis
        let tokens_broken = tokenize("[Link](https://google.com");
        assert!(!tokens_broken.contains(&Token::LinkEnd));
    }
}
