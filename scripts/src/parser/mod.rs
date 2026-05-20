pub mod ast;
#[cfg(test)]
mod parser_tests;
pub mod rustgen;
pub mod tokenizer;
#[cfg(test)]
mod tokenizer_tests;

use crate::error::{CompilerError, CompilerResult};
use crate::parser::ast::{HeadingLevel, ListItem, Node};
use crate::parser::tokenizer::{tokenize, Token};

pub fn parse(input: &str) -> CompilerResult<Node> {
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

    fn parse_document(&mut self) -> CompilerResult<Node> {
        let mut children = Vec::new();
        while self.pos < self.tokens.len() {
            if let Some(node) = self.parse_block() {
                children.push(node);
            }
        }
        Ok(Node::Document(children))
    }

    fn parse_block(&mut self) -> Option<Node> {
        let token = self.peek()?.clone();
        match token {
            Token::Heading { level, content } => {
                self.advance();
                let inline_tokens = tokenizer::tokenize_inline(&content);
                let mut inline_parser = Parser::new(&inline_tokens);
                let children = inline_parser.parse_inline_recursive();
                let level = HeadingLevel::try_from(level).unwrap_or(HeadingLevel::H1);
                Some(Node::Heading { level, children })
            }

            Token::CodeBlock { language, code } => {
                self.advance();
                Some(Node::CodeBlock { language, code })
            }
            Token::HorizontalRule => {
                self.advance();
                Some(Node::HorizontalRule)
            }
            Token::BlockquoteMarker => {
                self.advance();
                let children = self.parse_block_recursive(Token::BlockquoteMarker);
                Some(Node::Blockquote(children))
            }
            Token::UnorderedListMarker | Token::TaskListMarker(_) => {
                let marker = self.peek()?.clone();
                let items = self.parse_list_recursive(marker);
                Some(Node::UnorderedList(items))
            }
            Token::OrderedListMarker => {
                let marker = self.peek()?.clone();
                let items = self.parse_list_recursive(marker);
                Some(Node::OrderedList(items))
            }
            Token::TableRow(_) => {
                self.advance();
                // Tables are parsed as a group
                let mut rows = Vec::new();
                let first_row_cells = match self.peek() {
                    Some(Token::TableRow(cells)) => cells.clone(),
                    _ => return None,
                };

                // Look for the separator row (|---|---|)
                if let Some(Token::TableRow(cells)) = self.peek() {
                    if cells.iter().all(|c| c.contains('-')) {
                        self.advance();
                        // Now collect subsequent data rows
                        while let Some(Token::TableRow(cells)) = self.peek().cloned() {
                            self.advance();
                            let parsed_cells: Vec<Node> = cells
                                .into_iter()
                                .map(|c| Node::Paragraph(vec![Node::text(&c)]))
                                .collect();
                            rows.push(parsed_cells);
                        }

                        let headers: Vec<Node> = first_row_cells
                            .into_iter()
                            .map(|c| Node::Paragraph(vec![Node::text(&c)]))
                            .collect();

                        return Some(Node::Table { headers, rows });
                    }
                }
                None
            }
            Token::ExtensionStart { name, attributes } => {
                self.advance();
                let mut children = Vec::new();
                let mut content = String::new();
                loop {
                    let peek = self.peek().cloned();
                    if peek.is_none() || matches!(peek, Some(Token::ExtensionEnd)) {
                        if peek.is_some() {
                            self.advance();
                        }
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
                Some(Node::Extension {
                    name,
                    attributes,
                    children,
                    content,
                })
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

    fn parse_block_recursive(&mut self, stop_token: Token) -> Vec<Node> {
        let mut children = Vec::new();
        while let Some(token) = self.peek() {
            if *token == stop_token {
                break;
            }
            if let Some(node) = self.parse_block() {
                children.push(node);
            } else {
                self.advance();
            }
        }
        children
    }

    fn parse_list_recursive(&mut self, _marker: Token) -> Vec<ListItem> {
        let mut items = Vec::new();
        while let Some(token) = self.peek() {
            let is_marker = matches!(
                token,
                Token::UnorderedListMarker | Token::OrderedListMarker | Token::TaskListMarker(_)
            );
            if is_marker {
                let checked = if let Some(Token::TaskListMarker(c)) = self.peek() {
                    Some(*c)
                } else {
                    None
                };
                self.advance();
                let mut item_content = Vec::new();
                loop {
                    if let Some(t) = self.peek() {
                        if matches!(
                            t,
                            Token::UnorderedListMarker
                                | Token::OrderedListMarker
                                | Token::TaskListMarker(_)
                        ) {
                            break;
                        }
                        if let Some(node) = self.parse_block() {
                            item_content.push(node);
                        } else {
                            self.advance();
                        }
                    } else {
                        break;
                    }
                }
                items.push(ListItem {
                    checked,
                    children: item_content,
                });
            } else {
                break;
            }
        }
        items
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
                Token::BoldMarker => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    self.advance();
                    children.push(Node::Bold(
                        self.parse_inline_recursive_until(Token::BoldMarker),
                    ));
                }
                Token::ItalicMarker => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    self.advance();
                    children.push(Node::Italic(
                        self.parse_inline_recursive_until(Token::ItalicMarker),
                    ));
                }
                Token::LinkStart { url } => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    self.advance();
                    let text_nodes = self.parse_inline_recursive_until(Token::LinkEnd);
                    let text = text_nodes
                        .iter()
                        .filter_map(|n| {
                            if let Node::Text(t) = n {
                                Some(t.clone())
                            } else {
                                None
                            }
                        })
                        .collect::<String>();
                    children.push(Node::Link { url, text });
                }
                Token::Image { url, alt } => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    children.push(Node::Image { url, alt });
                    self.advance();
                }
                Token::BlankLine
                | Token::Heading { .. }
                | Token::CodeBlock { .. }
                | Token::HorizontalRule
                | Token::BlockquoteMarker
                | Token::UnorderedListMarker
                | Token::OrderedListMarker
                | Token::ExtensionStart { .. }
                | Token::RawHtml(_) => {
                    break;
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
                Token::BoldMarker => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    self.advance();
                    children.push(Node::Bold(
                        self.parse_inline_recursive_until(Token::BoldMarker),
                    ));
                }
                Token::ItalicMarker => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    self.advance();
                    children.push(Node::Italic(
                        self.parse_inline_recursive_until(Token::ItalicMarker),
                    ));
                }
                Token::LinkStart { url } => {
                    if !text_buffer.is_empty() {
                        children.push(Node::text(&text_buffer));
                        text_buffer.clear();
                    }
                    self.advance();
                    let text_nodes = self.parse_inline_recursive_until(Token::LinkEnd);
                    let text = text_nodes
                        .iter()
                        .filter_map(|n| {
                            if let Node::Text(t) = n {
                                Some(t.clone())
                            } else {
                                None
                            }
                        })
                        .collect::<String>();
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

    #[allow(dead_code)]
    fn parse_unordered_list(&mut self) -> Node {
        let items = self.parse_list_recursive(Token::UnorderedListMarker);
        Node::UnorderedList(items)
    }

    #[allow(dead_code)]
    fn parse_ordered_list(&mut self) -> Node {
        let items = self.parse_list_recursive(Token::OrderedListMarker);
        Node::OrderedList(items)
    }
}
