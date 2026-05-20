use crate::parser::ast::Node;

pub fn has_valid_prefix(name: &str) -> bool {
    let parts: Vec<&str> = name.splitn(2, '-').collect();
    if parts.len() < 2 {
        return false;
    }
    !parts[0].is_empty() && parts[0].chars().all(|c| c.is_ascii_digit())
}

pub fn extract_title(content: &str) -> String {
    content
        .lines()
        .find(|line| line.trim().starts_with("# "))
        .map(|line| line.trim().trim_start_matches("# ").trim().to_string())
        .unwrap_or_default()
}

pub fn path_to_component_name(rel_path: &str) -> String {
    let mut result = String::from("Doc");
    result.push_str(
        &rel_path
            .split('/')
            .flat_map(|part| part.split('-'))
            .map(|s| {
                let mut chars = s.chars();
                match chars.next() {
                    None => String::new(),
                    Some(c) => c.to_uppercase().to_string() + chars.as_str(),
                }
            })
            .collect::<String>(),
    );
    result
}

pub fn path_to_module_name(rel_path: &str) -> String {
    let clean = rel_path.replace('-', "_");
    format!("doc_{}", clean.replace('/', "_"))
}

pub fn extract_all_text(node: &Node) -> String {
    match node {
        Node::Document(children) => children.iter().map(extract_all_text).collect(),
        Node::Heading { children, .. } => children.iter().map(extract_all_text).collect(),
        Node::Paragraph(children) => children.iter().map(extract_all_text).collect(),
        Node::Text(text) => text.clone(),
        Node::InlineCode(code) => code.clone(),
        Node::CodeBlock { code, .. } => code.clone(),
        Node::Bold(children) => children.iter().map(extract_all_text).collect(),
        Node::Italic(children) => children.iter().map(extract_all_text).collect(),
        Node::Link { text, .. } => text.clone(),
        Node::Image { alt, .. } => alt.clone(),
        Node::UnorderedList(items) => items
            .iter()
            .map(|i| extract_all_text(&Node::ListItem(i.children.clone())))
            .collect(),
        Node::OrderedList(items) => items
            .iter()
            .map(|i| extract_all_text(&Node::ListItem(i.children.clone())))
            .collect(),
        Node::ListItem(children) => children.iter().map(extract_all_text).collect(),
        Node::Blockquote(children) => children.iter().map(extract_all_text).collect(),
        Node::Table { headers, rows } => {
            let mut text = headers
                .iter()
                .map(extract_all_text)
                .collect::<Vec<_>>()
                .join(" ");
            text.push(' ');
            text.push_str(
                &rows
                    .iter()
                    .map(|row| {
                        row.iter()
                            .map(extract_all_text)
                            .collect::<Vec<_>>()
                            .join(" ")
                    })
                    .collect::<Vec<_>>()
                    .join(" "),
            );
            text
        }
        Node::HorizontalRule => String::new(),
        Node::Extension {
            children, content, ..
        } => {
            let mut res = content.clone();
            res.push(' ');
            res.push_str(
                &children
                    .iter()
                    .map(extract_all_text)
                    .collect::<Vec<_>>()
                    .join(" "),
            );
            res
        }
        Node::RawHtml(_) => String::new(),
    }
}
