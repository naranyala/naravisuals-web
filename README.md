# 🌌 Naravisuals Web (docts)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Runtime-Bun-black?logo=bun)](https://bun.sh)
[![Rust](https://img.shields.io/badge/Engine-Rust-orange?logo=rust)](https://www.rust-lang.org/)
[![React](https://img.shields.io/badge/Frontend-React_19-blue?logo=react)](https://react.dev/)
[![Rspack](https://img.shields.io/badge/Bundler-Rspack-brightgreen?logo=webpack)](https://rspack.dev/)

**Naravisuals Web** is a high-performance, developer-centric Static Site Generator (SSG) engineered for technical documentation. Unlike traditional SSGs that produce static HTML, Naravisuals Web transforms Markdown into a **type-safe TypeScript "database"**, which is then consumed by a modern React 19 SPA.

---

## 🚀 The Core Philosophy: "Docs as Data"

Most SSGs treat documentation as a series of HTML pages. Naravisuals Web treats documentation as **structured data**. 

The build engine parses Markdown and generates a set of TypeScript files in `src/generated/`. This allows the frontend to:
- Enjoy full type safety for all document metadata and content.
- Implement complex client-side features (like a global AST viewer or advanced search) without expensive API calls.
- Maintain near-instant page transitions through a React SPA architecture.

---

## 🛠️ Technical Architecture

### 1. The Hybrid Build Pipeline
The project employs a dual-engine approach to balance flexibility and speed.

#### 🟦 TypeScript Engine (Bun)
The primary engine located in `scripts/`, designed for rapid iteration and easy plugin development.
- **Orchestration**: The `DocumentationCompiler` manages the full lifecycle.
- **The Pipeline**:
    1. **Ingestion**: Recursively scans `docs/` and `blog/` for Markdown files.
    2. **Preprocessing**: 
       - Frontmatter extraction and metadata construction.
       - `onPreParse` middleware for raw content modification.
    3. **Transformation**: 
       - Lexing via `marked.Lexer` to create an AST.
       - `onTransform` middleware to manipulate tokens.
       - HTML rendering.
       - `onPostProcess` middleware for final HTML adjustments (e.g., Mermaid.js processing).
    4. **Global Assembly**: `onAssemble` middleware for cross-document analysis (e.g., link validation).
    5. **Artifact Generation**: 
       - Validates the final `DocEntry` against a **TypeBox** schema.
       - Writes content as TS constants in `src/generated/`.
       - Generates SEO assets (`sitemap.xml`, `robots.txt`).

#### 🟧 Rust Engine (`scripts-rs`)
A high-performance implementation of the compiler logic written in Rust, intended for massive documentation sets and optimized CI/CD pipelines.

### 2. The Frontend (React 19)
A sophisticated SPA that renders the generated data.

#### 💉 Dependency Injection (DI) Container
To maintain a clean separation between UI and browser APIs, the frontend uses a **Service Container** (`src/services/container.ts`).
- **Abstracted Services**: `IStorageService`, `IRouterService`, `IDomService`, `IThemeService`, and `ISidebarService`.
- **Benefit**: Services can be swapped effortlessly for testing or different environment implementations without touching the React components.

#### ✨ Key Features
- **AST Viewer**: A specialized tool to inspect the parsed structure of documentation.
- **Intelligence-Enhanced Mermaid**: Build-time validation and auto-correction for Mermaid.js v11 diagrams.
- **Visual Excellence**: Shiki for VS Code-grade syntax highlighting and MathJax for LaTeX precision.
- **Print-Ready**: Dedicated CSS for professional PDF exports.

---

## 🧩 Extension System

Extend the build process using the **Stateful Middleware Pipeline**. You can hook into any of these stages:

| Hook | Purpose |
| :--- | :--- |
| `onIngest` | Filter or modify files as they are discovered. |
| `onPreParse` | Modify raw Markdown before the lexer runs. |
| `onTransform` | Manipulate the Token AST before HTML rendering. |
| `onPostProcess` | Transform the final HTML output. |
| `onAssemble` | Perform global checks (e.g., validating all internal links). |

---

## 📂 Project Structure

```text
├── docs/             # Markdown source files (the source of truth)
├── scripts/          # TS Build Engine (The "Compiler")
│   ├── compiler/     # Engine, Middleware, and Container logic
│   ├── pipeline/     # Scanner, Renderer, and Generator utilities
│   └── plugins/      # Validation and Transformation plugins
├── scripts-rs/       # Rust-based High-Performance Engine
├── src/              # React 19 Frontend Application
│   ├── core/         # Global State, Error Boundaries, and DI
│   ├── features/     # Feature-sliced components (Search, AST, Docs)
│   ├── generated/    # The TS "Database" produced by the build engine
│   └── shared/       # UI components and shared schemas
└── tests/            # Integration and Unit tests for both engine and UI
```

---

## 🛠️ Quick Start

### 1. Installation
```bash
bun install
```

### 2. Development
```bash
docts dev
```

### 3. Production Build
```bash
# Use the flexible TypeScript engine
docts build

# Use the blazing-fast Rust engine
docts build --rust
```

---

## 🤝 Contributing

1. Check [TODOS.md](./TODOS.md) for the roadmap.
2. Ensure `bun run lint` and `bun run test` pass.
3. Submit a PR!

## 📜 License
MIT © [Naranyala](https://github.com/naranyala)

---

## 🧐 Architectural Opinion & Critique

### The Good
- **Type-Safe Content**: The decision to generate a TypeScript "database" for documentation is brilliant. It brings the rigor of software engineering (type checking, IDE autocompletion) to content creation.
- **Frontend Decoupling**: The use of a Dependency Injection container for browser services is a masterclass in clean architecture, ensuring the UI is testable and agnostic of the environment.
- **Build-Time Rigor**: Moving validation (links, frontmatter, Mermaid syntax) to the build step prevents the "runtime surprise" common in many SSGs.

### The Critique
- **The "Double Engine" Burden**: Maintaining separate TS and Rust engines for the same logic is a significant maintenance overhead. Every new feature or bug fix must be implemented and tested twice.
- **Scale Bottleneck**: While generating TS files is great for small-to-medium sets, a massive documentation site (thousands of files) may lead to extremely large generated files, potentially slowing down the TS compiler and the IDE's language server.
- **Tight Coupling to Generated Structure**: The frontend is heavily dependent on the exact shape of the generated files. Any breaking change in the generator requires an immediate synchronized update in the frontend.

---

## 🗺️ Future Roadmap & Suggestions

### ⚡ Performance & Scalability
- **Code Splitting**: Implement dynamic imports for the generated documentation. Instead of one large `allDocs` array, load documents on demand to keep the initial bundle size small.
- **Incremental Builds**: Optimize the compiler to only re-process modified files and their dependencies, reducing build times for large sites.
- **Unified Engine (WASM)**: Replace the dual-engine approach by compiling the Rust engine to WASM and running it within the Bun environment. This provides Rust speed with TS flexibility.

### 🛠️ Developer Experience
- **Plugin Registry**: Transform the middleware pipeline into a formal plugin system where users can load third-party extensions via a configuration file.
- **Live Preview Server**: Implement a WebSocket-based live preview that renders Markdown changes in the browser instantly without a full rebuild.
- **Visual Schema Editor**: Create a small tool to visually edit the TypeBox schemas that define document metadata.

