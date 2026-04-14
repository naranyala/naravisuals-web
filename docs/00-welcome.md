---
title: Welcome to docts
description: Your static documentation site generator built with rspack, React, and ShikiJS
sidebar_label: Welcome
sidebar_position: 0
---

# Welcome to docts

A **Docusaurus-identical** documentation site generator built with rspack, React, and ShikiJS.

> **Zero runtime APIs. Pure static output. Deploy anywhere.**

---

## Quick Start

```bash:desc=Install dependencies and start the development server
bun install
bun run dev
```

Your docs site is live at `http://localhost:3000`.

---

## Documentation Categories

Explore the documentation organized by topic:

### 📖 Getting Started

Learn the basics of docts and set up your project.

| Article | Description |
|---------|-------------|
| [Project Overview](/docs/getting-started/project-overview) | Architecture principles and key dependencies |
| [Directory Structure](/docs/getting-started/directory-structure) | Complete file organization guide |

---

### 🛠️ Guides

In-depth guides covering all aspects of the build system, components, and deployment.

| Article | Description |
|---------|-------------|
| [Build System](/docs/guides/build-system) | How the markdown-to-TypeScript build pipeline works |
| [Dependency Injection](/docs/guides/dependency-injection) | Service architecture and React integration |
| [Component Reference](/docs/guides/component-reference) | React component hierarchy and props |
| [CSS & Theme Architecture](/docs/guides/css-theme-architecture) | Styling and theming system |
| [React Hooks](/docs/guides/react-hooks) | All 14 custom hooks with examples |
| [Markdown Plugins](/docs/guides/markdown-plugins) | Plugin system architecture |
| [Testing Strategy](/docs/guides/testing-strategy) | Test infrastructure and best practices |
| [Deployment](/docs/guides/deployment) | Production build and deployment options |
| [Generated Output](/docs/guides/generated-output) | TypeScript data format and structure |
| [CLI Reference](/docs/guides/cli-reference) | Complete command guide |
| [Application Bootstrap](/docs/guides/application-bootstrap) | How the React app starts |
| [AST Parser](/docs/guides/ast-parser) | Markdown token parsing and AST viewer |
| [SEO & LLM Optimization](/docs/guides/seo-llm-optimization) | Search engine and AI crawler optimization |
| [Build Statistics](/docs/guides/build-statistics) | Codeblock and admonition tracking |
| [Validation Plugins](/docs/guides/validation-plugins) | Unified plugin-based validation system |
| [Validation Formatting](/docs/guides/validation-formatting) | Improved validation output formatting |
| [LLM Validator Output](/docs/guides/llm-validator-output) | LLM-friendly validator output |
| [Frontmatter Validator](/docs/guides/frontmatter-validator) | YAML frontmatter validation |
| [Strict Footnote Validator](/docs/guides/strict-footnote-validator) | Strict footnote syntax validation |

---

## Project Statistics

### Content Overview

| Metric | Count |
|--------|-------|
| Total Articles | 21 |
| Total Codeblocks | 231 |
| Total Admonitions | 23 |
| Total Mermaid Diagrams | 24 |
| Total Footnotes | 29 |

### Codeblock Types

| Type | Count | Percentage |
|------|-------|------------|
| 💻 Programming Languages | 66 | 28.6% |
| 📄 Plain Text | 56 | 24.2% |
| ⚡ Shell/Scripts | 44 | 19.0% |
| 📝 Markup Languages | 32 | 13.9% |
| 📊 Mermaid Diagrams | 24 | 10.4% |
| 📋 Data Formats | 9 | 3.9% |

### Admonition Types

| Type | Count | Percentage |
|------|-------|------------|
| ℹ️ Note | 14 | 60.9% |
| 💡 Tip | 6 | 26.1% |
| 🚫 Danger | 2 | 8.7% |
| ⚠️ Warning | 1 | 4.3% |

---

## Key Features

| Feature | Details |
|---------|---------|
| **Markdown docs** | YAML frontmatter, nested folders |
| **Syntax highlighting** | Shiki with 6 paperlike themes |
| **Sidebar** | Collapsible categories, auto-ordered |
| **Table of Contents** | Right sidebar with active tracking |
| **Navigation** | Prev/Next, breadcrumbs, edit link |
| **Themes** | 6 paperlike themes with CSS filter-based switching |
| **MathJax** | Inline `$E=mc^2$` and display `$$...$$` |
| **Mermaid diagrams** | Auto-rendered with loading states |
| **Admonitions** | `:::note`, `:::tip`, `:::warning`, `:::danger` |
| **Responsive** | Mobile sidebar, collapsible TOC |
| **Accessibility** | Semantic HTML, keyboard navigation |
| **Validation** | Strict codeblock and footnote validation |
| **Zero runtime APIs** | All content in the JS bundle |

---

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

---

## Next Steps

- Read the [Project Overview](/docs/getting-started/project-overview) for architecture details
- Explore the [Build System](/docs/guides/build-system) guide to understand the pipeline
- Check the [CLI Reference](/docs/guides/cli-reference) for all available commands
- Review the [Deployment](/docs/guides/deployment) guide for production builds

---

## Community

- **GitHub**: [Source code and issues](https://github.com/your-org/docts)
- **Contributing**: See [Contributing Guide](https://github.com/your-org/docts/blob/main/CONTRIBUTING.md)
- **License**: [MIT License](https://github.com/your-org/docts/blob/main/LICENSE)

---

Happy documenting! 📝✨
