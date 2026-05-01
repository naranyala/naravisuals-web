---
title: Markdown Engine
description: Deep dive into the stateful rendering layer and middleware system of the documentation compiler.
sidebar_label: Markdown Engine
sidebar_position: 4
tags: ["markdown", "engine", "compiler", "middleware"]
---

# Markdown Engine

The core of the documentation system is the Markdown processing engine. It handles the transformation of raw `.md` files into rich, interactive HTML content using a combination of **marked**, **Shiki**, and a stateful middleware architecture.

## Stateful Rendering

To ensure reliability across large documentation sets, the engine uses a per-file `MarkdownRenderer` class. This prevents common issues like "data leakage" between documents.

### Isolated Context
Every time a document is processed, the renderer's internal state is reset:
1.  **Heading ID Registry**: Tracks all IDs used in the current file to ensure that anchor links (e.g., `#setup`) are unique. If a collision occurs (e.g., two "Setup" headings), it automatically generates unique slugs (`#setup`, `#setup-1`).
2.  **Code Block Metadata**: Standardizes how language tags, titles, and descriptions are extracted from code fences, ensuring consistent rendering of technical snippets.

```typescript:desc=Isolated renderer logic
class MarkdownRenderer {
  private seenIds = new Set<string>();

  public reset() {
    this.seenIds.clear();
  }

  // renderer implementation resets here...
}
```

## Transformation Middleware

The engine supports a lifecycle-based middleware system. Middlewares can hook into various stages of the compilation process to validate or transform content.

| Lifecycle Hook | Timing | Primary Use Case |
| :--- | :--- | :--- |
| **`onIngest`** | After file discovery | Path validation and SEO check |
| **`onPreParse`** | Before markdown lexing | MathJax sentinel extraction |
| **`onTransform`** | After AST generation | TOC extraction, structural validation |
| **`onPostProcess`** | After HTML generation | Mermaid/Timeline component injection |
| **`onAssemble`** | After all files processed | Cross-document link validation |

### Example: The Timeline Plugin
The Timeline feature is implemented as a `onPostProcess` middleware. It scans the generated HTML for code blocks marked as `text (timeline)` and replaces them with a custom technical container that supports copying and description footers.

## Content Protection & Reliability

### Source Protection
For complex blocks like **Mermaid Diagrams**, the engine implements a "Source Protection" layer. During the `onPostProcess` phase, the raw diagram notation is embedded into a `data-source` attribute in the HTML.

:::tip
This protection ensures that even if the React frontend re-renders or navigates between pages, it always has access to the clean, uncorrupted markdown source needed to render the SVG visual.
:::

### Deep Structural Validation
The compiler performs a **Deep Structural Scan** on diagrams. It catches logic errors that regex-based validators often miss:
s*-   **Unbalanced Subgraphs**: Ensures every `subgraph` has a matching `end`.
s*-   **Symmetry Checks**: Verifies curly braces and square brackets in complex flowcharts.
s*-   **Mixing Violations**: Prevents illegal mixing of diagram types (e.g., subgraphs inside class diagrams).

## Design Philosophy

1.  **Zero Runtime Latency**: Heavy lifting (parsing, highlighting, validation) happens at build time.
2.  **Self-Healing**: Automatic fallbacks for missing titles, descriptions, and broken slugs.
3.  **Strict Typing**: Every document is a strictly-typed `CompilationUnit`, making the build system predictable and easy to debug.

## Related
- [Build Pipeline](/docs/02-architecture/01-build-pipeline) — How the compiler orchestrates these stages.
- [Writing Plugins](/docs/03-guides/06-writing-plugins) — Guide to creating your own middlewares.
