---
title: Build Pipeline
description: How scripts/build-docs.mts scans, parses, and generates TypeScript from markdown
sidebar_label: Build Pipeline
sidebar_position: 1
tags: [architecture, build, pipeline]
---

# Build Pipeline

The build pipeline is the engine of rspack-react-docs. It transforms raw Markdown files into specialized TypeScript compilation units that the React app consumes.

## The Compiler Engine (v2)

The system uses a stateful `DocumentationCompiler` to manage the transformation lifecycle. Unlike simple scripts, this engine treats each document as a `CompilationUnit` within a shared `CompilationContext`.

### Pipeline Overview

```mermaid:desc=Modern build pipeline architecture showing the compiler engine and middleware system.
flowchart TB
    subgraph Engine["Documentation Compiler"]
        Scan["File Discovery & Ingest"]
        Context["Compilation Context (State & Diags)"]
        Renderer["Stateful Markdown Renderer"]
    end

    subgraph Pipeline["Middleware Pipeline"]
        PreParse["onPreParse (Plugins/Math)"]
        Transform["onTransform (AST Validation)"]
        PostProcess["onPostProcess (Mermaid/Timeline)"]
        Assemble["onAssemble (Global Logic)"]
    end

    subgraph Generate["Artifact Generation"]
        TS["TypeScript Data (.ts)"]
        SEO["Sitemap & Robots (.xml/.txt)"]
        Sidebar["Sidebar Tree (sidebar.ts)"]
    end

    Scan --> Context
    Context --> PreParse
    PreParse --> Transform
    Transform --> Renderer
    Renderer --> PostProcess
    PostProcess --> Assemble
    Assemble --> TS
    Assemble --> SEO
    Assemble --> Sidebar

    style Engine fill:#e8f5e9
    style Pipeline fill:#fff3e0
    style Generate fill:#f3e5f5
```

## Core Abstractions

### 1. `CompilationUnit`
Each markdown file is loaded into memory as a unit. It tracks:
s*-   **Raw Content**: The original markdown string.
s*-   **Metadata**: Derived from frontmatter or content fallbacks.
s*-   **AST Tokens**: The parsed `marked` token stream.
s*-   **HTML**: The final transformed markup.

### 2. `CompilationContext`
A unified object that lives for the duration of the build. It prevents "prop-drilling" by providing a single source for:
s*-   **Diagnostics**: Accumulated errors and warnings.
s*-   **Configuration**: Global build settings.
s*-   **State Tracking**: Information shared across multiple files (like slug uniqueness).

### 3. Middleware Lifecycle
The transformation logic is decoupled into reusable middlewares:
s*-   **`onIngest`**: Initial path validation and unit creation.
s*-   **`onPreParse`**: Text-level transformations (e.g., math sentinel extraction).
s*-   **`onTransform`**: AST-level analysis and deep syntax validation.
s*-   **`onPostProcess`**: Final HTML enhancements and feature injection.
s*-   **`onAssemble`**: Cross-document logic (e.g., link checking across all units).

## Output Strategy

The compiler generates a zero-runtime data set:
1. **Per-Document Files**: One `.ts` file per doc, exported as a constant.
2. **Barrel Exports**: `index.ts` files for clean imports in React.
3. **SEO Artifacts**: Dynamically generated `sitemap.xml` and `robots.txt`.

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

The scanner uses `fast-glob` to identify markdown files efficiently across the project structure. This replaces manual recursive directory walking, providing better performance and native support for ignore patterns.

```typescript:desc=Optimized file discovery using fast-glob.
import glob from "fast-glob";

async function scanMdFiles(baseDir: string): Promise<string[]> {
  // Finds all .md files recursively with absolute paths
  return await glob("**/*.md", { cwd: baseDir, absolute: true });
}
```

### Build-Time Quality Enforcement

The build pipeline now enforces strict quality standards through mandatory steps:

1.  **TypeScript Verification**: Every build runs `tsc --noEmit` across the entire codebase. The build will fail if any type errors are detected.
2.  **Strict Linting**: Biome is integrated into the pipeline with elevated rule severities. Unused imports, variables, and unsafe patterns are treated as errors that halt the build.
3.  **Cross-Document Validation**: The compiler checks for duplicate slugs and broken internal links between documents before generating artifacts.

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
| `00-abstract.md` | `abstract` |
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

    MD-->>Math: preProcess (extract $...$)
    Math-->>Admon: preProcess (extract ::: blocks)
    Admon-->>Marked: Clean markdown
    Marked-->>Mermaid: HTML output
    Mermaid-->>Mermaid: postProcess (transform mermaid)
    Mermaid-->>Admon: HTML with mermaid done
    Admon-->>Admon: postProcess (render admonitions)
    Admon-->>Math: HTML with admonitions done
    Math-->>Math: postProcess (restore math)
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
// src/generated/docs/abstract.ts
export const doc: DocEntry = {
  id: "abstract",
  slug: "abstract",
  title: "Abstract",
  sidebar_label: "Abstract",
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
