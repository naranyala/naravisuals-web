pub struct SearchResult {
    pub title: String,
    pub path: String,
    #[allow(dead_code)]
    pub heading: Option<String>,
    pub snippet: Option<String>,
}

pub fn highlight_match(text: &str, query: &str) -> String {
    let lower_text = text.to_lowercase();
    let lower_query = query.to_lowercase();

    if let Some(pos) = lower_text.find(&lower_query) {
        let start = pos.saturating_sub(30);
        let end = (pos + query.len() + 30).min(text.len());

        let mut snippet = String::new();
        if start > 0 {
            snippet.push_str("...");
        }

        let snippet_text = &text[start..end];
        let lower_snippet = snippet_text.to_lowercase();
        let mut last_pos = 0;

        while let Some(match_pos) = lower_snippet[last_pos..].find(&lower_query) {
            let absolute_match_pos = last_pos + match_pos;
            snippet.push_str(&snippet_text[last_pos..absolute_match_pos]);
            snippet.push_str("<mark>");
            snippet.push_str(
                &snippet_text[absolute_match_pos..absolute_match_pos + lower_query.len()],
            );
            snippet.push_str("</mark>");
            last_pos = absolute_match_pos + lower_query.len();
        }

        snippet.push_str(&snippet_text[last_pos..]);

        if end < text.len() {
            snippet.push_str("...");
        }
        snippet
    } else {
        text.to_string()
    }
}

#[allow(dead_code)]
pub fn extract_headings_simple(content: &str) -> Vec<String> {
    content
        .lines()
        .filter(|line| line.starts_with('#'))
        .map(|line| line.trim_start_matches('#').trim().to_string())
        .collect()
}
