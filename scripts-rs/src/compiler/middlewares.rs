use crate::compiler::pipeline::CompilerMiddleware;
use crate::compiler::unit::{CompilationUnit};
use crate::compiler::container::CompilerContainer;
use crate::diagnostics::{validate_unique_slugs, validate_internal_links};
use pulldown_cmark::{Event, Tag, TagEnd, CodeBlockKind};
use std::collections::{HashSet};

pub struct ValidationMiddleware;

impl CompilerMiddleware for ValidationMiddleware {
    fn name(&self) -> &'static str { "Validation" }

    fn on_transform(&mut self, unit: &mut CompilationUnit, container: &mut CompilerContainer) {
        // Content validation
        crate::diagnostics::validate_code_block_descriptions(&unit.content, &unit.rel_path, &mut container.context.diagnostics);
        
        // Header Hierarchy Check
        let re_header = regex::Regex::new(r"(?m)^(#{1,6})\s+").unwrap();
        let mut last_level = 0;
        for cap in re_header.captures_iter(&unit.content) {
            let level = cap[1].len();
            if level > last_level + 1 && last_level > 0 {
                container.context.warn(
                    crate::diagnostics::DiagnosticSource::Content,
                    &unit.rel_path,
                    &format!("Skipped header level: h{} to h{}", last_level, level),
                    Some("Headers should follow a logical hierarchy (h1 > h2 > h3)."),
                );
            }
            last_level = level;
        }
    }

    fn on_transform_events<'a>(&mut self, events: &mut Vec<Event<'a>>, container: &mut CompilerContainer) {
        // Mermaid validation happens here because we have the raw text of the diagram
        // handled in MermaidMiddleware or we can do it here by scanning events
    }

    fn on_assemble(&mut self, units: &mut [CompilationUnit], container: &mut CompilerContainer) {
        // Unique Slugs
        let slug_entries: Vec<(String, String)> = units
            .iter()
            .filter_map(|u| u.metadata.as_ref().map(|m| (u.id.to_string(), m.slug.to_string())))
            .collect();
        validate_unique_slugs(&slug_entries, &mut container.context.diagnostics);

        // Internal Links
        let known_slugs: HashSet<String> = units
            .iter()
            .filter_map(|u| u.metadata.as_ref().map(|m| m.slug.to_string()))
            .collect();
        
        for unit in units {
            validate_internal_links(&unit.raw_content, &known_slugs, &unit.id, &mut container.context.diagnostics);
        }
    }
}

pub struct HighlightMiddleware;

impl CompilerMiddleware for HighlightMiddleware {
    fn name(&self) -> &'static str { "Highlight" }

    fn on_transform_events<'a>(&mut self, events: &mut Vec<Event<'a>>, _container: &mut CompilerContainer) {
        let mut new_events = Vec::with_capacity(events.len());
        let mut i = 0;
        
        while i < events.len() {
            let event = &events[i];
            
            if let Event::Start(Tag::CodeBlock(kind)) = event {
                let info = match kind {
                    CodeBlockKind::Fenced(s) => Some(s.as_ref()),
                    CodeBlockKind::Indented => None,
                };
                
                let meta = crate::compiler::utils::parse_code_info(info);
                let lang = &meta.lang;

                // Skip mermaid diagrams - handled by MermaidMiddleware
                let mermaid_types = [
                    "mermaid", "graph", "flowchart", "sequencediagram", "classdiagram", "statediagram", 
                    "erdiagram", "gantt", "pie", "quadrantchart", "xychart", "mindmap", 
                    "timeline", "journey", "requirementdiagram", "gitgraph", "sankey"
                ];

                if mermaid_types.contains(&lang.to_lowercase().as_str()) {
                    new_events.push(events[i].clone());
                    i += 1;
                    continue;
                }

                // Collect code content
                let mut code = String::new();
                i += 1;
                while i < events.len() {
                    match &events[i] {
                        Event::Text(t) => code.push_str(t.as_ref()),
                        Event::End(TagEnd::CodeBlock) => break,
                        _ => {}
                    }
                    i += 1;
                }

                // Simply escape HTML and wrap. Highlighting will happen in React.
                let escaped = html_escape::encode_safe(&code);
                let inner_html = format!("<pre><code class=\"language-{}\">{}</code></pre>", lang, escaped);
                let wrapped_html = crate::compiler::utils::code_block_wrapper(&inner_html, &meta);
                
                new_events.push(Event::Html(wrapped_html.into()));
            } else {
                new_events.push(events[i].clone());
            }
            i += 1;
        }
        
        *events = new_events;
    }
}

pub struct MermaidMiddleware;

impl CompilerMiddleware for MermaidMiddleware {
    fn name(&self) -> &'static str { "Mermaid" }

    fn on_transform_events<'a>(&mut self, events: &mut Vec<pulldown_cmark::Event<'a>>, container: &mut CompilerContainer) {
        use pulldown_cmark::{Event, Tag, CodeBlockKind, TagEnd};

        for i in 0..events.len() {
            if let Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(info))) = &events[i] {
                let mermaid_types = [
                    "mermaid", "graph", "flowchart", "sequencediagram", "classdiagram", "statediagram", 
                    "erdiagram", "gantt", "pie", "quadrantchart", "xychart", "mindmap", 
                    "timeline", "journey", "requirementdiagram", "gitgraph", "sankey"
                ];

                let lang = info.as_ref().split(':').next().unwrap_or("").to_lowercase();
                if mermaid_types.contains(&lang.as_str()) {
                    // Find the text event inside
                    let mut j = i + 1;
                    while j < events.len() {
                        if let Event::Text(content) = &events[j] {
                            let mut diagram = content.to_string();
                            
                            // Normalization
                            let trimmed = diagram.trim();
                            let first_line = trimmed.lines().next().unwrap_or("").to_lowercase();
                            let first_word = first_line.split_whitespace().next().unwrap_or("");

                            if mermaid_types.contains(&first_word) {
                                if (first_word == "graph" || first_word == "flowchart") 
                                    && !first_line.contains(" lr") && !first_line.contains(" td") && !first_line.contains(" tb") && !first_line.contains(" bt") && !first_line.contains(" rl") 
                                    && !first_line.contains('\n') && first_line == first_word {
                                        diagram = format!("{} TD\n{}", first_word.to_uppercase(), trimmed.lines().skip(1).collect::<Vec<_>>().join("\n"));
                                }
                            } else {
                                diagram = format!("flowchart TD\n{}", trimmed);
                            }

                            // Validation
                            crate::diagnostics::validate_mermaid_content(&diagram, "diagram", &mut container.context.diagnostics);

                            events[j] = Event::Text(diagram.into());
                            break;
                        } else if let Event::End(TagEnd::CodeBlock) = &events[j] {
                            break;
                        }
                        j += 1;
                    }
                }
            }
        }
    }
}
