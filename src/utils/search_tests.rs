#[cfg(test)]
mod tests {
    use super::*;

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
    fn test_highlight_match_case_insensitive() {
        let text = "Rust is great";
        let query = "RUST";
        let highlighted = highlight_match(text, query);
        assert!(highlighted.contains("<mark>Rust</mark>"));
    }

    #[test]
    fn test_extract_headings() {
        let content = "# Title\nSome text\n## Subtitle\nMore text";
        let headings = extract_headings_simple(content);
        assert_eq!(headings, vec!["Title", "Subtitle"]);
    }
}
