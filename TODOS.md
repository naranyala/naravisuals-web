# Build System Compatibility & Migration Tracker

This document tracks the feature parity between the legacy **TypeScript (Bun)** scripts and the new **Rust (scripts-rs)** build engine.

## Compatibility Matrix

| Feature | TypeScript (Bun) | Rust (scripts-rs) | Notes |
| :--- | :---: | :---: | :--- |
| **Markdown Parsing** | ✅ (marked) | ✅ (pulldown-cmark) | Different parsers may have slight rendering differences. |
| **Syntax Highlighting** | ✅ (Shiki) | ⚠️ (Syntect) | Shiki provides better VS-quality themes. |
| **Admonitions** | ✅ Full | ⚠️ Basic | Rust implementation uses regex; doesn't handle nested markdown well. |
| **Mermaid Diagrams** | ✅ | ❌ | High priority for Rust migration. |
| **MathJax (LaTeX)** | ✅ | ❌ | Needed for technical documentation. |
| **Unified Reporting** | ✅ | ❌ | Rust still uses legacy diagnostic formatting. |
| **Link Validation** | ✅ | ✅ | Both check internal `/docs/` and `/blog/` links. |
| **Slugs Validation** | ✅ | ✅ | Both prevent duplicate URL paths. |
| **Codeblock Descriptions** | ✅ | ✅ | Mandatory `:desc=` attribute enforcement. |
| **SEO Generation** | ✅ | ✅ | Sitemap and robots.txt generation. |
| **Dev Server (HMR)** | ✅ | ⚠️ | Rust CLI proxies to `rspack serve`. |

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

## Compiler Abstraction & Refinement (Modernization)

These tasks focus on evolving the current modular script into a professional-grade **Compiler Engine** to ensure long-term maintainability and performance.

### 🏗️ Core Architecture
- [ ] **Stateful Compiler Engine**: Refactor the pipeline into a `MarkdownCompiler` class that maintains a unified `CompilationContext`.
- [ ] **Middleware Lifecycle**: Implement a formalized middleware pattern with specific hooks (`onParse`, `onRender`, `onGenerate`) to replace simple pre/post-processing.
- [ ] **Virtual File System (VFS)**: Transition to an in-memory representation of docs (`CompilationUnit`) to facilitate easier cross-document analysis.

### ⚡ Performance & Scalability
- [ ] **Incremental Build Engine**: Implement hash-based change detection to skip processing for unchanged markdown files.
- [ ] **Async Parallelization**: Fully utilize worker threads or async pools for concurrent file processing in the TS pipeline.

### 🛡️ Quality & Robustness
- [ ] **Stateful Renderer**: Encapsulate the `marked` renderer instance within a per-file scope to prevent ID leakage (e.g., duplicated anchor suffixes).
- [ ] **Unified Schema Validation**: Move from heuristics to a strict schema-based validation for frontmatter and code block metadata.
- [ ] **Source Protection (Expanded)**: Extend the `data-source` protection mechanism to other complex blocks beyond Mermaid (e.g., MathJax, custom Timeline visuals).

## Known Discrepancies
- **HTML Output**: `marked` and `pulldown-cmark` generate slightly different HTML structures for complex elements like tables.
- **Diagnostics**: The Rust engine doesn't currently report line numbers for all error types as accurately as the TS validators.
