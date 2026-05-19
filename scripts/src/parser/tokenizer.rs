/// Tokens produced by the tokenizer
#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    Text(String),
    Heading { level: u8, content: String },
    CodeBlock { language: Option<String>, code: String },
    InlineCode(String),
    BoldStart,
    BoldEnd,
    ItalicStart,
    ItalicEnd,
    LinkStart { url: String },
    LinkEnd,
    Image { url: String, alt: String },
    UnorderedListItem(String),
    OrderedListItem(String),
    Blockquote(String),
    HorizontalRule,
    BlankLine,
    ExtensionStart { name: String, attributes: Vec<(String, String)> },
    ExtensionEnd,
    RawHtml(String),
}

pub fn tokenize(input: &str) -> Vec<Token> {
    let mut tokens = Vec::new();
    let mut lines = input.lines().peekable();
    
    while let Some(line) = lines.next() {
        // Code blocks
        if line.starts_with("```") {
            let language = line[3..].trim().to_string();
            let language = if language.is_empty() { None } else { Some(language) };
            let mut code = String::new();
            while let Some(code_line) = lines.next() {
                if code_line.starts_with("```") { break; }
                if !code.is_empty() { code.push('\n'); }
                code.push_str(code_line);
            }
            tokens.push(Token::CodeBlock { language, code });
            continue;
        }
        
        // Extension blocks (:::name)
        if line.starts_with(":::") {
            let rest = &line[3..];
            let (name, attrs) = if let Some((n, a)) = rest.split_once(' ') {
                (n.to_string(), parse_attributes(a))
            } else {
                (rest.trim().to_string(), Vec::new())
            };
            tokens.push(Token::ExtensionStart { name, attributes: attrs });
            
            let mut content = String::new();
            while let Some(ext_line) = lines.next() {
                if ext_line.starts_with(":::") { break; }
                if !content.is_empty() { content.push('\n'); }
                content.push_str(ext_line);
            }
            tokens.extend(tokenize(&content));
            tokens.push(Token::ExtensionEnd);
            continue;
        }
        
        // Headings
        if let Some(level) = parse_heading(line) {
            tokens.push(Token::Heading { level, content: line[level as usize..].trim().to_string() });
            continue;
        }
        
        // Horizontal rule
        if line.trim().chars().all(|c| c == '-' || c == '_' || c == '*') && line.trim().len() >= 3 {
            tokens.push(Token::HorizontalRule);
            continue;
        }
        
        // Blockquotes
        if line.starts_with("> ") {
            tokens.push(Token::Blockquote(line[2..].to_string()));
            continue;
        }
        
        // Unordered list
        if let Some(content) = parse_list_item(line, '-') {
            tokens.push(Token::UnorderedListItem(content));
            continue;
        }
        if let Some(content) = parse_list_item(line, '*') {
            tokens.push(Token::UnorderedListItem(content));
            continue;
        }
        
        // Ordered list
        if let Some(content) = parse_ordered_list_item(line) {
            tokens.push(Token::OrderedListItem(content));
            continue;
        }
        
        // Raw HTML
        if line.trim().starts_with('<') {
            tokens.push(Token::RawHtml(line.to_string()));
            continue;
        }
        
        // Blank line
        if line.trim().is_empty() {
            tokens.push(Token::BlankLine);
            continue;
        }
        
        // Regular text with inline elements
        tokens.extend(tokenize_inline(line));
        tokens.push(Token::BlankLine);
    }
    
    tokens
}

fn parse_heading(line: &str) -> Option<u8> {
    let trimmed = line.trim_start();
    let level = trimmed.chars().take_while(|&c| c == '#').count() as u8;
    if level >= 1 && level <= 6 && trimmed.chars().nth(level as usize) == Some(' ') {
        Some(level)
    } else {
        None
    }
}

fn parse_list_item(line: &str, marker: char) -> Option<String> {
    let trimmed = line.trim_start();
    if trimmed.starts_with(&format!("{} ", marker)) {
        Some(trimmed[2..].to_string())
    } else {
        None
    }
}

fn parse_ordered_list_item(line: &str) -> Option<String> {
    let trimmed = line.trim_start();
    if let Some(pos) = trimmed.find(". ") {
        if pos > 0 && trimmed[..pos].chars().all(|c| c.is_ascii_digit()) {
            return Some(trimmed[pos + 2..].to_string());
        }
    }
    None
}

fn parse_attributes(input: &str) -> Vec<(String, String)> {
    let mut attrs = Vec::new();
    let mut current = input.trim();
    while !current.is_empty() {
        if let Some(eq_pos) = current.find('=') {
            let key = current[..eq_pos].trim().to_string();
            let rest = &current[eq_pos + 1..];
            if rest.starts_with('"') {
                if let Some(end_quote) = rest[1..].find('"') {
                    let value = rest[1..end_quote + 1].to_string();
                    attrs.push((key, value));
                    current = &rest[end_quote + 2..];
                } else { break; }
            } else { break; }
        } else { break; }
    }
    attrs
}

fn tokenize_inline(text: &str) -> Vec<Token> {
    let mut tokens = Vec::new();
    let mut chars = text.chars().peekable();
    let mut current_text = String::new();
    
    while let Some(&ch) = chars.peek() {
        // Inline code
        if ch == '`' {
            chars.next();
            let mut code = String::new();
            while let Some(&c) = chars.peek() {
                chars.next();
                if c == '`' { break; }
                code.push(c);
            }
            if !current_text.is_empty() {
                tokens.push(Token::Text(current_text.clone()));
                current_text.clear();
            }
            tokens.push(Token::InlineCode(code));
            continue;
        }
        
        // Bold
        if ch == '*' {
            chars.next();
            if chars.peek() == Some(&'*') {
                chars.next();
                if !current_text.is_empty() {
                    tokens.push(Token::Text(current_text.clone()));
                    current_text.clear();
                }
                tokens.push(Token::BoldStart);
                continue;
            } else {
                current_text.push('*');
            }
        }
        
        // Italic
        if ch == '_' {
            chars.next();
            if !current_text.is_empty() {
                tokens.push(Token::Text(current_text.clone()));
                current_text.clear();
            }
            tokens.push(Token::ItalicStart);
            continue;
        }
        
        // Links
        if ch == '[' {
            chars.next();
            let mut link_text = String::new();
            while let Some(&c) = chars.peek() {
                chars.next();
                if c == ']' { break; }
                link_text.push(c);
            }
            if chars.peek() == Some(&'(') {
                chars.next();
                let mut url = String::new();
                while let Some(&c) = chars.peek() {
                    chars.next();
                    if c == ')' { break; }
                    url.push(c);
                }
                if !current_text.is_empty() {
                    tokens.push(Token::Text(current_text.clone()));
                    current_text.clear();
                }
                tokens.push(Token::LinkStart { url });
                tokens.extend(tokenize_inline(&link_text));
                tokens.push(Token::LinkEnd);
                continue;
            } else {
                current_text.push('[');
                current_text.push_str(&link_text);
                current_text.push(']');
            }
            continue;
        }
        
        // Images
        if ch == '!' {
            let mut temp = chars.clone();
            temp.next();
            if temp.peek() == Some(&'[') {
                chars.next(); // !
                chars.next(); // [
                let mut alt = String::new();
                while let Some(&c) = chars.peek() {
                    chars.next();
                    if c == ']' { break; }
                    alt.push(c);
                }
                if chars.peek() == Some(&'(') {
                    chars.next();
                    let mut url = String::new();
                    while let Some(&c) = chars.peek() {
                        chars.next();
                        if c == ')' { break; }
                        url.push(c);
                    }
                    if !current_text.is_empty() {
                        tokens.push(Token::Text(current_text.clone()));
                        current_text.clear();
                    }
                    tokens.push(Token::Image { url, alt });
                    continue;
                }
            }
        }
        
        current_text.push(ch);
        chars.next();
    }
    
    if !current_text.is_empty() {
        tokens.push(Token::Text(current_text));
    }
    
    tokens
}
