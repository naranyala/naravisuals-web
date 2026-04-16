---
title: Build Pipeline
description: How scripts/build-docs.mts scans, parses, and generates TypeScript from markdown
sidebar_label: Build Pipeline
sidebar_position: 1
tags: [architecture, build, pipeline]
---

# Build Pipeline

The build pipeline is the heart of rspack-react-docs. It transforms raw Markdown files into TypeScript data that the React app consumes.

## Pipeline Overview

```mermaid:desc=Complete build pipeline from markdown source to generated TypeScript files.
flowchart tb
    subgraph Scan["Content Scanner"]
        Walk["Walk docs/ directory"]
        Parse["Parse frontmatter\nYAML between ---"]
        Lex["Tokenize with marked.Lexer"]
    end

    subgraph Process["Plugin Processing"]
        Pre["preProcess\nmath → admonitions"]
        Marked["marked.parse()\nmarkdown → HTML"]
        Post["postProcess (reverse)\nmermaid → admonitions → math"]
    end

    subgraph Highlight["Syntax Highlighting"]
        Shiki["createHighlighter\ngithub-dark theme"]
        CodeRenderer["Custom renderer.code\nShiki + code-block wrapper"]
    end

    subgraph Generate["Code Generation"]
        DocEntries["Per-file .ts\none per markdown"]
        SidebarTS["sidebar.ts\nnavigation tree"]
        IndexTS["index.ts + types.ts\nbarrel export + interfaces"]
    end

    Walk --> Parse
    Parse --> Lex
    Lex --> Pre
    Pre --> Marked
    Marked --> Post
    Marked --> Shiki
    Shiki --> CodeRenderer
    Post --> DocEntries
    DocEntries --> SidebarTS
    SidebarTS --> IndexTS

    style Scan fill:#e8f5e9
    style Process fill:#fff3e0
    style Highlight fill:#e3f2fd
    style Generate fill:#f3e5f5
```

## Entry Point: `scripts/build-docs.mts`

This 1000+ line TypeScript script is the entire build engine. It does:

1. **Directory scanning** — Recursive walk of `docs/` (and optionally `blog/`)
2. **Frontmatter parsing** — YAML between `---` delimiters, with list support
3. **Plugin pipeline** — `preProcess → marked → postProcess` (reverse order)
4. **Shiki highlighting** — Code blocks syntax highlighted with TextMate grammars
5. **TOC extraction** — H2 and H3 headings extracted for table of contents
6. **Sidebar generation** — Category-based sidebar items with numeric prefix ordering
7. **Diagnostic analysis** — Content enrichment stats, admonition analysis, link validation
8. **TypeScript generation** — One `.ts` file per doc, plus sidebar and index files

## Content Scanner

### File Discovery

The scanner walks directories recursively, finding all `.md` files:

```typescript:desc=Recursive directory walker for markdown files.
function scanMdFiles(baseDir: string, section: "docs" | "blog"): DocEntry[] {
  if (!fs.existsSync(baseDir)) return [];
  const entries: DocEntry[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(".md")) {
        // Process this file...
      }
    }
  }
  walk(baseDir);
  return entries;
}
```

### Frontmatter Parsing

Supports standard YAML frontmatter with multi-line list syntax:

```yaml:title=docs/01-getting-started/01-project-overview.md:desc=YAML frontmatter example
---
title: Project Overview
description: What this project is about
sidebar_label: Overview
sidebar_position: 1
tags: [overview, architecture]
---
```

Also supports multi-line lists:

```yaml:desc=Multi-line YAML list syntax
tags:
  - overview
  - architecture
```

### Slug Generation

Numeric prefixes are stripped from filenames for clean URLs:

| File Path | Generated Slug |
|-----------|---------------|
| `00-welcome.md` | `welcome` |
| `01-getting-started/01-project-overview.md` | `getting-started/project-overview` |
| `02-architecture/01-build-pipeline.md` | `architecture/build-pipeline` |
| `03-guides/01-cli-reference.md` | `guides/cli-reference` |

## Plugin Pipeline

### Execution Order

```mermaid:desc=Plugin execution order showing preProcess, marked, and postProcess phases.
sequenceDiagram
    participant MD as Raw Markdown
    participant Math as math Plugin
    participant Admon as admonitions Plugin
    participant Marked as marked.parse()
    participant Mermaid as mermaid Plugin

    MD->>Math: preProcess (extract $...$)
    Math->>Admon: preProcess (extract ::: blocks)
    Admon->>Marked: Clean markdown
    Marked->>Mermaid: HTML output
    Mermaid->>Mermaid: postProcess (transform mermaid)
    Mermaid->>Admon: HTML with mermaid done
    Admon->>Admon: postProcess (render admonitions)
    Admon->>Math: HTML with admonitions done
    Math->>Math: postProcess (restore math)
    Math-->>Output: Final HTML
```

**Critical**: postProcess runs in **reverse** plugin order. This means:
1. mermaid runs first (so math sentinels inside mermaid blocks are still intact)
2. admonitions runs second (so math sentinels inside admonitions are still intact)
3. math runs last (restoring all sentinels)

### Custom Renderer

`marked` is configured with a custom renderer that:

- **Headings** — Generate anchor IDs with a Docusaurus-compatible slugifier (`c++` → `c-plus-plus`)
- **Code blocks** — Wrap in Shiki-highlighted HTML with a header showing language, copy button, and optional description

## Output Generation

### Per-Document Files

Each markdown file becomes a TypeScript file in `src/generated/docs/`:

```typescript:desc=Generated TypeScript file for a single document.
// src/generated/docs/welcome.ts
export const doc: DocEntry = {
  id: "welcome",
  slug: "welcome",
  title: "Welcome to rspack-react-docs",
  sidebar_label: "Welcome",
  sidebar_position: 0,
  category: "",
  description: "A fast, modern static site generator...",
  content: "<h1>Welcome to...</h1><p>...</p>",
  toc: [],
  section: "docs",
};
```

### Sidebar Data

The sidebar is generated by grouping documents by category (folder) and sorting by numeric prefix:

```typescript:desc=Generated sidebar navigation data structure.
export const sidebarData: SidebarItem[] = [
  { type: "doc", id: "welcome", label: "Welcome", slug: "welcome" },
  {
    type: "category",
    label: "Getting Started",
    link: { type: "doc", id: "getting-started/project-overview" },
    items: [
      { type: "doc", id: "getting-started/project-overview", label: "Overview" },
      { type: "doc", id: "getting-started/installation", label: "Installation" },
      { type: "doc", id: "getting-started/core-concepts", label: "Core Concepts" },
    ],
  },
  // ... more categories
];
```

### Barrel Export

`src/generated/index.ts` re-exports everything:

```typescript:desc=Barrel export from the generated index file.
export { doc as doc_welcome } from "./docs/welcome";
export { sidebarData } from "./sidebar";
export { allDocs } from "./docs";
export type { DocEntry } from "./types";
```

## Diagnostic Analysis

After generating docs, the build script runs content analysis:

- **AST/Token Summary** — Token counts and types per document
- **Admonition Analysis** — Counts and types of admonitions per file
- **Content Enrichment** — Code blocks, mermaid diagrams, references, footnotes
- **Link Validation** — Internal links checked against known slugs

## Triggering the Build

The build runs automatically during:

- `bun run dev` — Before starting the dev server
- `bun run build` — As part of the production build
- `bun run docs` — Standalone regeneration (skipping rspack)

During development, file changes trigger a rebuild through rspack's watch mode.

---

Next: [Dependency Injection](/docs/architecture/dependency-injection)
