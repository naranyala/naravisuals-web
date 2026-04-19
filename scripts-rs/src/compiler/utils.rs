use regex::Regex;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeBlockMeta {
    pub lang: String,
    pub title: Option<String>,
    pub desc: Option<String>,
    pub label: Option<String>,
    pub copy: bool,
    pub zoom: bool,
}

impl Default for CodeBlockMeta {
    fn default() -> Self {
        Self {
            lang: String::new(),
            title: None,
            desc: None,
            label: None,
            copy: true,
            zoom: true,
        }
    }
}

pub fn parse_code_info(info: Option<&str>) -> CodeBlockMeta {
    let info = match info {
        Some(i) if !i.is_empty() => i.trim(),
        _ => return CodeBlockMeta::default(),
    };

    // 1. Try to parse the new syntax: lang { key="value" }
    let brace_re = Regex::new(r"^([^\s{]+)\s*\{([\s\S]*)\}\s*$").unwrap();
    if let Some(caps) = brace_re.captures(info) {
        let lang = caps[1].trim().to_string();
        let rest = caps[2].trim();

        let title_re = Regex::new(r#"title\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^"'\s{}]+))"#).unwrap();
        let desc_re = Regex::new(r#"desc(?:ription)?\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^"'\s{}]+))"#).unwrap();
        let label_re = Regex::new(r#"label\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^"'\s{}]+))"#).unwrap();
        let copy_re = Regex::new(r#"(?i)copy\s*=\s*["']?(true|false)["']?"#).unwrap();
        let zoom_re = Regex::new(r#"(?i)zoom\s*=\s*["']?(true|false)["']?"#).unwrap();

        return CodeBlockMeta {
            lang,
            title: title_re.captures(rest).and_then(|c| c.get(1).or(c.get(2)).or(c.get(3))).map(|m| m.as_str().to_string()),
            desc: desc_re.captures(rest).and_then(|c| c.get(1).or(c.get(2)).or(c.get(3))).map(|m| m.as_str().to_string()),
            label: label_re.captures(rest).and_then(|c| c.get(1).or(c.get(2)).or(c.get(3))).map(|m| m.as_str().to_string()),
            copy: copy_re.captures(rest).map(|c| c[1].to_lowercase() == "true").unwrap_or(true),
            zoom: zoom_re.captures(rest).map(|c| c[1].to_lowercase() == "true").unwrap_or(true),
        };
    }

    // 2. Fall back to existing colon syntax: lang:key=value
    let parts: Vec<&str> = info.split(':').collect();
    let lang_raw = parts[0].trim();
    let lang = if lang_raw.is_empty() { "text".to_string() } else { lang_raw.to_string() };

    let mut meta = CodeBlockMeta {
        lang: match lang.to_lowercase().as_str() {
            "txt" | "text" | "plain" | "plaintext" | "" => "text".to_string(),
            _ => lang,
        },
        ..Default::default()
    };

    for part in parts.iter().skip(1) {
        let part = part.trim();
        if let Some(eq_idx) = part.find('=') {
            let key = part[..eq_idx].trim().to_lowercase();
            let val = part[eq_idx + 1..].trim().trim_matches('"').trim_matches('\'').to_string();
            
            match key.as_str() {
                "title" => meta.title = Some(val),
                "desc" | "description" => meta.desc = Some(val),
                "label" => meta.label = Some(val),
                "copy" => meta.copy = val.to_lowercase() == "true",
                "zoom" => meta.zoom = val.to_lowercase() == "true",
                _ => {}
            }
        }
    }

    meta
}

pub fn code_block_wrapper(inner: &str, meta: &CodeBlockMeta) -> String {
    let lang_label = meta.label.clone().unwrap_or_else(|| {
        if meta.lang.is_empty() {
            String::new()
        } else {
            let mut c = meta.lang.chars();
            match c.next() {
                None => String::new(),
                Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
            }
        }
    });

    let title_html = match &meta.title {
        Some(t) => format!(r#"<span class="code-title">{}</span>"#, t.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;")),
        None => String::new(),
    };

    let desc_html = match &meta.desc {
        Some(d) => format!(r#"<div class="code-desc">{}</div>"#, d.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;")),
        None => String::new(),
    };

    let copy_btn_html = if meta.copy {
        r#"<button class="code-copy-btn" aria-label="Copy code" onclick="copyCode(this)">Copy</button>"#
    } else {
        ""
    };

    format!(
        r#"<div class="code-block" data-lang="{}" data-copy="{}" data-zoom="{}"><div class="code-header"><span class="code-lang">{}</span>{}{}</div>{}{}</div>"#,
        meta.lang, meta.copy, meta.zoom, lang_label, title_html, copy_btn_html, inner, desc_html
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_code_info_plain() {
        let meta = parse_code_info(Some("typescript"));
        assert_eq!(meta.lang, "typescript");
        assert!(meta.copy);
        assert!(meta.zoom);
    }

    #[test]
    fn test_parse_code_info_colon() {
        let meta = parse_code_info(Some("typescript:title=src/store.ts"));
        assert_eq!(meta.lang, "typescript");
        assert_eq!(meta.title.unwrap(), "src/store.ts");
    }

    #[test]
    fn test_parse_code_info_brace_simple() {
        let meta = parse_code_info(Some("typescript { title=\"src/store.ts\" }"));
        assert_eq!(meta.lang, "typescript");
        assert_eq!(meta.title.unwrap(), "src/store.ts");
    }

    #[test]
    fn test_parse_code_info_brace_multiple() {
        let meta = parse_code_info(Some("rust { title=\"main.rs\" desc=\"Entry point\" copy=false }"));
        assert_eq!(meta.lang, "rust");
        assert_eq!(meta.title.unwrap(), "main.rs");
        assert_eq!(meta.desc.unwrap(), "Entry point");
        assert!(!meta.copy);
    }

    #[test]
    fn test_parse_code_info_brace_unquoted() {
        let meta = parse_code_info(Some("json { copy=true zoom=false }"));
        assert!(meta.copy);
        assert!(!meta.zoom);
    }

    #[test]
    fn test_code_block_wrapper_basic() {
        let meta = CodeBlockMeta {
            lang: "rust".to_string(),
            ..Default::default()
        };
        let html = code_block_wrapper("<pre><code>code</code></pre>", &meta);
        assert!(html.contains("Rust"));
        assert!(html.contains("code-block"));
        assert!(html.contains("code-copy-btn"));
    }

    #[test]
    fn test_code_block_wrapper_with_title() {
        let meta = CodeBlockMeta {
            lang: "rust".to_string(),
            title: Some("main.rs".to_string()),
            ..Default::default()
        };
        let html = code_block_wrapper("<pre><code>code</code></pre>", &meta);
        assert!(html.contains("main.rs"));
        assert!(html.contains("code-title"));
    }
}
