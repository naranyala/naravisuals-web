---
title: Component Architecture
description: React component hierarchy and key components
sidebar_label: Components
sidebar_position: 5
---

# Component Architecture

:::note Component Organization
The application uses a flat component structure in `src/` with clear separation between presentational and container components. All components receive data via props or React Context.
:::

## Component Hierarchy

```txt:desc=Complete React component tree showing App as root with all child components including sidebar, scroll-to-top, TOC, settings panel, mobile overlay, and AST viewer with their conditional rendering logic.
<App>
├── Settings Panel (overlay, conditional)
│   ├── Theme Grid (6 theme chips)
│   └── Font Grid (5 font chips)
│
├── Mobile Overlay (conditional, when isMobile && sidebarVisible)
│   └── <Sidebar>
│
├── Scroll-to-Top Bar (conditional, when scrollProgress > 0.02)
│   ├── Progress Bar (with fill width)
│   └── Mobile TOC Panel (conditional)
│       └── <TableOfContents>
│
├── Top Bar
│   ├── Left: Hamburger (mobile) + Site Title + Current Page
│   └── Right: Print Button + AST Viewer Button + Settings Button
│
└── <div class="doc-page-layout">
    ├── <nav class="sidebar"> (desktop, hidden on mobile via CSS)
    │   └── <Sidebar>
    │       ├── <CategoryItem> (for categories)
    │       │   ├── Category Header Button
    │       │   └── Sub-list of Doc Links
    │       └── <DocLink> (for top-level docs)
    │
    ├── <main class="main-content">
    │   ├── Mobile TOC Collapsible (conditional)
    │   │   └── <TableOfContents>
    │   ├── <MetadataPanel> (conditional, for arbitrary frontmatter)
    │   ├── <DocViewer> (renders HTML content + Mermaid + MathJax)
    │   └── <DocFooter>
    │       ├── Edit this page link
    │       └── Prev/Next Pagination
    │
    ├── AST Viewer Panel (conditional, when astOpen)
    │   └── <ASTViewer>
    │       ├── Stats Bar (token count, depth, unique types)
    │       ├── Controls (expand/collapse all, search)
    │       ├── Type Tags
    │       └── Tree (collapsible TreeNode hierarchy)
    │
    └── TOC Container (desktop, conditional when doc has TOC)
        └── <TableOfContents>
```

## Key Components

### App (`src/App.tsx`)

The root component that handles:
- Client-side routing via `history.pushState`
- Resolves current document from `allDocs` by slug
- Calculates prev/next docs based on sidebar order
- Manages all layout state (sidebar, TOC, settings, AST viewer)
- Responsive breakpoints (mobile sidebar, mobile TOC)
- Print mode (renders all docs in sidebar order)

**State Managed:**
```typescript:desc=Type annotation documenting the state variables managed by the App component, including panel visibility toggles, responsive breakpoint flags, current document slug, scroll progress tracking, and overlay panel states.
sidebarVisible, tocVisible        // Panel visibility
isMobile, isTocMobileBreakpoint   // Responsive state
currentSlug                       // Current document
scrollProgress, scrollPanelOpen   // Scroll-to-top bar
settingsOpen, astOpen             // Overlay panels
```

### Sidebar (`src/Sidebar.tsx`)

Renders the left navigation tree:
- Categories expand to show child docs
- Active doc is highlighted
- Collapsible on mobile (controlled by `App`)

### DocViewer (`src/DocViewer.tsx`)

Renders pre-built HTML via `dangerouslySetInnerHTML`:
- Triggers Mermaid diagram rendering (lazy-loaded) after mount
- Triggers MathJax typesetting after mount
- Uses IntersectionObserver to track active heading hash
- Handles rendering errors gracefully

### TableOfContents (`src/TableOfContents.tsx`)

Right sidebar TOC with:
- IntersectionObserver with `rootMargin: "0px 0px -80% 0px"` for active section detection
- Scrolls active item into view with offset
- Strips markdown formatting from heading text
- Mobile collapsible variant

### DocFooter (`src/DocFooter.tsx`)

- Prev/Next pagination links
- "Edit this page" link (uses `config.repoEditUrl`)

### ErrorBoundary (`src/ErrorBoundary.tsx`)

Class component using `getDerivedStateFromError` and `componentDidCatch`:
- Fallback UI with error message and stack trace
- "Try again" reset button

### ASTViewer (`src/ASTViewer.tsx`)

Debug tool showing the marked.js token AST:
- Stats: token count, tree depth, unique types
- Expand/collapse all controls
- Search by token type
- Collapsible tree view
