pub struct SearchResult {
    pub title: String,
    pub path: String,
    pub heading: Option<String>,
    pub snippet: Option<String>,
}

pub fn highlight_match(text: &str, query: &str) -> String {
    let lower = text.to_lowercase();
    if let Some(pos) = lower.find(&query.to_lowercase()) {
        let start = if pos > 30 { pos - 30 } else { 0 };
        let end = (pos + query.len() + 30).min(text.len());
        let mut snippet = String::new();
        if start > 0 {
            snippet.push_str("...");
        }
        snippet.push_str(&text[start..pos]);
        snippet.push_str("<mark>");
        snippet.push_str(&text[pos..pos + query.len()]);
        snippet.push_str("</mark>");
        snippet.push_str(&text[pos + query.len()..end]);
        if end < text.len() {
            snippet.push_str("...");
        }
        snippet
    } else {
        text.to_string()
    }
}

pub fn extract_headings_simple(content: &str) -> Vec<String> {
    content.lines()
        .filter(|line| line.starts_with('#'))
        .map(|line| {
            line.trim_start_matches('#').trim().to_string()
        })
        .collect()
}
