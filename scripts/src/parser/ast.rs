use serde::{Serialize, Deserialize};

/// Abstract Syntax Tree nodes for our custom markdown format
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Node {
    /// Document root
    Document(Vec<Node>),
    
    /// Heading (level 1-6)
    Heading { level: u8, children: Vec<Node> },
    
    /// Paragraph
    Paragraph(Vec<Node>),
    
    /// Text content
    Text(String),
    
    /// Inline code
    InlineCode(String),
    
    /// Code block with optional language
    CodeBlock { language: Option<String>, code: String },
    
    /// Bold text
    Bold(Vec<Node>),
    
    /// Italic text
    Italic(Vec<Node>),
    
    /// Link
    Link { url: String, text: String },
    
    /// Image
    Image { url: String, alt: String },
    
    /// Unordered list
    UnorderedList(Vec<ListItem>),
    
    /// Ordered list
    OrderedList(Vec<ListItem>),
    
    /// List item
    ListItem(Vec<Node>),
    
    /// Blockquote
    Blockquote(Vec<Node>),
    
    /// Horizontal rule
    HorizontalRule,
    
    /// Custom extension node (for plugins)
    Extension {
        name: String,
        attributes: Vec<(String, String)>,
        children: Vec<Node>,
        content: String,
    },
    
    /// Raw HTML (pass-through)
    RawHtml(String),
}

impl Node {
    pub fn text(s: &str) -> Self {
        Node::Text(s.to_string())
    }
    
    pub fn is_empty_text(&self) -> bool {
        matches!(self, Node::Text(s) if s.trim().is_empty())
    }
}

/// List item with optional nested lists
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ListItem(pub Vec<Node>);
