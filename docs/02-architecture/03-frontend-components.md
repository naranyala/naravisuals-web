---
title: Frontend Components
description: React component hierarchy, key components, and how they work together
sidebar_label: Frontend Components
sidebar_position: 3
tags: ["react", "components", "architecture", "state-management"]
---

# Frontend Components

The project uses a highly decoupled, state-driven architecture. Components are built as modular units that consume shared services and reactive state stores.

## Component Hierarchy (v3)

```mermaid:desc=Modern component hierarchy with reactive stores and layout primitives.
flowchart TD
    A["frontend.tsx"] --> B["State Stores (React Context)"]
    B --> C["AppShell"]
    
    C --> D["GlobalSearch (Modal)"]
    C --> E["TopBar"]
    
    C --> F["ThreeColumnLayout"]
    F --> G["Sidebar (Navigation)"]
    F --> H["Main Content Column"]
    F --> I["ReferencePanel (Always Visible)"]
    
    H --> H1["DocViewer (HTML Only)"]
    H --> H2["ArticleFooter (Pagination + Stats)"]
    
    H1 --> J["useDocumentEnhancer (Mermaid/MathJax)"]
    
    style B fill:#e1f5fe
    style F fill:#f3e5f5
    style J fill:#f1f8e9
```

## Core Abstractions

### 1. AppShell
The root structural component. It manages global overlays (Search, Settings) and top-level layout constraints. By centralizing overlays, we ensure consistent keyboard handling (Escape) and prevent z-index conflicts.

### 2. ThreeColumnLayout
A specialized layout primitive designed for documentation. It manages the responsive transition between:
s*-   **Navigation Column**: Fixed/collapsible sidebar.
s*-   **Content Column**: Primary reading area.
s*-   **Reference Column**: Contains the Table of Contents and the unified Reference Panel.

### 3. Unified Reference Panel
Located in the right column, this panel is **always visible**. It uses a tabbed interface to provide quick access to:
s*-   **Metadata**: Frontmatter fields (tags, author, date).
s*-   **Footnotes**: Automated extraction of markdown references (`[^1]`).

[^1]: Footnotes are automatically parsed from the AST and rendered in the Reference Panel.

### 4. ArticleFooter
Consolidates two previously separate components into one clean "end-of-article" experience:
s*-   **Pagination**: Links to the next and previous documents in the sidebar order.
s*-   **Statistics**: Document-wide metrics (word count, diagram counts, estimated reading time).

## Reactive Integration

Instead of prop-drilling state, components subscribe to centralized **React Context** stores:
s*-   `useUIState()`: Controls panel visibility and responsive breakpoints.
s*-   `useDocState()`: Tracks the currently active document and its metadata.

## Document Enhancements

All late-binding enhancements are handled by the `useDocumentEnhancer` hook. This keeps the `DocViewer` component focused purely on rendering HTML, while the hook manages:
s*-   Asynchronous Mermaid rendering.
s*-   MathJax typesetting.
s*-   Interaction handlers (Zoom, Download).

## Entry Point: `frontend.tsx`

The application bootstraps in `/media/naranyala/Data/projects-remote/deepdive-tts-sst-playground/src/frontend.tsx`:

1. Sets up **goober** (CSS-in-JS) with React's `createElement`
2. Applies the initial theme from `localStorage` (defaults to `paperlike-dark-gray`)
3. Mounts the React tree inside `<StrictMode>` with `ErrorBoundary` and `ServicesProvider`
4. Configures React Refresh (HMR) for development

```tsx:desc=React app entry point with StrictMode and providers
root.render(
  <StrictMode>
    <ErrorBoundary>
      <ServicesProvider container={defaultContainer}>
        <App />
      </ServicesProvider>
    </ErrorBoundary>
  </StrictMode>
);
```

## App.tsx -- Root Component

`/media/naranyala/Data/projects-remote/deepdive-tts-sst-playground/src/App.tsx` is the orchestrator. It manages all top-level state and wires every UI panel together.

### State Management

The component holds these key pieces of state:

```tsx:desc=React component state management in App.tsx
const [sidebarVisible, setSidebarVisible] = useState(true);
const [tocVisible, setTocVisible] = useState(false);
const [mermaidLoading, setMermaidLoading] = useState(false);
const [isMobile, setIsMobile] = useState(/* viewport check */);
const [isTocMobileBreakpoint, setIsTocMobileBreakpoint] = useState(/* viewport check */);
const [settingsOpen, setSettingsOpen] = useState(false);
const [astOpen, setAstOpen] = useState(false);
```

### Navigation

The `navigate()` function updates the `docStore` and triggers a global event. The UI reactively updates based on these store changes:

```tsx:desc=Navigation function using DocStore.
const navigate = (slug: string) => {
  docStore.setSlug(slug);
  services.events.emit("nav:navigate", { target: slug, isMobile });
  // ... router logic
};
```

After every navigation commit, a `useEffect` scrolls to the top:

```tsx:desc=Scroll to top effect on navigation
useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}, [currentSlug]);
```

### Keyboard Shortcuts

Global shortcuts are registered via the `useKeyboardShortcut` hook (see [Keyboard Shortcut Hook](#keyboard-shortcut-hook) below):

| Shortcut | Action |
|---|---|
| `Cmd+B` / `Ctrl+B` | Toggle sidebar |
| `Cmd+T` / `Ctrl+T` | Toggle table of contents |
| `Escape` | Close TOC, then sidebar |

```tsx:desc=Keyboard shortcut registration in App.tsx
useKeyboardShortcut(() => setSidebarVisible((v) => !v), { key: "b", meta: true });
useKeyboardShortcut(
  () => { if (currentDoc?.toc.length) setTocVisible((v) => !v); },
  { key: "t", meta: true }
);
```

The Escape key handler is wired through `services.dom.onKeydown`:

```tsx:desc=Escape key handler for closing panels
useEffect(() => {
  const unsubscribe = services.dom.onKeydown((e) => {
    if (e.key === "Escape") {
      if (tocVisible) setTocVisible(false);
      else if (sidebarVisible) setSidebarVisible(false);
    }
  });
  return unsubscribe;
}, [services, tocVisible, sidebarVisible]);
```

### Mermaid Loading Indicator

The application listens for `mermaid:loading` events via the central event bus. This replaces inefficient polling and allows any component to trigger or observe loading states:

```tsx:desc=Mermaid loading state managed via event bus.
useEffect(() => {
  return services.events.on("mermaid:loading", (loading) => {
    setMermaidLoading(loading);
  });
}, [services.events]);
```

The indicator renders conditionally in the top bar:

```tsx:desc=Mermaid loading indicator rendering
{mermaidLoading && (
  <span className="mermaid-loading-indicator" title="Loading diagrams...">
    <span className="mermaid-spinner" />
  </span>
)}
```

### Settings Panel and Font Controls

The top bar includes buttons for print, settings (font size, line height, font family, code theme), and theme toggle. The settings panel renders theme swatches from the `THEMES` constant and font options from `FONTS`:

```tsx:desc=Theme configuration constant in App.tsx
const THEMES = [
  { id: "paperlike-white", label: "Paper White", bg: "#ffffff", accent: "#2563eb" },
  { id: "paperlike-gray", label: "Paper Gray", bg: "#e8e8e8", accent: "#5b8db8" },
  { id: "paperlike-sepia", label: "Paper Sepia", bg: "#f4ecd8", accent: "#8b6914" },
  { id: "paperlike-dark-gray", label: "Paper Dark", bg: "#2a2a2a", accent: "#7ba3cc" },
  { id: "navy", label: "Navy", bg: "#f0f4f8", accent: "#3b82f6" },
  { id: "dark-navy", label: "Dark Navy", bg: "#0f172a", accent: "#60a5fa" },
] as const;
```

### Print Functionality

The `printAllDocs` async function renders all Mermaid diagrams in the current view, clones the `.doc-content` DOM, strips interactive elements (copy buttons, zoom buttons, code headers), and opens a new window with a print-optimized HTML document using a serif font and paper-like styling.

### Mobile Sidebar Toggle

On mobile (viewport <= `config.mobileBreakpoint`, default 800px), the sidebar renders as an overlay and body scroll is locked:

```tsx:desc=Mobile sidebar overlay and body overflow handling
useEffect(() => {
  const isOverlayOpen = isMobile && sidebarVisible;
  services.dom.setBodyOverflow(isOverlayOpen ? "hidden" : "");
  return () => { services.dom.setBodyOverflow(""); };
}, [isMobile, sidebarVisible, services]);
```

### Theme Management

Uses the `useDocsTheme()` hook which unifies UI theme, code (Shiki) theme, font family, font size, and line height into a single hook. See [Theme Hook](#theme-hook) below.

### Sidebar Data and Prev/Next Navigation

The sidebar is loaded from generated data:

```tsx:desc=Sidebar data loading in App.tsx
const sidebar: SidebarItem[] = sidebarData;
```

Previous/next docs are computed by sorting all docs in sidebar order and finding the current index:

```tsx:desc=Previous/next document navigation computation
const sorted = getDocsInSidebarOrder();
const idx = sorted.findIndex((d) => d.slug === currentSlug || d.id === currentSlug);
const prevDoc = idx > 0 ? sorted[idx - 1] : null;
const nextDoc = idx < sorted.length - 1 ? sorted[idx + 1] : null;
```

## DocViewer.tsx -- Document Renderer

`src/DocViewer.tsx` renders the HTML content produced by the [Markdown Engine](/docs/02-architecture/04-markdown-engine) and then asynchronously enhances it with Mermaid diagrams and MathJax math.

### Rendering Pipeline

```mermaid:desc=Sequence diagram showing the rendering pipeline from React to Mermaid and MathJax
sequenceDiagram
    participant React as React (useEffect)
    participant DOM as DOM (dangerouslySetInnerHTML)
    participant Mermaid as renderMermaid()
    participant MathJax as renderMath()
    participant Zoom as setupZoomHandlers()
    participant Download as setupDownloadHandlers()

    React-->>DOM: Set innerHTML
    React-->>Mermaid: await renderMermaid(ref)
    Mermaid-->>Mermaid: Dynamically import("mermaid")
    Mermaid-->>Mermaid: mermaid.render() for each diagram
    Mermaid-->>React: Diagrams rendered as SVG
    React-->>MathJax: renderMath(ref)
    MathJax-->>MathJax: typesetPromise([container])
    React-->>Zoom: setupZoomHandlers()
    React-->>Download: setupDownloadHandlers()
```

### Mermaid Rendering

The `renderMermaid()` function:

1. Sets `window.__mermaidLoading__ = true`
2. Dynamically imports the `mermaid` module (lazy-loaded)
3. Initializes with `theme: "neutral"`, `securityLevel: "loose"`
4. Iterates over all `.mermaid-diagram` elements
5. Calls `mermaid.render(uniqueId, diagramSource)` for each
6. On success: injects SVG, styles text/shapes for readability
7. On failure: shows error container with raw diagram source
8. Sets `window.__mermaidLoading__ = false` when done

### Mermaid Zoom and Fullscreen Overlay

Each diagram gets zoom and download buttons attached via event listeners:

- **Zoom button**: Opens a fullscreen overlay with the SVG
- **Zoom controls**: Zoom in/out/reset buttons, mouse wheel zoom, drag to pan, touch pinch-to-zoom
- **Close**: Escape key, close button, or click on overlay background

```tsx:desc=Mermaid fullscreen overlay HTML template
overlay.innerHTML = `
  <div class="mermaid-fullscreen-header">
    <span class="mermaid-fullscreen-title">Diagram</span>
    <div class="mermaid-fullscreen-controls">
      <button data-action="zoom-in">...</button>
      <button data-action="zoom-out">...</button>
      <button data-action="zoom-reset">...</button>
      <span class="mermaid-zoom-level">100%</span>
    </div>
    <button class="mermaid-fullscreen-close">Close</button>
  </div>
  <div class="mermaid-fullscreen-content">
    <div class="mermaid-fullscreen-viewport">
      <div class="mermaid-diagram-container">${svgEl.outerHTML}</div>
    </div>
  </div>
`;
```

Pan state tracks `scale`, `pointX`, `pointY` and applies a CSS transform:

```tsx:desc=Pan and zoom transform application
container.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
```

### Mermaid SVG Download

The download handler clones the SVG, serializes it with `XMLSerializer`, adds XML declaration, and triggers a download with a filename derived from the diagram description:

```tsx:desc=SVG download handler with serialization
const svgClone = svgEl.cloneNode(true) as SVGElement;
svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
const serializer = new XMLSerializer();
let svgString = serializer.serializeToString(svgClone);
svgString = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
const blob = new Blob([svgString], { type: "image/svg+xml" });
```

### MathJax Rendering

The `renderMath()` function:

1. Finds all `.math-inline` and `.math-display` elements
2. If MathJax is already loaded, calls `typesetPromise()` immediately
3. If not loaded, marks elements as `loading`, polls for up to 10 seconds
4. On MathJax load, calls `typesetPromise()` and marks elements as `rendered` or `error`

### TOC Tracking via IntersectionObserver

A second `useEffect` sets up an `IntersectionObserver` on all `h2` and `h3` headings. As headings enter the viewport (with `rootMargin: "0px 0px -80% 0px"`), it updates the URL hash:

```tsx:desc=IntersectionObserver for TOC heading tracking
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        if (id) {
          const hash = `#${id}`;
          history.replaceState(null, "", hash);
        }
      }
    }
  },
  { rootMargin: "0px 0px -80% 0px" }
);
```

The component renders content via `dangerouslySetInnerHTML`:

```tsx:desc=DocViewer content rendering with dangerouslySetInnerHTML
return <div ref={ref} className="doc-content" dangerouslySetInnerHTML={{ __html: html }} />;
```

## Sidebar.tsx -- Navigation Sidebar

`/media/naranyala/Data/projects-remote/deepdive-tts-sst-playground/src/Sidebar.tsx` renders the left navigation panel from `sidebarData` (generated at build time).

### Structure

Two sub-components handle the two sidebar item types:

- **`CategoryItem`**: Renders a collapsible category header and a sublist of doc links. Highlights the category header when any child is the active page.
- **`DocLink`**: Renders a single doc link (for uncategorized pages).

```tsx:desc=CategoryItem component implementation
function CategoryItem({ item, currentSlug, onNavigate }) {
  const hasActive = item.items.some(
    (child) => child.slug === currentSlug || child.id === currentSlug
  );
  return (
    <div className="sidebar-category">
      <button className={`sidebar-category-header ${hasActive ? "active" : ""}`} ...>
        <span className="sidebar-category-label">{item.label}</span>
      </button>
      <ul className="sidebar-sublist">
        {item.items.map((child) => (
          <li key={child.id} className="sidebar-item">
            <a href={`/docs/${child.slug}`} className={`sidebar-link ${...}`}>
              <span className="sidebar-link-label">{child.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## TableOfContents.tsx -- Right-Side TOC

`/media/naranyala/Data/projects-remote/deepdive-tts-sst-playground/src/TableOfContents.tsx` renders the "On this page" panel from the document's `toc` array (generated from headings during the build).

### Active Heading Tracking

Uses its own `IntersectionObserver` to detect which heading is currently in view and highlights the matching TOC item:

```tsx:desc=IntersectionObserver for active TOC heading tracking
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActiveHash(`#${entry.target.id}`);
      }
    },
    { rootMargin: "0px 0px -80% 0px" }
  );
  for (const item of items) {
    const el = document.getElementById(item.id);
    if (el) observer.observe(el);
  }
  return () => observer.disconnect();
}, [items]);
```

### Text Cleaning

The `cleanTOCText()` function strips Markdown formatting from TOC labels:

```tsx:desc=Text cleaning function for TOC labels
function cleanTOCText(raw: string): string {
  return raw
    .replace(/`([^`]+)`/g, "$1")       // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/__([^_]+)__/g, "$1")     // bold
    .replace(/~~([^~]+)~~/g, "$1")     // strikethrough
    .replace(/<[^>]+>/g, "");          // HTML tags
}
```

## Breadcrumbs.tsx

`/media/naranyala/Data/projects-remote/deepdive-tts-sst-playground/src/Breadcrumbs.tsx` renders a breadcrumb trail. Each item can be a link or plain text (the current page):

```tsx:desc=Breadcrumbs component implementation
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ul>
        <li className="breadcrumb-item"><a href="/">Docs</a></li>
        {items.map((item) => (
          <li key={item.label} className="breadcrumb-item">
            {item.href ? <a href={item.href}>{item.label}</a>
                       : <span className="breadcrumb-current">{item.label}</span>}
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

## MetadataPanel.tsx

`/media/naranyala/Data/projects-remote/deepdive-tts-sst-playground/src/MetadataPanel.tsx` renders arbitrary frontmatter metadata as a collapsible `<details>` panel. Array values (like tags) render as styled badges:

```tsx:desc=MetadataValue component for rendering metadata
function MetadataValue({ value }: { value: string | string[] }) {
  if (Array.isArray(value)) {
    return (
      <span className="metadata-tags">
        {value.map((v) => <span key={v} className="metadata-tag">{v}</span>)}
      </span>
    );
  }
  return <span className="metadata-value-text">{value}</span>;
}
```

## DocStatsFooter.tsx

`/media/naranyala/Data/projects-remote/deepdive-tts-sst-playground/src/DocStatsFooter.tsx` parses the rendered HTML content and displays document statistics:

- Word count, heading count, code blocks, Mermaid diagrams
- Admonition count broken down by type
- Links, images, tables, lists

Stats are computed via `useMemo` by creating a temporary `<div>`, setting `innerHTML`, and querying with `querySelectorAll`:

```tsx:desc=DocStatsFooter statistics computation
const stats = useMemo<DocStats | null>(() => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = contentHtml;
  const codeBlocks = tempDiv.querySelectorAll(".code-block, pre code").length;
  const mermaidDiagrams = tempDiv.querySelectorAll(".mermaid-diagram").length;
  // ... etc.
}, [contentHtml]);
```

## ArticleRefsPanel.tsx

`ArticleRefsPanel.tsx` extracts footnote references and their definitions from the raw AST tokens. It walks the token tree recursively:

```tsx:desc=Token tree walking for footnote extraction
function walkTokens(tokens: any[]) {
  for (const token of tokens) {
    if (token.text && typeof token.text === "string") {
      const refRegex = /\[\^([^\]]+)\]/g;
      // ... extract references
    }
    if (token.type === "paragraph" || token.type === "text") {
      const defRegex = /^\[\^([^\]]+)\]:\s*(.+)$/;
      // ... extract definitions
    }
    if (token.tokens) walkTokens(token.tokens);
    if (token.items) walkTokens(token.items);
  }
}
```

## ASTViewer.tsx

`/media/naranyala/Data/projects-remote/deepdive-tts-sst-playground/src/ASTViewer.tsx` displays the `marked` parser token tree as a collapsible tree structure for debugging. Uses utilities from `/src/ast-parser.ts`:

- `tokensToAST()` -- converts `Token[]` to `ASTTokenNode[]` tree
- `countNodes()` -- total node count
- `getUniqueTypes()` -- all distinct token types
- `getASTDepth()` -- maximum tree depth

The tree supports expand/collapse all, search by type, and shows metadata (heading depth, language, list order) on each node.

## ErrorBoundary.tsx

`/media/naranyala/Data/projects-remote/deepdive-tts-sst-playground/src/ErrorBoundary.tsx` is a class component using `getDerivedStateFromError` and `componentDidCatch`:

```tsx:desc=ErrorBoundary class component implementation
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, info: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ error, info });
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary] Caught error:", error);
    }
  }

  reset(): void {
    this.setState({ hasError: false, error: null, info: null });
  }
}
```

It wraps the entire app tree in `frontend.tsx`. Supports an optional `fallback` prop for custom error rendering.

## DocFooter.tsx

`/media/naranyala/Data/projects-remote/deepdive-tts-sst-playground/src/DocFooter.tsx` renders previous/next page navigation links:

```tsx:desc=DocFooter component implementation
export function DocFooter({ prevDoc, nextDoc, onNavigate }: DocFooterProps) {
  return (
    <footer className="doc-footer">
      <div className="pagination-nav">
        {prevDoc && <a className="pagination-link pagination-prev">...</a>}
        {nextDoc && <a className="pagination-link pagination-next">...</a>}
      </div>
    </footer>
  );
}
```

## Key Hooks

### useKeyboardShortcut

`/media/naranyala/Data/projects-remote/deepdive-tts-sst-playground/src/hooks/useKeyboardShortcut.ts` registers keyboard shortcuts with modifier key support:

```tsx:desc=useKeyboardShortcut hook implementation
export function useKeyboardShortcut(
  handler: () => void,
  { key, meta = false, alt = false, shift = false, preventDefault = true }: ShortcutOptions
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (meta && !(e.metaKey || e.ctrlKey)) return;
      // ... other modifiers
      handlerRef.current();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [key, meta, alt, shift, preventDefault]);
}
```

### Theme Hook

`/media/naranyala/Data/projects-remote/deepdive-tts-sst-playground/src/hooks/useDocsTheme.ts` unifies all theme and reading preferences:

```tsx:desc=DocsTheme interface definition
export interface DocsTheme {
  isDark: boolean;
  toggleTheme: () => void;
  codeTheme: ShikiCodeTheme;
  setCodeTheme: (theme: ShikiCodeTheme) => void;
  font: string;
  setFont: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  resetReadingPrefs: () => void;
}
```

Preferences are persisted to `localStorage` and applied as CSS custom properties on `document.documentElement`.

## Component Summary Table

| Component | File | Responsibility |
|---|---|---|
| `App` | `src/App.tsx` | Root orchestration: state, navigation, shortcuts, settings, print |
| `DocViewer` | `src/DocViewer.tsx` | HTML rendering, Mermaid, MathJax, TOC tracking |
| `Sidebar` | `src/Sidebar.tsx` | Left navigation from generated sidebar data |
| `TableOfContents` | `src/TableOfContents.tsx` | Right-side TOC with active heading tracking |
| `MetadataPanel` | `src/MetadataPanel.tsx` | Collapsible frontmatter metadata display |
| `DocStatsFooter` | `src/DocStatsFooter.tsx` | Document statistics (words, code, diagrams, etc.) |
| `ArticleRefsPanel` | `src/ArticleRefsPanel.tsx` | Footnote references and definitions from AST |
| `ASTViewer` | `src/ASTViewer.tsx` | Debug viewer for marked parser tokens |
| `ErrorBoundary` | `src/ErrorBoundary.tsx` | React error boundary for entire app tree |
| `DocFooter` | `src/DocFooter.tsx` | Previous/next page pagination links |

## Cross-References

- [Build Pipeline](/docs/02-architecture/01-build-pipeline) -- how markdown becomes the `allDocs` array consumed by `App.tsx`
- [Dependency Injection](/docs/02-architecture/02-dependency-injection) -- the 5 services (`IStorageService`, `IRouterService`, `IDomService`, `IThemeService`, `IAppConfig`) injected into every component
- [Markdown Engine](/docs/02-architecture/04-markdown-engine) -- how `marked`, Shiki, and plugins produce the HTML that `DocViewer` renders
