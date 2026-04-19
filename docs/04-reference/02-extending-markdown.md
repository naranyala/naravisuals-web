---
title: Extending Markdown
description: Plugin system, validators, and AST parser utilities
sidebar_label: Extending Markdown
sidebar_position: 2
---

# Extending Markdown

The project provides a comprehensive system for extending and validating Markdown content. This is achieved through a multi-phase plugin pipeline, a dedicated validation suite, and AST (Abstract Syntax Tree) analysis tools.

## Plugin Pipeline

The transformation of Markdown to HTML occurs in three distinct phases:

1. **`preProcess`**: All plugins run in registration order on the raw Markdown string. Use this for syntax extensions (e.g., math extraction).
2. **`marked`**: The core parser converts Markdown to HTML via a custom renderer.
3. **`postProcess`**: Plugins run in **reverse order** on the HTML output. Use this for HTML enhancements (e.g., Mermaid containers).

```mermaid:desc=Plugin pipeline diagram
flowchart lr
    A["Raw .md"] --> B["preProcess plugins"]
    B --> C["marked.parse()"]
    C --> D["HTML output"]
    D --> E["postProcess plugins (reverse order)"]
    E --> F["Final HTML in DocEntry.content"]
```

### The `MarkdownPlugin` Interface

```ts:desc=MarkdownPlugin interface definition
export interface MarkdownPlugin {
  name: string;
  preProcess?(md: string): string;
  postProcess?(html: string): string;
}
```

## Validation System

Validators ensure document quality at build time. They can be configured as **strict** (failing the build on errors) or informational.

### Active Validators

| Validator | Purpose | Strict |
|---|---|---|
| `codeblock` | Ensures all code blocks have languages and `:desc=` attributes. | Yes |
| `mermaid` | Validates Mermaid.js syntax before rendering. | Yes |
| `reference` | Checks for broken internal links and orphaned footnotes. | Yes |
| `frontmatter` | Ensures mandatory fields like `title` and `description`. | No |

## AST Analysis

The system includes utilities to inspect the token tree produced by `marked.js`, located in `src/shared/utils/ast-parser.ts` (or similar).

### Key Functions
- **`tokensToAST(tokens)`**: Converts a flat token array into a hierarchical tree.
- **`countNodes(ast)`**: Recursively counts all elements in the document.
- **`getUniqueTypes(ast)`**: Identifies all Markdown features used (e.g., `table`, `blockquote`).

### AST Viewer
A built-in debug component allows authors to visualize the document structure during development. It can be toggled from the top bar settings.

## Summary of Markdown Features

| Feature | Syntax | Transformation |
|---|---|---|
| **Math** | `$E=mc^2$` | `preProcess` extracts to MathJax spans. |
| **Admonitions** | `:::note` | `preProcess` converts to custom containers. |
| **Diagrams** | ` ```mermaid ` | `postProcess` wraps in rich UI containers. |
| **Descriptions** | `:desc=...` | Custom renderer adds accessibility labels. |
