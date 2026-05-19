use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Node {
    Document(Vec<Node>),
    Heading { level: u8, children: Vec<Node> },
    Paragraph(Vec<Node>),
    Text(String),
    InlineCode(String),
    CodeBlock { language: Option<String>, code: String },
    Bold(Vec<Node>),
    Italic(Vec<Node>),
    Link { url: String, text: String },
    Image { url: String, alt: String },
    UnorderedList(Vec<ListItem>),
    OrderedList(Vec<ListItem>),
    ListItem(Vec<Node>),
    Blockquote(Vec<Node>),
    HorizontalRule,
    Extension {
        name: String,
        attributes: Vec<(String, String)>,
        children: Vec<Node>,
        content: String,
    },
    RawHtml(String),
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ListItem(pub Vec<Node>);

impl Node {
    pub fn is_empty_text(&self) -> bool {
        matches!(self, Node::Text(s) if s.trim().is_empty())
    }
}
