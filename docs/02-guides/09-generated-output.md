---
title: Generated Output
description: Structure and format of the auto-generated TypeScript files
sidebar_label: Generated Files
sidebar_position: 11
---

# Generated Output

:::note Generated Data Purpose
The generated TypeScript files make content available to the React app without any network requests. This is central to the "Zero Runtime APIs" principle.
:::

When `npm run build:docs` runs, it produces TypeScript files in `src/generated/`:

```text:desc=Directory structure of auto-generated TypeScript files in src/generated
src/generated/
├── index.ts           # Barrel: imports clipboard.ts, re-exports sidebarData, allDocs, types
├── sidebar.ts         # sidebarData: SidebarItem[] (tree of docs + categories)
├── types.ts           # DocEntry interface
├── clipboard.ts       # window.copyCode() global function
└── docs/
    ├── index.ts       # Imports all per-doc files, exports allDocs: DocEntry[]
    └── *.ts           # One file per doc (e.g., congratulations.ts)
```

## DocEntry Interface

```typescript:desc=TypeScript interface defining the shape of a generated document entry with metadata, content, and navigation data
interface DocEntry {
  id: string;                    // Unique identifier (filename-based)
  slug: string;                  // URL-friendly path
  title: string;                 // Document title
  sidebar_label: string;         // Text shown in sidebar
  sidebar_position?: number;     // Sort order (lower = first)
  category?: string;             // Parent category (folder name)
  description: string;           // SEO description
  content: string;               // Pre-rendered HTML content
  toc: TocItem[];               // Table of contents items
  section: 'docs';              // Content section (always 'docs')
  metadata?: Record<string, any>; // Arbitrary frontmatter fields
  ast?: Token[];                // Markdown AST (for debug viewer)
}
```

## Per-Doc File Format

Example: `src/generated/docs/congratulations.ts`

```typescript:desc=Example of a generated per-doc TypeScript file exporting a single DocEntry with all metadata and HTML content
import type { DocEntry } from '../types';

export const congratulations: DocEntry = {
  id: 'congratulations',
  slug: 'congratulations',
  title: 'Project Overview',
  sidebar_label: 'Overview',
  sidebar_position: 1,
  category: '',
  description: 'Comprehensive overview of the architecture...',
  content: '<h1>Project Overview</h1><p>A Docusaurus-identical...</p>',
  toc: [
    { value: 'Architecture Principles', id: 'architecture-principles', level: 2 },
    { value: 'Key Dependencies', id: 'key-dependencies', level: 2 },
  ],
  section: 'docs',
  metadata: {},
};
```

## Sidebar Data Structure

```typescript:desc=SidebarItem union type and example sidebarData export showing doc and category item shapes
type SidebarItem = 
  | { type: 'doc'; id: string; label: string; slug: string; category?: string }
  | { type: 'category'; label: string; link?: { type: 'doc'; id: string }; items: SidebarItem[] };

export const sidebarData: SidebarItem[] = [
  // Uncategorized docs first
  { type: 'doc', id: 'congratulations', label: 'Overview', slug: 'congratulations' },
  
  // Categories
  {
    type: 'category',
    label: 'Guides',
    link: { type: 'doc', id: 'guides/build-system' },
    items: [
      { type: 'doc', id: 'guides/build-system', label: 'Build System', slug: 'guides/build-system', category: 'guides' },
      // ... more docs
    ],
  },
];
```

## All Docs Array

`src/generated/docs/index.ts` imports all per-doc files and exports:

```typescript:desc=All docs array combining all per-doc entries into a single exportable list
export const allDocs: DocEntry[] = [
  congratulations,
  directoryStructure,
  guidesBuildSystem,
  // ... all other docs
];
```

## Barrel Export

`src/generated/index.ts` re-exports everything:

```typescript:desc=Barrel export file that re-exports sidebarData, DocEntry type, and allDocs from submodules
export { sidebarData } from './sidebar';
export type { DocEntry } from './types';
export { allDocs } from './docs';
export type * from './types';
```

## Consumption

```mermaid:desc=Sequence diagram showing how the React app consumes generated TypeScript data: frontend imports allDocs from generated/index.ts, App calls allDocs.find() with currentSlug to lookup the document, then DocViewer renders the content HTML.
sequenceDiagram
    participant Frontend as frontend.tsx
    participant App as App.tsx
    participant Docs as "allDocs\nGenerated data"
    participant Lookup as allDocs.find()
    participant Viewer as DocViewer
    participant Browser as Browser

    Frontend->>Docs: Import allDocs constant
    Docs-->>Frontend: allDocs: DocEntry[]

    App->>Lookup: find(doc => doc.slug === slug)
    Lookup-->>App: matched DocEntry

    App->>Viewer: Render with content
    Viewer->>Browser: dangerouslySetInnerHTML
    Browser-->>Viewer: Display HTML + Mermaid + Math

    Note over Frontend,Browser: "All data available at compile time\nNo network requests needed"
```

The React app imports these as constants:

```typescript:desc=Example of importing generated data into a React component for synchronous doc lookup
import { allDocs, sidebarData } from './generated';

// No fetch(), no API calls — data is available immediately
const doc = allDocs.find(d => d.slug === currentSlug);
```

## Build Triggers

Regenerated when:
- Any `.md` file in `docs/` changes
- Frontmatter is modified
- Markdown content changes
- Plugin behavior changes

Not regenerated on:
- React code changes
- CSS changes
- Only `rspack build` runs (faster)
