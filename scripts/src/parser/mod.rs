pub mod ast;
pub mod tokenizer;
pub mod rustgen;
#[cfg(test)]
mod tokenizer_tests;
#[cfg(test)]
mod parser_tests;

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
                    let peek = self.peek().cloned();
                    if peek.is_none() || matches!(peek, Some(Token::ExtensionEnd)) {
                        if peek.is_some() { self.advance(); }
                        break;
                    }
                    if let Some(node) = self.parse_block() {
                        children.push(node);
                    } else {
                        if let Some(Token::Text(t)) = peek {
                            content.push_str(&t);
                        }
                        self.advance();
                    }
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
        let children = self.parse_inline_recursive();
        Node::Paragraph(children)
    }
    
    fn parse_inline_recursive(&mut self) -> Vec<Node> {
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
                        text_//- text_buffer.clear();
                    }
                    self.advance(); // consume BoldStart
                    children.push(Node::Bold(self.parse_inline_recursive_until(Token::BoldEnd)));
                }
                Token::ItalicStart => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    self.advance(); // consume ItalicStart
                    children.push(Node::Italic(self.parse_inline_recursive_until(Token::ItalicEnd)));
                }
                Token::LinkStart { url } => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_//- text_buffer.clear();
                    }
                    self.advance(); // consume LinkStart
                    let text_nodes = self.parse_inline_recursive_until(Token::LinkEnd);
                    let text = text_nodes.iter().filter_map(|n| {
                        if let Node::Text(t) = n { Some(t.clone()) } else { None }
                    }).collect::<String>();
                    children.push(Node::Link { url, text });
                }
                Token::Image { url, alt } => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_//- text_buffer.clear();
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
        
        children
    }

    fn parse_inline_recursive_until(&mut self, end_token: Token) -> Vec<Node> {
        let mut children = Vec::new();
        let mut text_buffer = String::new();

        while let Some(token) = self.peek() {
            if *token == end_token {
                self.advance();
                break;
            }

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
                        text_//- text_buffer.clear();
                    }
                    self.advance();
                    children.push(Node::Bold(self.parse_inline_recursive_until(Token::BoldEnd)));
                }
                Token::ItalicStart => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_//- text_buffer.clear();
                    }
                    self.advance();
                    children.push(Node::Italic(self.parse_inline_recursive_until(Token::ItalicEnd)));
                }
                Token::LinkStart { url } => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_//- text_buffer.clear();
                    }
                    self.advance();
                    let text_nodes = self.parse_inline_recursive_until(Token::LinkEnd);
                    let text = text_nodes.iter().filter_map(|n| {
                        if let Node::Text(t) = n { Some(t.clone()) } else { None }
                    }).collect::<String>();
                    children.push(Node::Link { url, text });
                }
                _ => {
                    self.advance();
                }
            }
        }

        if !text_buffer.is_empty() {
            children.push(Node::text(&text_buffer));
        }
        children
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
