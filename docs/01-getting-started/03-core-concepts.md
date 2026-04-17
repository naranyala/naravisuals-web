---
title: Core Concepts
description: Understanding the SSG pipeline, markdown processing, and frontend architecture
sidebar_label: Core Concepts
sidebar_position: 3
tags: [concepts, pipeline, architecture]
---

# Core Concepts

This guide explains the fundamental concepts behind rspack-react-docs: how markdown becomes HTML, how the plugin system works, and how the frontend renders everything.

## The Build Pipeline

```mermaid:desc=Detailed build pipeline showing each transformation step from raw markdown to generated TypeScript.
flowchart tb
    subgraph Input["Input: docs/**/*.md"]
        MD["Raw Markdown Files"]
    end

    subgraph Parse["Parse Phase"]
        FM["Extract Frontmatter<br/>title, description, tags"]
        Lex["Tokenize Markdown<br/>marked.Lexer"]
        Slug["Generate Slugs<br/>from filenames"]
    end

    subgraph Transform["Transform Phase"]
        Math["math Plugin<br/>$...$ → sentinels"]
        Admon["admonitions Plugin<br/>::: → sentinels"]
        Mermaid["mermaid Plugin<br/>postProcess transformer"]
    end

    subgraph Highlight["Highlight Phase"]
        Shiki["Shiki Highlighter<br/>code → colored HTML"]
    end

    subgraph Generate["Generate Phase"]
        DocEntry["DocEntry objects<br/>per markdown file"]
        Sidebar["Sidebar data<br/>navigation structure"]
        TypesTS["types.ts<br/>interface definitions"]
    end

    MD --> FM
    FM --> Lex
    Lex --> Slug
    Slug --> Math
    Math --> Admon
    Admon --> Mermaid
    Mermaid --> Shiki
    Shiki --> DocEntry
    Shiki --> Sidebar
    DocEntry --> TypesTS

    style Input fill:#e8f5e9
    style Parse fill:#fff3e0
    style Transform fill:#fff3e0
    style Highlight fill:#e3f2fd
    style Generate fill:#f3e5f5
```

### Phase 1: Parse

The scanner (`scripts/build-docs.mts`) walks the `docs/` directory recursively. For each `.md` file:

1. **Frontmatter extraction** — YAML between `---` delimiters is parsed into structured data
2. **Tokenization** — `marked.Lexer` converts markdown to an AST (array of tokens)
3. **Slug generation** — Filenames like `01-project-overview.md` become slugs like `project-overview`

### Phase 2: Transform

Three plugins process the markdown in sequence:

| Plugin | Phase | What it does |
|--------|-------|-------------|
| **math** | preProcess | Extracts `$E=mc^2$` and `$$\int$$` outside code blocks, replaces with sentinels |
| **admonitions** | preProcess | Extracts `:::note` blocks, replaces with sentinels |
| **math** | postProcess | Restores math sentinels as `<span class="math-inline">\(E=mc^2\)</span>` |
| **admonitions** | postProcess | Restores admonition sentinels as styled `<div class="admonition">` |
| **mermaid** | postProcess | Finds mermaid code blocks, replaces with zoomable/ downloadable diagram containers |

### Phase 3: Highlight

Shiki processes all code blocks, converting them to syntax-highlighted HTML using TextMate grammars (the same engine VS Code uses).

### Phase 4: Generate

For each markdown file, a `DocEntry` object is created:

```typescript:desc=The DocEntry interface that represents a single parsed document.
interface DocEntry {
  id: string;              // Unique identifier (slug)
  slug: string;            // URL path
  title: string;           // Document title
  sidebar_label: string;   // Label in sidebar
  sidebar_position: number;// Sort order
  category: string;        // Parent folder name
  description: string;     // Meta description
  content: string;         // Processed HTML (ready to render)
  toc: { value: string; id: string; level: number }[];  // Table of contents
  date?: string;           // Publication date
  author?: string;         // Author name
  tags?: string[];         // Topic tags
  section: "docs" | "blog";// Content section
  metadata?: Record<string, string | string[]>;  // Extra frontmatter fields
  ast?: any[];             // Raw marked tokens (for debugging)
}
```

These objects are written to `src/generated/` as TypeScript files and imported by the React app.

## The Frontend

```mermaid:desc=React component hierarchy showing how the app renders.
flowchart tb
    A["frontend.tsx<br/>Entry Point"] --> B["ErrorBoundary"]
    B --> C["ServicesProvider<br/>DI Context"]
    C --> D["App.tsx<br/>Root Component"]

    D --> E["TopBar<br/>Title + theme toggle"]
    D --> F["Sidebar<br/>Navigation tree"]
    D --> G["DocViewer<br/>Rendered content"]
    D --> H["TableOfContents<br/>Heading links"]
    D --> I["DocFooter<br/>Prev/Next links"]
    D --> J["DocStatsFooter<br/>Build stats"]

    G --> K["Shiki Code<br/>Syntax highlighted"]
    G --> L["Mermaid Diagrams<br/>Client-side render"]
    G --> M["MathJax Math<br/>Client-side typeset"]
    G --> N["Admonitions<br/>Styled callouts"]

    style A fill:#e8f5e9
    style D fill:#fff3e0
    style F fill:#e3f2fd
    style G fill:#e3f2fd
```

### Client-Side Rendering

After the build generates static data, the React SPA takes over:

1. **Routing** — Uses `window.history` (no hash routing) for clean URLs like `/docs/getting-started/installation`
2. **Content rendering** — `DocViewer` receives HTML via `dangerouslySetInnerHTML`, then runs Mermaid and MathJax asynchronously
3. **Navigation** — Sidebar and TOC are generated from the `sidebarData` array
4. **Theme switching** — Changes `data-theme` attribute on `<html>`, CSS custom properties handle the rest

## Key Concepts

### Zero Runtime API

There are no `fetch()` calls, no API routes, no database. All content is in TypeScript files generated at build time. The browser loads one JS bundle and renders instantly.

### Plugin System

The markdown processing pipeline is extensible. You can add custom plugins to handle any markdown syntax:

```typescript:desc=The MarkdownPlugin interface for creating custom plugins.
interface MarkdownPlugin {
  name: string;
  preProcess?(md: string): string;  // Before marked
  postProcess?(html: string): string;  // After marked
}
```

### Dependency Injection

Browser APIs (localStorage, History API, DOM manipulation) are wrapped in interfaces and injected via a container. This makes testing trivial — swap the real services for mocks in tests.

---

Next: [Build Pipeline Architecture](/docs/architecture/build-pipeline)
