# 🌌 Naravisuals Web (docts)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Runtime-Bun-black?logo=bun)](https://bun.sh)
[![Rust](https://img.shields.io/badge/Engine-Rust-orange?logo=rust)](https://www.rust-lang.org/)
[![React](https://img.shields.io/badge/Frontend-React_19-blue?logo=react)](https://react.dev/)
[![Rspack](https://img.shields.io/badge/Bundler-Rspack-brightgreen?logo=webpack)](https://rspack.dev/)

**Naravisuals Web** is a high-performance, developer-centric Static Site Generator (SSG) specifically engineered for technical documentation. It bridges the gap between raw Markdown simplicity and the power of a modern React SPA, powered by a unique hybrid Bun/Rust build engine.

---

## 🚀 Why Naravisuals Web?

Most documentation tools force a trade-off between build speed and feature richness. Naravisuals Web refuses that compromise.

- **Extreme Performance**: Built on **Rspack** (Rust-based bundler) and offering an optional **Native Rust Build Engine** for near-instant transformations of thousands of files.
- **Smart Visuals**: Deep, build-time integration with **Mermaid.js v11** and **MathJax**, featuring automated syntax "repair" and deep validation.
- **Developer-First DX**: Features a strict validation middleware that catches broken links, invalid frontmatter, and malformed code blocks *before* you deploy.
- **Modern React 19 SPA**: The output isn't just a set of HTML files; it's a fast, interactive React application with client-side navigation, full-text search, and a modular DI (Dependency Injection) container.

---

## ✨ Core Features

### 📊 Intelligence-Enhanced Mermaid
Naravisuals Web doesn't just "support" Mermaid; it understands it.
- **Auto-Correction**: Automatically injects missing directions (e.g., `TD`, `LR`) and merges headers for v11 compatibility.
- **Deep Validation**: A pre-flight build-time check catches syntax errors before they reach the browser.
- **Resilient Rendering**: If a diagram has warnings, the UI provides a "Syntax Error" fallback with direct source-viewing capabilities.

### 🛠️ The Hybrid Toolchain
Choose your weapon:
- **TypeScript (Bun)**: Maximum flexibility and easiest plugin development. Perfect for rapid iteration.
- **Rust (scripts-rs)**: Maximum performance. Best for massive documentation sets and CI/CD pipelines.

### 🎨 Visual & Technical Excellence
- **Syntax Highlighting**: Powered by **Shiki** for VS Code-quality themes (GitHub Dark/Light, Dracula, etc.).
- **Mathematical Precision**: Full LaTeX support via **MathJax** with SVG output for perfect scaling.
- **Print-Ready CSS**: Sophisticated `@media print` styles ensure your documentation looks like a professionally typeset book when exported to PDF.
- **SEO Optimized**: Automatic Sitemap, `robots.txt`, OpenGraph metadata, and JSON-LD structured data generation.

---

## 🛠️ Quick Start

### 1. Installation
Ensure you have [Bun](https://bun.sh) installed.

```bash
bun install
```

### 2. Development
Start the dev server with Hot Module Replacement (HMR).

```bash
docts dev
```

### 3. Production Build
Generate the optimized static assets.

```bash
# Using the flexible TypeScript engine
docts build

# Using the blazing-fast Rust engine (experimental)
docts build --rust
```

---

## 📂 Project Architecture

```text
├── docs/             # Your Markdown source files
├── scripts/          # The Stateful Compiler Engine (TS)
│   ├── compiler/     # Middleware hooks & Lifecycle management
│   ├── plugins/      # Mermaid, Math, Admonitions, etc.
│   └── validation/   # Diagnostic rules
├── scripts-rs/       # The High-Performance Rust engine
├── src/              # Frontend React 19 Application
│   ├── core/         # Error boundaries & DI Container
│   └── features/     # AST viewer, Metadata panels, Navigation
└── tests/            # Full-spectrum Test Suite
```

---

## 🧩 Extension System

Naravisuals Web uses a **Stateful Middleware Pipeline**. You can hook into any part of the compilation lifecycle:

1.  **onIngest**: Scan and filter raw files.
2.  **onPreParse**: Modify raw Markdown before it hits the parser.
3.  **onTransform**: Validate or manipulate the AST/Tokens.
4.  **onPostProcess**: Transform the generated HTML (e.g., our Mermaid processing).
5.  **onAssemble**: Perform global cross-document analysis (e.g., link validation).

---

## 🤝 Contributing

We welcome contributions! Whether it's a new Rust-based plugin or a frontend theme enhancement:
1.  Check the [TODOS.md](./TODOS.md) for the roadmap.
2.  Ensure `bun run lint` and `bun run test` pass.
3.  Submit a PR!

## 📜 License

MIT © [Naranyala](https://github.com/naranyala)
