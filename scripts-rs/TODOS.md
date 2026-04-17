# 🦀 Rust-based Docs Builder: Feature Parity & TODOs

This document tracks the progress of migrating the documentation build pipeline from TypeScript (`scripts/build-docs.mts`) to Rust (`scripts-rs`).

## 📊 Feature Comparison Matrix

| Feature | TypeScript (Original) | Rust (Current) | Status | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **File Scanning** | ✅ | ✅ | 🟢 | `WalkDir` used in Rust. |
| **Frontmatter Parsing** | ✅ | ✅ | 🟢 | Basic key-value parsing implemented. |
| **Slug Generation** | ✅ | ✅ | 🟡 | Rust needs Docusaurus-compatible slugification (C++, C#). |
| **Internal Link Validation** | ✅ | ✅ | 🟢 | Deferred validation implemented. |
| **Code Block Description Lint** | ✅ | ✅ | 🟢 | Warns if `:desc=` is missing. |
| **HTML Rendering** | ✅ (Advanced) | ✅ (Basic) | 🔴 | Rust uses `pulldown-cmark`; TS uses `marked` + `shiki`. |
| **Custom Code Block Wrapping** | ✅ | ❌ | 🔴 | TS adds titles, labels, and copy/zoom buttons. |
| **TOC Extraction** | ✅ | ✅ | 🟢 | Implemented via Regex. |
| **Sidebar Generation** | ✅ (Complex) | ✅ (Implemented) | 🟢 | Handles numeric prefixes, welcome page, and label formatting. |
| **Plugin System** | ✅ (Implemented) | ✅ (Partial) | 🟡 | Admonitions plugin implemented; Math and Mermaid pending. |
| **Sitemap Generation** | ✅ | ✅ | 🟢 | Implemented with placeholder URL. |
| **Robots.txt Generation** | ✅ | ✅ | 🟢 | Implemented with placeholder URL. |
| **Admonition Analysis** | ✅ | ❌ | 🔴 | Stats on :::tip, :::warning, etc. |
| **Content Enrichment Analysis** | ✅ | ❌ | 🔴 | Metrics for code blocks, mermaid, footnotes, etc. |
| **AST Export** | ✅ | ❌ | 🔴 | TS exports `ast` tokens for debugging. |

---

## 🚀 TODO List

### 🔴 High Priority (Core Parity)
- [ ] **Implement Plugin Logic**:
    - [ ] Math plugin (KaTeX/MathJax support).
    - [ ] Mermaid plugin.
- [ ] **Advanced HTML Rendering**:
    - [ ] Implement custom code block wrapping (titles, labels, copy buttons).
    - [ ] Integrate a syntax highlighter (equivalent to `shiki`) or export metadata for client-side highlighting.
- [ ] **Docusaurus-Compatible Slugs**:
    - [ ] Update slugifier to handle special cases like `C++` $\to$ `c-plus-plus` and `C#` $\to$ `c-sharp`.

### 🟡 Medium Priority (SEO & UX)
- [ ] **SEO Assets**:
    - [ ] Replace hardcoded `site_url` with configuration/env variable.
- [ ] **Enhanced Sidebar**:
    - [ ] Further refine ordering logic if needed.

### 🔵 Low Priority (Analysis & Tooling)
- [ ] **Content Analytics**:
    - [ ] Implement `analyzeAdmonitions` for summary reports.
    - [ ] Implement `analyzeContent` for enrichment scores.
- [ ] **AST Export**:
    - [ ] Export `pulldown-cmark` event stream as JSON for the `ast` field in `DocEntry`.
- [ ] **JSON Diagnostics**:
    - [ ] Implement `Diagnostics::to_json()` to export errors to `diagnostics.json`.

---

## 🛠 Technical Notes for Implementation

- **Regex Optimization**: Ensure all regexes used in `build_docs` and `diagnostics` are compiled once (e.g., using `once_cell` or `lazy_static` / `std::sync::OnceLock`).
- **Performance**: The main advantage of Rust here is speed. Use `rayon` for parallel file scanning and processing if the docs grow significantly.
- **HTML generation**: Consider using a more flexible HTML builder if `pulldown-cmark`'s output needs deeper modification.
