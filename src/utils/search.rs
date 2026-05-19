use pulldown_cmark::{Parser, Event, Tag, TagEnd};

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

pub fn render_markdown_with_heading_ids(text: &str) -> String {
    let parser = Parser::new(text);
    let mut html_output = String::new();
    let mut heading_buffer = String::new();
    let mut in_heading = false;
    let mut heading_level = 0;

    for event in parser {
        match event {
            Event::Start(Tag::Heading { level, .. }) => {
                in_heading = true;
                heading_level = level as usize;
                heading_buffer.clear();
                html_output.push_str("<h");
                html_output.push_str(&level.to_string());
            }
            Event::End(TagEnd::Heading(_)) => {
                if in_heading {
                    let id = heading_buffer.to_lowercase().replace(' ', "-");
                    html_output.push_str(&format!(" id=\"{}\">", id));
                    html_output.push_str(&heading_buffer);
                    html_output.push_str("</h");
                    html_output.push_str(&heading_level.to_string());
                    html_output.push('>');
                    in_heading = false;
                }
            }
            Event::Text(text) => {
                if in_heading {
                    heading_buffer.push_str(&text);
                } else {
                    html_output.push_str(&text);
                }
            }
            _ => {
                if !in_heading {
                    let mut buf = String::new();
                    pulldown_cmark::html::push_html(&mut buf, std::iter::once(event));
                    html_output.push_str(&buf);
                }
            }
        }
    }
    html_output
}