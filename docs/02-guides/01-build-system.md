---
title: Build System
description: How the markdown-to-TypeScript build pipeline works
sidebar_label: Build System
sidebar_position: 3
---

# Build System

:::note Build Pipeline Overview
The build pipeline transforms raw markdown files into static HTML, generates TypeScript data files, and creates the final production bundle. Understanding this flow helps with debugging and customization.
:::

## Build Pipeline Flow

```mermaid:desc=Complete build pipeline flowchart showing all processing stages from raw markdown through TypeScript generation with subgraphs for each major phase.
flowchart TD
    Start[Raw .md files] --> ParseFM["parseFrontmatter\nExtract YAML frontmatter"]

    ParseFM --> ValidateFM["validateFrontmatter\nCheck required fields"]

    ValidateFM --> PreProcess["Plugin preProcess\n1. math: Extract $...$\n2. admonitions: Extract :::blocks\n3. mermaid: Pass-through"]

    PreProcess --> MarkedParse["marked.parse\nConvert to HTML with custom renderer"]

    MarkedParse --> Shiki["Shiki syntax highlighting\ngithub-dark theme"]
    MarkedParse --> Headings["Add heading anchors\n+ hash-link permalinks"]

    Shiki --> PostProcess["Plugin postProcess REVERSE order\n1. mermaid: Wrap diagrams\n2. admonitions: Render callouts\n3. math: MathJax spans"]
    Headings --> PostProcess

    PostProcess --> ExtractTOC["extractTOC\nExtract h2/h3 headings"]

    ExtractTOC --> ValidateLinks["validateInternalLinks\nCheck against known slugs"]

    ValidateLinks --> ValidateSlugs["validateUniqueSlugs\nDetect duplicates"]

    ValidateSlugs --> BuildSidebar["buildSidebar\nGroup by category, sort by position"]

    BuildSidebar --> GenerateTS["Generate TypeScript Files\nsidebar.ts, types.ts, docs/*.ts\ndocs/index.ts, index.ts"]

    GenerateTS --> SEO["Generate SEO files\nsitemap.xml, robots.txt"]

    SEO --> Rspack["rspack builds React SPA"]

    Rspack --> Dist["dist/ folder\nPure static files"]

    classDef phase fill:#e1f5ff,stroke:#0277bd,stroke-width:2px
    classDef input fill:#fff4e1,stroke:#f57c00,stroke-width:2px
    classDef output fill:#e8f5e9,stroke:#388e3c,stroke-width:2px

    class Start input
    class Dist output
    class ParseFM,ValidateFM,PreProcess,MarkedParse,PostProcess,ExtractTOC,ValidateLinks,ValidateSlugs,BuildSidebar,GenerateTS,SEO,Rspack phase
```

## Build Commands

:::tip Development Workflow
Use `npm run dev` for development with hot module replacement (HMR). For faster iteration on content only, use `npm run build:docs` to regenerate documentation without rebuilding the bundle.
:::

```bash:desc=Essential build workflow commands: development mode with live reload, production build with full optimization, and standalone doc generation.
# Development: regenerate docs + start dev server
npm run dev

# Production: clean, build docs, lint, bundle
npm run build

# Only regenerate docs
npm run build:docs
```

## rspack Configuration

**Entry:** `src/frontend.tsx` (single entry point)

**Output:** 
- Production: `[name].[contenthash].js` in `dist/`
- Development: `[name].js`

**Loaders:**
- `builtin:swc-loader` for TypeScript/JSX with React automatic runtime
- `style-loader` + `css-loader` for CSS (injected into `<style>` tags)
- `asset/resource` for images

**Plugins:**
- `HtmlRspackPlugin` with `src/index.html` template
- `DefinePlugin` for `NODE_ENV`
- `CopyRspackPlugin` copies `logo.svg`
- `ReactRefreshRspackPlugin` (dev only)

## TypeScript Configuration

- Target: ESNext, Module: ESNext, ModuleResolution: bundler
- JSX: `react-jsx` (automatic)
- Strict mode with `noUncheckedIndexedAccess`, `noImplicitOverride`
- `noEmit: true` (rspack handles compilation)
- Path alias: `@/*` → `./src/*`
