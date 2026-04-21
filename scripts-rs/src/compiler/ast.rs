use pulldown_cmark::{Event, Tag, CodeBlockKind};
use serde_json::{Value, json, Map};

pub fn events_to_ast(events: &[Event]) -> Value {
    let mut root_nodes = Vec::new();
    let mut stack: Vec<(Map<String, Value>, Vec<Value>)> = Vec::new();

    for event in events {
        match event {
            Event::Start(tag) => {
                let mut node = Map::new();
                match tag {
                    Tag::Heading { level, .. } => {
                        node.insert("type".to_string(), json!("heading"));
                        node.insert("depth".to_string(), json!(*level as u8));
                    }
                    Tag::Paragraph => {
                        node.insert("type".to_string(), json!("paragraph"));
                    }
                    Tag::BlockQuote(_) => {
                        node.insert("type".to_string(), json!("blockquote"));
                    }
                    Tag::CodeBlock(kind) => {
                        node.insert("type".to_string(), json!("code"));
                        if let CodeBlockKind::Fenced(lang) = kind {
                            node.insert("lang".to_string(), json!(lang.as_ref()));
                        }
                    }
                    Tag::List(ordered) => {
                        node.insert("type".to_string(), json!("list"));
                        node.insert("ordered".to_string(), json!(ordered.is_some()));
                        if let Some(start) = ordered {
                            node.insert("start".to_string(), json!(start));
                        }
                    }
                    Tag::Item => {
                        node.insert("type".to_string(), json!("list_item"));
                    }
                    Tag::Table(_alignments) => {
                        node.insert("type".to_string(), json!("table"));
                        // Could add alignments if needed
                    }
                    Tag::TableHead => {
                        node.insert("type".to_string(), json!("table_head"));
                    }
                    Tag::TableRow => {
                        node.insert("type".to_string(), json!("table_row"));
                    }
                    Tag::TableCell => {
                        node.insert("type".to_string(), json!("table_cell"));
                    }
                    Tag::Link { dest_url, .. } => {
                        node.insert("type".to_string(), json!("link"));
                        node.insert("href".to_string(), json!(dest_url.as_ref()));
                    }
                    Tag::Emphasis => {
                        node.insert("type".to_string(), json!("em"));
                    }
                    Tag::Strong => {
                        node.insert("type".to_string(), json!("strong"));
                    }
                    Tag::Strikethrough => {
                        node.insert("type".to_string(), json!("del"));
                    }
                    _ => {
                        node.insert("type".to_string(), json!(format!("{:?}", tag).to_lowercase()));
                    }
                }
                stack.push((node, Vec::new()));
            }
            Event::End(_) => {
                if let Some((mut node, children)) = stack.pop() {
                    if !children.is_empty() {
                        node.insert("tokens".to_string(), Value::Array(children));
                    }
                    if stack.is_empty() {
                        root_nodes.push(Value::Object(node));
                    } else {
                        let last_idx = stack.len() - 1;
                        stack[last_idx].1.push(Value::Object(node));
                    }
                }
            }
            Event::Text(text) => {
                let node = json!({
                    "type": "text",
                    "text": text.as_ref()
                });
                if stack.is_empty() {
                    root_nodes.push(node);
                } else {
                    let last_idx = stack.len() - 1;
                    stack[last_idx].1.push(node);
                }
            }
            Event::Code(text) => {
                let node = json!({
                    "type": "codespan",
                    "text": text.as_ref()
                });
                if stack.is_empty() {
                    root_nodes.push(node);
                } else {
                    let last_idx = stack.len() - 1;
                    stack[last_idx].1.push(node);
                }
            }
            Event::SoftBreak | Event::HardBreak => {
                let node = json!({ "type": "br" });
                if !stack.is_empty() {
                    let last_idx = stack.len() - 1;
                    stack[last_idx].1.push(node);
                }
            }
            Event::Rule => {
                let node = json!({ "type": "hr" });
                root_nodes.push(node);
            }
            _ => {}
        }
    }

    Value::Array(root_nodes)
}
