---
title: Welcome
description: A fast, modern static site generator for documentation built with rspack, React, Shiki, and Mermaid
sidebar_label: Welcome
sidebar_position: 0
tags: [welcome, getting-started]
---

# Welcome to SSG Documentation

The **SSG Documentation Site Generator** (docts) is a fast, modern tool for building beautiful documentation websites. Powered by **rspack** for blazing builds, **React** for the UI, **Shiki** for VS Code-quality syntax highlighting, and **Mermaid** for live diagrams.

> **Zero runtime APIs. Everything is generated at build time.**

---

## Quick Start

```bash:desc=Install dependencies and start the development server
bun install
bun run dev
```

Your dev server is now running at `http://localhost:3000`.

---

## Documentation Sections

| Section | What's inside? |
|---------|-------------|
| **[Getting Started](./01-getting-started/01-introduction)** | Overview, installation, and core concepts |
| **[Architecture](./02-architecture/01-build-pipeline)** | Build pipeline, DI container, components, and hybrid toolchain |
| **[Guides](./03-guides/01-cli-reference)** | CLI, themes, hooks, SEO, and validation |
| **[Reference](./04-reference/01-project-structure)** | Project structure, API details, and glossary |

---

## Key Features

- **⚡ Performance**: Rust-powered build engine and rspack bundling.
- **🎨 Rich Content**: Native Mermaid.js, MathJax, and Admonition support.
- **🔍 SEO Optimized**: Automatic sitemap, JSON-LD, and meta tags.
- **🛠 Developer First**: Strict build-time validation and HMR.

---

## High-Level Architecture

```mermaid:desc=High-level architecture showing the build pipeline from markdown source to final SPA.
flowchart TB
    subgraph Source
        MD["docs/**/*.md"]
    end

    subgraph Build["Build Engine (Hybrid Bun/Rust)"]
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
        Final["dist/ (index.html + JS)"]
    end

    Source --> Scan
    Scan --> Plugins
    Plugins --> Shiki
    Shiki --> Generate
    Generate --> React
    React --> Bundle
    Bundle --> SPA
    SPA --> Final

    style Source fill:#e8f5e9
    style Build fill:#fff3e0
    style Bundle fill:#e3f2fd
    style Output fill:#f3e5f5
```

---

## Next Steps

1. Read the **[Introduction](./01-getting-started/01-introduction)** to understand the project.
2. Follow the **[Installation Guide](./01-getting-started/02-installation)** to get set up.
3. Explore the **[Hybrid Toolchain](./02-architecture/05-hybrid-toolchain)** to see how we use Bun and Rust.

Happy building! 📚
