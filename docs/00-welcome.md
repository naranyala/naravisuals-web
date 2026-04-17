---
title: Welcome to rspack-react-docs
description: A fast, modern static site generator for documentation built with rspack, React, Shiki, and Mermaid
sidebar_label: Welcome
sidebar_position: 0
tags: [welcome, getting-started]
---

# Welcome to rspack-react-docs

A **fast, modern static site generator (SSG)** for building beautiful documentation websites. Powered by rspack for blazing builds, React for the UI, Shiki for VS-quality syntax highlighting, and Mermaid for live diagrams.

> **Zero runtime APIs. Everything is generated at build time.**

---

## Quick Start

```bash:desc=Install dependencies and start the development server
bun install
bun run dev
```

Your dev server is now running at `http://localhost:3000`.

---

## Documentation Structure

| Section | Description |
|---------|-------------|
| [Getting Started](/docs/getting-started/project-overview) | Overview, installation, and core concepts |
| [Architecture](/docs/architecture/build-pipeline) | Build pipeline, DI container, components, markdown engine |
| [Guides](/docs/guides/cli-reference) | CLI, themes, hooks, SEO, validation, plugins, testing |
| [Reference](/docs/reference/generated-output) | Generated output, AST parser, configuration, plugins, file structure |
| [Contributing](/docs/contributing/development-workflow) | Development workflow and documentation guide |

---

## Key Features

| Feature | Details |
|---------|---------|
| **Markdown → HTML** | `marked` parser with custom plugins for math, admonitions, mermaid |
| **Syntax Highlighting** | Shiki (VS Code-quality themes, 150+ languages) |
| **Diagrams** | Mermaid live rendering with zoom, pan, and SVG download |
| **Math** | LaTeX math via MathJax (`$inline$` and `$$display$$`) |
| **Admonitions** | Docusaurus-style `:::note`, `:::tip`, `:::warning` blocks |
| **Themes** | 6 paper-like themes with CSS filter-based code theme switching |
| **SEO** | JSON-LD, Open Graph, Twitter Cards, canonical URLs, sitemap.xml |
| **CLI** | Unified `docts` CLI with dev, build, preview, lint, test commands |
| **Validation** | Multi-validator system with strict/stats/llm output modes |
| **DI Architecture** | Swappable services (storage, router, DOM, theme) for testing |
| **Print Export** | Full-page HTML print with rendered Mermaid SVGs |

---

## Technology Stack

| Category | Technology |
|----------|------------|
| **Build Tool** | rspack + SWC |
| **Frontend** | React 19, TypeScript |
| **CSS** | goober (CSS-in-JS), CSS custom properties |
| **Markdown** | marked (custom renderer + plugins) |
| **Syntax Highlighting** | Shiki |
| **Diagrams** | Mermaid |
| **Math** | MathJax |
| **State** | Valtio (proxy-based) |
| **DI** | Custom service container |
| **Package Manager** | Bun |
| **Linter** | Biome |
| **Testing** | Jest + Testing Library |
| **Dev Server** | rspack serve + HMR |

---

## Project at a Glance

```mermaid:desc=High-level architecture showing the build pipeline from markdown source to final SPA.
flowchart TB
    subgraph Source
        MD["docs/**/*.md"]
    end

    subgraph Build["Build Pipeline"]
        Scan["Scan & Parse"]
        Plugins["Markdown Plugins"]
        Shiki["Shiki Highlighting"]
        Generate["Generate TS Files"]
    end

    subgraph Bundle["rspack Bundle"]
        React["React App"]
        SPA["Single Page App"]
    end

    subgraph Output
        HTML["index.html + JS bundle"]
        Assets["MathJax + Mermaid libs"]
    end

    Source --> Scan
    Scan --> Plugins
    Plugins --> Shiki
    Shiki --> Generate
    Generate --> React
    React --> Bundle
    Bundle --> SPA
    SPA --> Output

    style Source fill:#e8f5e9
    style Build fill:#fff3e0
    style Bundle fill:#e3f2fd
    style Output fill:#f3e5f5
```

---

## Next Steps

- Read the [Project Overview](/docs/getting-started/project-overview) to understand what this is
- Follow the [Installation Guide](/docs/getting-started/installation) to get set up
- Explore the [Core Concepts](/docs/getting-started/core-concepts) to understand the build pipeline
- Dive into the [Architecture docs](/docs/architecture/build-pipeline) for deeper technical detail

---

Happy building! 📚
