# docts — Static Documentation Site Generator

A **Docusaurus-identical** documentation site generator built with **rspack**, **React**, and **ShikiJS**.

> **Zero runtime APIs. Pure static output. Deploy anywhere.**

## Why docts?

| | Docusaurus | docts |
|--|-----------|------|
| Install size | ~280 MB (847+ packages) | ~30 MB |
| Runtime dependencies | Many | None (static only) |
| Build approach | Plugin ecosystem | Single script |
| Output | Static + server | **Pure static** |
| Code highlighting | Shiki/Prism | **Shiki** (VS Code quality) |
| Config complexity | High | Minimal |

## Features

| Feature | Details |
|---------|---------|
| **Markdown docs** | YAML frontmatter, nested folders |
| **Syntax highlighting** | Shiki with 6 paperlike themes |
| **Sidebar** | Collapsible categories, auto-ordered |
| **Table of Contents** | Right sidebar with active tracking |
| **Navigation** | Prev/Next, breadcrumbs, edit link |
| **Themes** | Paper White, Paper Gray, Paper Sepia, Paper Dark, Navy, Dark Navy |
| **Code themes** | CSS filter-based switching (no rebuild needed) |
| **MathJax** | Inline `$E=mc^2$` and display `$$...$$` |
| **Mermaid diagrams** | Auto-rendered with loading states |
| **Admonitions** | `:::note`, `:::tip`, `:::warning`, `:::danger` |
| **Responsive** | Mobile sidebar, collapsible TOC |
| **Accessibility** | Semantic HTML, keyboard navigation |
| **Testing** | 214 tests with Bun + React Testing Library |
| **Zero runtime APIs** | All content in the JS bundle |

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev
# or use the unified CLI:
bun run docts dev
```

Your docs site is live at `http://localhost:3000`.

## Unified CLI: `docts`

All project commands go through the `docts` CLI:

```bash
# Development
bun run docts dev              # Start dev server with HMR
bun run docts dev -p 8080      # Custom port

# Building
bun run docts build            # Full production build
bun run docts build --no-lint  # Skip lint (faster)
bun run docts build --strict   # Fail on lint errors

# Serving
bun run docts start            # Serve production build
bun run docts preview          # Build + serve in one command

# Documentation
bun run docts docs             # Regenerate docs only

# Code quality
bun run docts lint             # Check code quality
bun run docts lint:fix         # Auto-fix issues

# Testing
bun run docts test             # Run test suite
bun run docts test --coverage  # With coverage report

# Maintenance
bun run docts clean            # Clean build artifacts
bun run docts info             # Show project information
```

## Project Structure

```
├── docs/                    # Documentation markdown
│   ├── project-overview.md
│   ├── directory-structure.md
│   └── guides/              # Nested categories
│       ├── build-system.md
│       ├── dependency-injection.md
│       ├── cli-reference.md
│       └── ...
├── scripts/
│   ├── cli.mts              # Unified docts CLI
│   ├── build-docs.mts       # Markdown → TypeScript
│   ├── diagnostics.ts       # Validation framework
│   └── plugins/             # Markdown plugins
│       ├── math.ts          # LaTeX math
│       ├── admonitions.ts   # :::callouts
│       └── mermaid.ts       # Diagrams
├── src/
│   ├── App.tsx              # Main application
│   ├── DocViewer.tsx        # Content renderer
│   ├── Sidebar.tsx          # Left navigation
│   ├── TableOfContents.tsx  # Right TOC
│   ├── services/            # Dependency Injection
│   ├── hooks/               # 14 custom hooks
│   ├── styles/              # 18 modular CSS files
│   └── generated/           # AUTO-GENERATED output
├── server/
│   └── prod-server.mjs      # Production static server
└── tests/                   # 214 tests
```

## How It Works

### Build Time

```
docs/*.md ────────► build-docs.mts ──► src/generated/*.ts
                                     (sidebar, docs, types)
            │
            ├──► marked (md→html)
            ├──► shiki (syntax highlight)
            └──► plugins (math, admonitions, mermaid)
```

### Runtime

```
src/generated/*.ts ──► React SPA ──► dist/ (static files)
                       (no fetch, no APIs)
```

1. **Build script** scans `docs/`, parses frontmatter, converts markdown to HTML with Shiki highlighting, generates TypeScript data files
2. **rspack** bundles the React app + all content into `dist/`
3. **Deploy** `dist/` anywhere — it's pure static files

## Adding Content

### Create a Document

```markdown
---
title: Getting Started
description: Learn how to set up and run the docs
sidebar_label: Introduction    # Optional
sidebar_position: 1             # Optional (lower = first)
---

# Getting Started

Your markdown content here...
```

### Organize with Categories

```
docs/
├── intro.md                   # Top-level doc
├── guides/
│   ├── setup.md
│   └── configuration.md
└── tutorials/
    ├── basics.md
    └── advanced.md
```

Folder names become **collapsible sidebar categories** (auto-formatted: `tutorial-basics` → `Tutorial Basics`).

## Themes

### UI Themes (6 paperlike options)

| Theme | Preview | Best For |
|-------|---------|----------|
| Paper White | Clean white | Bright environments |
| Paper Gray | Soft gray | Reduced eye strain |
| Paper Sepia | Warm tones | Vintage feel |
| Paper Dark | Dark gray | Low-light reading |
| Navy | Blue-tinted | Professional look |
| Dark Navy | Deep navy | Modern dark mode |

### Code Block Themes

Syntax highlighting themes use **CSS filters** — switch instantly without rebuilding:
- Matches the selected UI theme automatically
- 6 paperlike variations + Navy/Dark Navy

## Deployment

The `dist/` folder contains **pure static files**. Deploy anywhere:

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=dist

# GitHub Pages
git subtree push --prefix dist origin gh-pages

# Cloudflare Pages
wrangler pages deploy dist

# Any static server
cp -r dist/* /var/www/html/
```

## Documentation

Comprehensive docs are included in the `docs/` folder covering:

- **Project Overview** — Architecture principles
- **Directory Structure** — Complete file organization
- **Build System** — Markdown pipeline, rspack config
- **DI Container** — Service architecture
- **Component Reference** — React component hierarchy
- **CSS & Themes** — Styling and theming
- **React Hooks** — All 14 hooks with examples
- **Markdown Plugins** — Plugin system architecture
- **Testing Strategy** — Test infrastructure
- **Deployment** — All deployment targets
- **Generated Output** — TypeScript data format
- **CLI Reference** — Complete command guide

Run `bun run docts dev` to read them live.

## Development

```bash
# Watch mode
bun run docts dev

# Lint
bun run docts lint
bun run docts lint:fix

# Format
bun run format
bun run format:check

# Test
bun run docts test
bun run docts test --watch
bun run docts test --coverage
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Bundler** | rspack (fast webpack alternative) |
| **UI** | React 19 |
| **Styling** | CSS modules + goober (minimal CSS-in-JS) |
| **Markdown** | marked (build-time conversion) |
| **Highlighting** | Shiki (VS Code quality) |
| **Diagrams** | Mermaid (runtime lazy-loaded) |
| **Math** | MathJax (CDN) |
| **Linter** | Biome (ESLint + Prettier replacement) |
| **Testing** | Bun test + React Testing Library |

## Comparison

| | Docusaurus | docts |
|--|-----------|------|
| Packages | 847+ | ~15 |
| Install size | ~280 MB | ~30 MB |
| Build time | 30-60s | 5-10s |
| Runtime APIs | Yes | **None** |
| Customization | Plugin system | Direct code access |
| Learning curve | Steep | Minimal |

## License

MIT
