---
title: Mermaid.js Evolution & Compatibility
description: A comprehensive guide to Mermaid.js version history and syntax changes for documentation maintainers.
sidebar_label: Mermaid Evolution
sidebar_position: 6
tags: ["reference", "mermaid", "diagrams", "evolution"]
---

# Mermaid.js Evolution & Compatibility

Understanding the history and versioning of Mermaid.js is critical for maintaining a robust markdown-to-typescript compiler. This guide tracks major architectural shifts and syntax evolutions that impact how diagrams are rendered and validated.

## Version Roadmap

| Version | Key Focus | Primary Developer Impact |
| :--- | :--- | :--- |
| **v11.x** | Stability & Modernization | Improved rendering performance and new "Architecture" diagram types. |
| **v10.x** | The "Great Refactor" | **Breaking**: Switched to ESM and made `mermaid.render()` asynchronous. |
| **v9.x** | Security & Theming | Introduction of the "Neutral" theme and stricter security defaults. |
| **v8.x** | Core Expansion | Broad adoption of `flowchart` as the primary standard over `graph`. |

---

## Major Architectural Shifts

### 1. Asynchronous Rendering (v10.0+)
One of the most significant changes for documentation engines was the transition of the `render` function from synchronous to **asynchronous**.

s*-   **Before v10**: `mermaid.render('id', source)` returned an SVG string immediately.
s*-   **v10 & v11**: `await mermaid.render('id', source)` returns a Promise resolving to an object `{ svg, bindFunctions }`.
s*-   **Compiler Impact**: Your React components must use `useEffect` and `async/await` to handle the rendering lifecycle, and must manage "loading" states to prevent race conditions.

### 2. ESM & Module Loading
Starting with v10, Mermaid transitioned fully to **ES Modules**.
s*-   **Impact**: Dynamic `import("mermaid")` became the preferred way to load the library in SPAs, reducing initial bundle size but requiring careful handling of global state.

---

## Syntax Evolution: Flowchart vs. Graph

While `graph` and `flowchart` share similar syntax, they use different underlying rendering engines in modern Mermaid.

### The "Flowchart" (Modern Standard)
Introduced to address limitations in the original graph implementation.
s*-   **Subgraphs**: Much more robust support for nested subgraphs and cross-subgraph links.
s*-   **Styling**: Better support for CSS classes and inline styles.
s*-   **Markers**: Supports advanced arrow heads and bidirectional links.
s*-   **Direction**: Handles `TB` (Top to Bottom), `BT`, `LR`, `RL` with higher consistency.

### The "Graph" (Legacy)
Kept for backwards compatibility but missing several modern features.
s*-   **Limitations**: Frequent layout issues when mixing different node shapes with subgraphs.
s*-   **Validation**: Our build system now issues a **Warning** when `graph` is detected, encouraging authors to switch to `flowchart`.

---

## Critical Edge Cases for Compilers

When building a markdown-to-typescript compiler, these specific Mermaid behaviors must be mitigated:

### 1. ID Collisions
Mermaid generates internal IDs for SVG elements (gradients, markers). If multiple diagrams share an ID, or if the ID provided to `render()` starts with a number, the browser may fail to apply styles correctly.
s*-   **Solution**: Always prefix IDs with a string (e.g., `mermaid-chart-`) and include a unique hash or index.

### 2. Character Encoding
Characters like `>` in arrows or `"` in labels can be corrupted during the transformation from `.md` → `.html` → `.ts`.
s*-   **The Trap**: Markdown parsers often turn `-->` into `--&gt;`. If passed directly to Mermaid, it will fail to recognize the arrow.
s*-   **Mitigation**: Use a `data-source` attribute to store the "raw" unescaped notation in the generated HTML.

### 3. Global Auto-Rendering
If the global `mermaid.min.js` script is loaded, it may attempt to "auto-render" every div with the `.mermaid` class.
s*-   **The Conflict**: This often happens before React is ready, leading to "Unknown Diagram" errors when React tries to re-render the already-modified DOM.
s*-   **Fix**: Always initialize with `{ startOnLoad: false }` in your `index.html`.

---

## Related Guides
- [Build Pipeline](/docs/architecture/build-pipeline) — How our compiler handles Mermaid.
- [Validation System](/docs/architecture/markdown-engine) — Rules for Mermaid syntax checking.
