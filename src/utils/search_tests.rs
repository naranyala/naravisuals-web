#[cfg(test)]
mod tests {
    use crate::utils::search::{extract_headings_simple, highlight_match};

    #[test]
    fn test_highlight_match_middle() {
        let text = "The quick brown fox jumps over the lazy dog";
        let query = "brown fox";
        let highlighted = highlight_match(text, query);
        assert!(highlighted.contains("<mark>brown fox</mark>"));
        assert!(highlighted.contains("The quick "));
        assert!(highlighted.contains(" jumps over"));
    }

    #[test]
    fn test_highlight_match_start() {
        let text = "Apple is a fruit";
        let query = "Apple";
        let highlighted = highlight_match(text, query);
        assert!(highlighted.starts_with("<mark>Apple</mark>"));
    }

    #[test]
    fn test_highlight_match_end() {
        let text = "The end is here";
        let query = "here";
        let highlighted = highlight_match(text, query);
        assert!(highlighted.ends_with("<mark>here</mark>"));
    }

    #[test]
    fn test_highlight_match_case_insensitive() {
        let text = "Rust is great";
        let query = "RUST";
        let highlighted = highlight_match(text, query);
        assert!(highlighted.contains("<mark>Rust</mark>"));
    }

    #[test]
    fn test_highlight_no_match() {
        let text = "Hello world";
        let query = "foo";
        let highlighted = highlight_match(text, query);
        assert_eq!(highlighted, "Hello world");
    }

    #[test]
    fn test_highlight_multiple_matches() {
        let text = "Rust is rusty and rust is fast";
        let query = "rust";
        let highlighted = highlight_match(text, query);
        let count = highlighted.matches("<mark>").count();
        assert_eq!(count, 3);
    }

    #[test]
    fn test_extract_headings() {
        let content = "# Title\nSome text\n## Subtitle\nMore text";
        let headings = extract_headings_simple(content);
        assert_eq!(headings, vec!["Title", "Subtitle"]);
    }

    #[test]
    fn test_extract_headings_none() {
        let content = "Just some text\nNo headings here";
        let headings = extract_headings_simple(content);
        assert!(headings.is_empty());
    }

    #[test]
    fn test_extract_headings_mixed() {
        let content = "Text\n# H1\nText\n### H3\nText\n## H2";
        let headings = extract_headings_simple(content);
        assert_eq!(headings, vec!["H1", "H3", "H2"]);
    }
}
