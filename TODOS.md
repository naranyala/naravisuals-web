# Build System Compatibility & Migration Tracker

This document tracks the feature parity between the legacy **TypeScript (Bun)** scripts and the new **Rust (scripts-rs)** build engine, as well as the overall architectural evolution of the documentation platform.

## Compatibility Matrix

| Feature | TypeScript (Bun) | Rust (scripts-rs) | Notes |
| :--- | :---: | :---: | :--- |
| **Markdown Parsing** | ✅ (marked) | ✅ (pulldown-cmark) | Different parsers may have slight rendering differences. |
| **Syntax Highlighting** | ✅ (Shiki) | ⚠️ (Syntect) | Shiki provides better VS-quality themes. |
| **Admonitions** | ✅ Full | ⚠️ Basic | Rust implementation uses regex; doesn't handle nested markdown well. |
| **Mermaid Diagrams** | ✅ (v11) | ❌ | High priority for Rust migration. |
| **MathJax (LaTeX)** | ✅ | ❌ | Needed for technical documentation. |
| **Unified Reporting** | ✅ | ❌ | Rust still uses legacy diagnostic formatting. |
| **Link Validation** | ✅ | ✅ | Both check internal `/docs/` and `/blog/` links. |
| **Slugs Validation** | ✅ | ✅ | Both prevent duplicate URL paths. |
| **Codeblock Descriptions** | ✅ | ✅ | Mandatory `:desc=` attribute enforcement. |
| **SEO Generation** | ✅ | ✅ | Sitemap and robots.txt generation. |
| **Dev Server (HMR)** | ✅ | ⚠️ | Rust CLI proxies to `rspack serve`. |

---

## Migration TODOs

### Phase 1: Feature Parity (High Priority)
- [ ] **Mermaid Plugin**: Implement Mermaid block detection and wrapper generation in Rust.
- [ ] **MathJax Plugin**: Implement math extraction/protection logic in Rust.
- [ ] **Advanced Admonitions**: Move from regex to token-based admonition parsing in Rust.
- [ ] **Unified Reporting**: Implement `ReportGenerator` logic in Rust to match the new TS format.

### Phase 2: Performance & DX (Medium Priority)
- [ ] **Shiki Integration**: Explore using Shiki (via bindings) or improving Syntect output in Rust.
- [ ] **Parallel Processing**: Utilize Rust's `rayon` for multi-threaded markdown transformation.
- [ ] **Watcher Implementation**: Native Rust file watcher to replace Bun-based dev loop.

### Phase 3: Primary Switch (Low Priority)
- [ ] **Default to Rust**: Change the default `bun run build` to use the Rust engine.
- [ ] **Retire Bun Scripts**: Archive `.mts` scripts once Rust engine is 100% compatible.

---

## Build Pipeline Modernization (TS - COMPLETED)

The TypeScript pipeline has been evolved into a professional-grade **Compiler Engine** to ensure maintainability and performance.

### 🏗️ Core Architecture (DONE)
- [x] **Stateful Compiler Engine**: Implemented `DocumentationCompiler` in `scripts/compiler/Engine.ts`.
- [x] **Middleware Lifecycle**: Formalized middleware pattern with hooks (`onIngest`, `onPreParse`, `onTransform`, `onPostProcess`, `onAssemble`).
- [x] **Virtual File System (VFS)**: Implemented in-memory representation via `CompilationUnit` to facilitate cross-document analysis.
- [x] **Stateful Renderer**: Encapsulated `marked` renderer in `MarkdownRenderer.ts` to prevent ID leakage (duplicated anchors).

### ⚡ Mermaid v11 Integration (DONE)
- [x] **Smart Header Correction**: Auto-prefixing of diagram types and default directions (e.g., `flowchart TD`).
- [x] **Deep Validation Middleware**: Implemented `mermaidDeepValidator` to catch syntax errors during the build.
- [x] **Frontend Post-Render Validation**: React component now detects internal Mermaid error SVGs and provides a "Syntax Error" UI instead of a blank space.
- [x] **CSS Stylization Reset**: Cleaned up legacy `!important` overrides to allow Mermaid's own theme engine to work for complex types (mindmaps, quadrants).

---

## ⚡ Post-Migration & Optimization (TS & Rust)

### Performance & Scalability
- [ ] **Incremental Build Engine**: Implement hash-based change detection in `CompilationUnit` to skip processing for unchanged files.
- [ ] **Async Parallelization**: Transition from sequential processing to `Promise.all` pools in `DocumentationCompiler.compile()`.
- [ ] **JSDOM Performance**: Evaluate JSDOM overhead for huge documentation sets; consider simpler string parsing for basic post-processing.

### Quality & Robustness
- [ ] **Unified Schema Validation**: Move from heuristics to a strict schema-based validation for frontmatter (using Zod or similar).
- [ ] **AST-Based Search**: Leverage the generated `ast` in `DocEntry` for deeper cross-linking and full-text search indexing.
- [ ] **Global CSS Audit**: Review all shared styles for potential collisions with third-party components (MathJax/Mermaid).

---

## Known Discrepancies & Potential Debt

### ⚠️ Technical Debt
- **CSS Over-Specificity**: Some styles in `mermaid.css` still use `!important` which might interfere with user-defined Mermaid themes via directives.
- **Renderer State**: The `MarkdownRenderer` resets `seenIds` per-file, but doesn't handle global cross-document anchor uniqueness yet.

### 🐞 Potential Bugs
- **Mermaid v11 Measurement**: Some diagrams might collapse in hidden tabs or accordions due to `getBoundingClientRect()` limitations; consider a `ResizeObserver` or `IntersectionObserver` re-render.
- **Deep Nesting**: Nested subgraphs in flowcharts occasionally corrupt the generated SVG layout if headers are not perfectly aligned.
- **Markdown Encoding**: Double-escaping of HTML entities in code blocks can still occur if multiple plugins attempt to escape the same text.
