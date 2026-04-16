---
title: File Structure
description: Complete project directory tree with explanations
sidebar_label: File Structure
sidebar_position: 5
---

# File Structure

This document provides a complete overview of the project directory tree and explains the purpose of each directory and file.

## Directory Tree

```:desc=Directory tree example
rspack-react-docs/
├── docs/                    # Markdown source files for documentation
│   ├── 00-welcome.md        # Landing page (first doc in sidebar)
│   ├── 01-getting-started/  # Getting started guides (with numeric prefixes)
│   │   ├── 01-project-overview.md
│   │   ├── 02-installation.md
│   │   └── 03-core-concepts.md
│   ├── 02-architecture/     # Architecture documentation
│   ├── 03-guides/           # How-to guides
│   ├── 04-reference/        # API reference documentation (this section)
│   └── 05-contributing/     # Contribution guidelines
├── src/
│   ├── generated/           # Auto-generated from docs (DO NOT EDIT)
│   │   ├── index.ts         # Barrel export
│   │   ├── sidebar.ts       # Sidebar data tree
│   │   ├── types.ts         # DocEntry interface
│   │   ├── clipboard.ts     # copyCode helper (static, not regenerated)
│   │   └── docs/            # One .ts file per markdown doc
│   │       ├── index.ts     # Re-exports all doc entries
│   │       └── *.ts         # Individual doc data modules
│   ├── hooks/               # 16 custom React hooks
│   │   ├── index.ts         # Barrel export for all hooks
│   │   ├── useActiveSection.ts
│   │   ├── useClipboard.ts
│   │   ├── useCopyCode.ts
│   │   ├── useDebounce.ts
│   │   ├── useDocsTheme.ts
│   │   ├── useKeyboardShortcut.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useReadingTime.ts
│   │   ├── useScrollProgress.ts
│   │   ├── useScrollToTop.ts
│   │   ├── useSeo.ts
│   │   ├── useShikiTheme.ts
│   │   ├── useTheme.ts
│   │   └── useTitle.ts
│   ├── services/            # Dependency injection container + providers
│   │   └── container.ts     # 5 service interfaces and default implementations
│   ├── styles/              # 22 modular CSS files
│   │   ├── index.css        # Main stylesheet (imports all others)
│   │   ├── variables.css    # CSS custom properties (colors, spacing)
│   │   ├── layout.css       # Grid layout (sidebar, content, TOC)
│   │   ├── responsive.css   # Media queries and breakpoints
│   │   ├── doc-content.css  # Content area typography
│   │   ├── code-blocks.css  # Code block styling
│   │   ├── shiki-themes.css # Shiki syntax theme styles
│   │   ├── admonitions.css  # Admonition block styling
│   │   ├── mermaid.css      # Mermaid diagram containers
│   │   ├── math.css         # MathJax math rendering
│   │   ├── toc.css          # Table of contents panel
│   │   ├── breadcrumbs.css  # Breadcrumb navigation
│   │   ├── doc-footer.css   # Prev/Next navigation footer
│   │   ├── doc-stats-footer.css # Document statistics footer
│   │   ├── states.css       # Loading, empty, error states
│   │   ├── panels.css       # Side panels (metadata, refs)
│   │   ├── metadata.css     # Metadata panel styling
│   │   ├── article-links-panel.css # Article references panel
│   │   ├── blog.css         # Blog section styles
│   │   ├── print-media.css  # Print media queries
│   │   ├── print-view.css   # Print view specific styles
│   │   └── error-boundary.css # Error boundary UI
│   ├── App.tsx              # Root component (routing, sidebar, TOC)
│   ├── DocViewer.tsx        # Content renderer (dangerouslySetInnerHTML)
│   ├── frontend.tsx         # Entry point (React root, DI provider)
│   ├── Sidebar.tsx          # Navigation sidebar component
│   ├── TableOfContents.tsx  # TOC panel component
│   ├── DocFooter.tsx        # Prev/Next page navigation
│   ├── ASTViewer.tsx        # Debug-only AST tree viewer
│   ├── ErrorBoundary.tsx    # React error boundary
│   └── ...                  # Other UI components
├── scripts/
│   ├── cli.mts              # Unified CLI entry point (dev, build, start, etc.)
│   ├── build-docs.mts       # Build pipeline (scans .md, generates .ts)
│   ├── validate-all.mts     # Markdown validator runner
│   ├── diagnostics.ts       # Build-time diagnostic reporting
│   └── plugins/             # Markdown plugins
│       ├── index.ts         # Plugin registry [math, admonitions, mermaid]
│       ├── types.ts         # MarkdownPlugin, MarkdownValidator interfaces
│       ├── math.ts          # MathJax $...$ extraction plugin
│       ├── admonitions.ts   # :::note/:::warning/:::tip plugin
│       ├── mermaid.ts       # Mermaid diagram rendering plugin
│       └── validators/      # Markdown validators
│           ├── index.ts     # Validator registry
│           ├── types.ts     # Validator type exports
│           ├── codeblock-validator.ts   # Code block checks
│           ├── mermaid-validator.ts     # Mermaid validation
│           ├── admonition-validator.ts  # Admonition analysis
│           ├── reference-validator.ts   # Footnote validation
│           ├── frontmatter-validator.ts # Frontmatter validation
│           └── mermaid-content.ts       # Mermaid content checks
├── tests/                   # Jest test files
├── server/                  # Production server
├── dist/                    # Build output (generated by rspack)
├── node_modules/            # Dependencies
├── rspack.config.ts         # rspack bundler configuration
├── package.json             # Project metadata and scripts
├── tsconfig.json            # TypeScript compiler configuration
├── biome.json               # Biome (linter/formatter) configuration
├── bun.lock                 # Bun lockfile
├── bunfig.toml              # Bun configuration
├── bun-env.d.ts             # Bun type declarations
├── .gitignore               # Git ignore rules
├── robots.txt               # SEO robots.txt
├── sitemap.xml              # SEO sitemap
├── test-mermaid.ts          # Mermaid rendering test script
└── test-render.html         # Mermaid test HTML output
```

## Key Directories

### docs/

Contains all markdown source files. Numeric prefixes (`00-`, `01-`, etc.) control the display order in the sidebar and are stripped from the final URLs.

```:desc=Doc file mapping example
docs/01-getting-started/01-project-overview.md
                                       --> slug: "getting-started/project-overview"
                                       --> sidebar_position: 1 (from filename prefix)
```

See [Generated Output](./01-generated-output.md) for details on how these files are processed.

### src/

All frontend source code. Divided into subdirectories by concern:

| Subdirectory | Contents |
|---|---|
| `src/generated/` | Auto-generated TypeScript data (DO NOT EDIT manually) |
| `src/hooks/` | 16 custom React hooks for theming, SEO, clipboard, scroll |
| `src/services/` | DI container with 5 service interfaces |
| `src/styles/` | 22 modular CSS files for all UI components |
| Root `.tsx` files | React components (App, DocViewer, Sidebar, TOC, etc.) |

### scripts/

Build-time tooling. All scripts use `.mts` extension (TypeScript modules run by Bun):

| Script | Command | Purpose |
|---|---|---|
| `cli.mts` | `bun run dev`, `bun run build` | Unified CLI for all operations |
| `build-docs.mts` | `bun run build:docs` | Scans `.md` files, generates `src/generated/` |
| `validate-all.mts` | `bun run validate` | Runs all validators on docs |
| `diagnostics.ts` | (internal) | Build-time error/warning reporting |
| `plugins/` | (internal) | Markdown transform plugins and validators |

### server/

Production server files for serving the built documentation site.

### tests/

Jest test files for unit and integration testing of components, hooks, and build scripts.

## Build Pipeline Overview

```mermaid:desc=Build pipeline overview diagram
flowchart tb
    A["docs/*.md"] --> B["scripts/build-docs.mts"]
    B --> C["Parse frontmatter"]
    C --> D["Run preProcess plugins"]
    D --> E["marked.parse() -> HTML"]
    E --> F["Run postProcess plugins reverse"]
    F --> G["Shiki syntax highlight"]
    G --> H["src/generated/ output"]
    H --> I["rspack.config.ts bundles"]
    I --> J["src/frontend.tsx entry point"]
    J --> K["dist/ final output"]
```

## Technology Stack

| Layer | Technology |
|---|---|
| Bundler | rspack |
| Framework | React 19 |
| Language | TypeScript |
| Markdown parser | marked (GFM) |
| Syntax highlighting | Shiki |
| Diagrams | Mermaid |
| Math rendering | MathJax |
| CSS-in-JS | goober |
| State management | Valtio |
| Runtime | Bun |
| Linting/Formatting | Biome |

## Cross-References

- [Generated Output](./01-generated-output.md) -- detailed breakdown of `src/generated/`
- [AST Parser](./02-ast-parser.md) -- `src/ast-parser.ts` utilities
- [Configuration](./03-configuration.md) -- `src/services/container.ts` interfaces
- [Plugins API](./04-markdown-plugins-api.md) -- `scripts/plugins/` registry
- [Migrating from Docusaurus](./06-migrating-from-docusaurus.md) -- structural differences from other SSGs
