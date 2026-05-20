use serde::{Deserialize, Serialize};

/// Valid heading levels (1-6)
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum HeadingLevel {
    H1 = 1,
    H2 = 2,
    H3 = 3,
    H4 = 4,
    H5 = 5,
    H6 = 6,
}

impl TryFrom<u8> for HeadingLevel {
    type Error = String;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            1 => Ok(HeadingLevel::H1),
            2 => Ok(HeadingLevel::H2),
            3 => Ok(HeadingLevel::H3),
            4 => Ok(HeadingLevel::H4),
            5 => Ok(HeadingLevel::H5),
            6 => Ok(HeadingLevel::H6),
            _ => Err(format!("Invalid heading level: {}", value)),
        }
    }
}

impl std::fmt::Display for HeadingLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", *self as u8)
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Attribute {
    pub key: String,
    pub value: String,
}

/// Abstract Syntax Tree nodes for our custom markdown format
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Node {
    /// Document root
    Document(Vec<Node>),

    /// Heading (level 1-6)
    Heading {
        level: HeadingLevel,
        children: Vec<Node>,
    },

    /// Paragraph
    Paragraph(Vec<Node>),

    /// Text content
    Text(String),

    /// Inline code
    InlineCode(String),

    /// Code block with optional language
    CodeBlock {
        language: Option<String>,
        code: String,
    },

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

    /// Table
    Table {
        headers: Vec<Node>,
        rows: Vec<Vec<Node>>,
    },

    /// Horizontal rule
    HorizontalRule,

    /// Custom extension node (for plugins)
    Extension {
        name: String,
        attributes: Vec<Attribute>,
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
pub struct ListItem {
    pub checked: Option<bool>,
    pub children: Vec<Node>,
}
