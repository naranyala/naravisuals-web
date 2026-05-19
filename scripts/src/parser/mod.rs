pub mod ast;
pub mod tokenizer;
pub mod rustgen;

use ast::{Node, ListItem};
use tokenizer::{Token, tokenize};

pub fn parse(input: &str) -> Node {
    let tokens = tokenize(input);
    let mut parser = Parser::new(&tokens);
    parser.parse_document()
}

struct Parser<'a> {
    tokens: &'a [Token],
    pos: usize,
}

impl<'a> Parser<'a> {
    fn new(tokens: &'a [Token]) -> Self {
        Self { tokens, pos: 0 }
    }
    
    fn peek(&self) -> Option<&Token> {
        self.tokens.get(self.pos)
    }
    
    fn advance(&mut self) -> Option<&Token> {
        let token = self.tokens.get(self.pos);
        self.pos += 1;
        token
    }
    
    fn parse_document(&mut self) -> Node {
        let mut children = Vec::new();
        while self.pos < self.tokens.len() {
            if let Some(node) = self.parse_block() {
                children.push(node);
            }
        }
        Node::Document(children)
    }
    
    fn parse_block(&mut self) -> Option<Node> {
        match self.peek()?.clone() {
            Token::Heading { level, content } => {
                self.advance();
                Some(Node::Heading { level, children: vec![Node::text(&content)] })
            }
            Token::CodeBlock { language, code } => {
                self.advance();
                Some(Node::CodeBlock { language, code })
            }
            Token::HorizontalRule => {
                self.advance();
                Some(Node::HorizontalRule)
            }
            Token::Blockquote(content) => {
                self.advance();
                Some(Node::Blockquote(vec![Node::Paragraph(vec![Node::text(&content)])]))
            }
            Token::UnorderedListItem(_) => Some(self.parse_unordered_list()),
            Token::OrderedListItem(_) => Some(self.parse_ordered_list()),
            Token::ExtensionStart { name, attributes } => {
                self.advance();
                let mut children = Vec::new();
                let mut content = String::new();
                loop {
                    if matches!(self.peek(), Some(Token::ExtensionEnd)) {
                        self.advance();
                        break;
                    }
                    if let Some(node) = self.parse_block() {
                        children.push(node);
                    }
                    if let Some(Token::Text(t)) = self.peek() {
                        content.push_str(t);
                    }
                    self.advance();
                }
                Some(Node::Extension { name, attributes, children, content })
            }
            Token::RawHtml(html) => {
                self.advance();
                Some(Node::RawHtml(html))
            }
            Token::BlankLine => {
                self.advance();
                None
            }
            _ => Some(self.parse_paragraph()),
        }
    }
    
    fn parse_paragraph(&mut self) -> Node {
        let mut children = Vec::new();
        let mut text_buffer = String::new();
        
        while let Some(token) = self.peek() {
            match token.clone() {
                Token::Text(text) => {
                    text_buffer.push_str(&text);
                    self.advance();
                }
                Token::InlineCode(code) => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    children.push(Node::InlineCode(code));
                    self.advance();
                }
                Token::BoldStart => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    children.push(self.parse_bold());
                }
                Token::ItalicStart => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    children.push(self.parse_italic());
                }
                Token::LinkStart { url } => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    children.push(self.parse_link(url));
                }
                Token::Image { url, alt } => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    children.push(Node::Image { url, alt });
                    self.advance();
                }
                Token::BlankLine | Token::Heading { .. } | Token::CodeBlock { .. } |
                Token::HorizontalRule | Token::Blockquote(_) | Token::UnorderedListItem(_) |
                Token::OrderedListItem(_) | Token::ExtensionStart { .. } | Token::RawHtml(_) => {
                    break;
                }
                _ => { self.advance(); }
            }
        }
        
        if !text_buffer.is_empty() {
            children.push(Node::text(&text_buffer));
        }
        
        Node::Paragraph(children)
    }
    
    fn parse_bold(&mut self) -> Node {
        self.advance();
        let mut children = Vec::new();
        let mut text_buffer = String::new();
        while let Some(token) = self.peek() {
            match token {
                Token::BoldEnd => { self.advance(); break; }
                Token::Text(text) => { text_buffer.push_str(text); self.advance(); }
                Token::InlineCode(code) => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    children.push(Node::InlineCode(code.clone()));
                    self.advance();
                }
                _ => { self.advance(); }
            }
        }
        if !text_buffer.is_empty() {
            children.push(Node::text(&text_buffer));
        }
        Node::Bold(children)
    }
    
    fn parse_italic(&mut self) -> Node {
        self.advance();
        let mut children = Vec::new();
        let mut text_buffer = String::new();
        while let Some(token) = self.peek() {
            match token {
                Token::Text(text) => { text_buffer.push_str(text); self.advance(); }
                Token::InlineCode(code) => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    children.push(Node::InlineCode(code.clone()));
                    self.advance();
                }
                Token::BlankLine | Token::Heading { .. } | Token::CodeBlock { .. } => break,
                _ => { self.advance(); }
            }
        }
        if !text_buffer.is_empty() {
            children.push(Node::text(&text_buffer));
        }
        Node::Italic(children)
    }
    
    fn parse_link(&mut self, url: String) -> Node {
        self.advance();
        let mut text = String::new();
        while let Some(token) = self.peek() {
            match token {
                Token::LinkEnd => { self.advance(); break; }
                Token::Text(t) => { text.push_str(t); self.advance(); }
                _ => { self.advance(); }
            }
        }
        Node::Link { url, text }
    }
    
    fn parse_unordered_list(&mut self) -> Node {
        let mut items = Vec::new();
        while let Some(Token::UnorderedListItem(content)) = self.peek().cloned() {
            self.advance();
            items.push(ListItem(vec![Node::Paragraph(vec![Node::text(&content)])]));
        }
        Node::UnorderedList(items)
    }
    
    fn parse_ordered_list(&mut self) -> Node {
        let mut items = Vec::new();
        while let Some(Token::OrderedListItem(content)) = self.peek().cloned() {
            self.advance();
            items.push(ListItem(vec![Node::Paragraph(vec![Node::text(&content)])]));
        }
        Node::OrderedList(items)
    }
}
