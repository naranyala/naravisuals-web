use std::path::Path;

pub fn has_valid_prefix(name: &str) -> bool {
    let parts: Vec<&str> = name.splitn(2, '-').collect();
    if parts.len() < 2 { return false; }
    !parts[0].is_empty() && parts[0].chars().all(|c| c.is_ascii_digit())
}

pub fn extract_title(content: &str) -> String {
    content.lines()
        .find(|line| line.trim().starts_with("# "))
        .map(|line| line.trim().trim_start_matches("# ").trim().to_string())
        .unwrap_or_default()
}

pub fn path_to_component_name(rel_path: &str) -> String {
    let mut result = String::from("Doc");
    result.push_str(&rel_path.split('/')
        .flat_map(|part| part.split('-'))
        .map(|s| {
            let mut chars = s.chars();
            match chars.next() {
                None => String::new(),
                Some(c) => c.to_uppercase().to_string() + chars.as_str(),
            }
        })
        .collect::<String>());
    result
}

pub fn path_to_module_name(rel_path: &str) -> String {
    let clean = rel_path.replace('-', "_");
    format!("doc_{}", clean.replace('/', "_"))
}
