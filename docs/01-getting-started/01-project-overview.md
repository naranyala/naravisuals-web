---
title: Project Overview
description: Comprehensive overview of the rspack React ShikiJS documentation site generator architecture
sidebar_label: Overview
sidebar_position: 1
---

# Project Overview

A **Docusaurus-identical** documentation site generator built with rspack, React, and ShikiJS. Core philosophy: **minimal dependencies at build time, zero APIs at runtime, pure static output**.

:::note Zero Runtime APIs
All content is pre-built into TypeScript constants. The browser never makes network requests for content — everything is embedded at build time.
:::

## Architecture Principles

:::tip Recommended Reading
The six principles below form the foundation of this project. Understanding them will help you customize and extend the documentation site effectively.
:::

```mermaid:desc=Mindmap showing the six core architectural principles of the project centered around minimal dependencies and zero runtime APIs.
mindmap
  root(("docts\nArchitecture"))
    Zero Runtime APIs
      All content in TS constants
      No network requests
      Pure static output
    Static Generation
      Markdown to HTML at build
      TypeScript data files
      Pre-built bundles
    Client-Side Routing
      SPA with history.pushState
      No SSR needed
      URL-based slug lookup
    Dependency Injection
      Abstracted service interfaces
      Testable components
      Mock services
    CSS-in-JS plus Modular CSS
      goober for dynamic styles
      CSS modules for components
      Theme system
    Theme System
      6 paperlike themes
      CSS filter code switching
      LocalStorage persistence
```

- **Zero runtime APIs**: All content is pre-built into TypeScript constants. The browser never makes network requests for content.
- **Static generation**: Markdown is converted to HTML at build time, embedded as TypeScript data files
- **Client-side routing**: SPA with `history.pushState`, no server-side rendering required
- **Dependency injection**: All browser APIs abstracted behind service interfaces for testability
- **CSS-in-JS + modular CSS**: goober for dynamic styles, CSS modules for component styles
- **Theme system**: 6 paperlike themes with CSS filter-based code theme switching

## Key Dependencies

```mermaid:desc=Flowchart showing the separation between build-time dependencies (marked, shiki, rspack, biome) and runtime dependencies (react, goober, mermaid, serve).
flowchart LR
    subgraph BuildTime["Build Time"]
        B1["marked v18\nMarkdown to HTML"]
        B2["shiki v4\nSyntax highlighting"]
        B3["rspack core\nBundler"]
        B4["biomejs biome\nLinter"]
    end

    subgraph Runtime["Runtime"]
        R1["react v19\nUI framework"]
        R2["goober v2\nCSS-in-JS"]
        R3["mermaid v11\nDiagrams"]
        R4["serve v14\nStatic server"]
    end

    style BuildTime fill:#e1f5ff
    style Runtime fill:#fff4e1
```

| Package | Role | When Used |
|---------|------|-----------|
| `react` + `react-dom` (v19) | UI framework | Runtime |
| `goober` (v2) | CSS-in-JS (minimal) | Runtime |
| `mermaid` (v11) | Diagram rendering | Runtime (lazy loaded) |
| `serve` (v14) | Static file server | Production |
| `marked` (v18) | Markdown to HTML parser | Build only |
| `shiki` (v4) | Syntax highlighting | Build only |
| `@rspack/core` + `@rspack/cli` | Bundler | Dev |
| `@biomejs/biome` | Linter/formatter | Dev |

## Build Flow

```txt:desc=Complete build pipeline flow: from raw markdown files through frontmatter parsing, plugin processing, HTML generation, validation, and final static output.
Raw .md files
    ↓
Parse frontmatter (YAML)
    ↓
Plugin preProcess (math, admonitions)
    ↓
marked.parse() → HTML
    ↓
Plugin postProcess (mermaid, admonitions, math)
    ↓
Extract TOC from headings
    ↓
Validate (frontmatter, slugs, links)
    ↓
Generate TypeScript files in src/generated/
    ↓
Generate sitemap.xml + robots.txt (SEO)
    ↓
rspack builds React SPA
    ↓
dist/ folder (pure static files)
```

## Theme Options

| Theme | Type | Background | Best For |
|-------|------|-----------|----------|
| Paper White | Light | `#ffffff` | Bright environments |
| Paper Gray | Light | `#e8e8e8` | Reduced eye strain |
| Paper Sepia | Light | `#f4ecd8` | Warm, vintage feel |
| Paper Dark | Dark | `#2a2a2a` | Low-light reading |
| Navy | Light | `#f0f4f8` | Professional blue |
| Dark Navy | Dark | `#0f172a` | Modern dark mode |

## Quick Start

```bash:desc=Common npm scripts for development workflow: starting dev server, building production bundle, serving the built site, and running tests.
# Development
npm run dev

# Production build
npm run build

# Serve production build
npm start

# Run tests
npm test
```
