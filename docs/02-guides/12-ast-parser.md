---
title: AST Parser Utilities
description: How marked tokens are converted into a displayable tree structure for the AST Viewer
sidebar_label: AST Parser
sidebar_position: 14
---

# AST Parser Utilities

:::danger AST Viewer is Debug-Only
The AST Viewer (`src/ASTViewer.tsx`) is a debugging tool. The AST data is only available when running the AST Viewer directly — it's not generated during normal builds.
:::

The AST (Abstract Syntax Tree) parser converts `marked`'s flat token array into a hierarchical tree structure for display in the AST Viewer debug tool. This document explains how the parser works and what each utility function does.

---

## The Problem: Marked's Token Structure

The `marked` library produces a **flat array of `Token` objects**:

```typescript:desc=Example showing how marked's Lexer.lex produces a flat token array from markdown input
import { Lexer, type Token } from "marked";

const tokens = Lexer.lex("# Hello\n\nThis is **bold** text.");
// tokens = [
//   { type: "heading", depth: 1, text: "Hello", tokens: [...] },
//   { type: "paragraph", text: "This is ", tokens: [...], ... },
//   { type: "strong", text: "bold", tokens: [...] },
// ]
```

Some tokens have nested `tokens` arrays (e.g., a paragraph containing inline tokens), while others have `items` (lists) or `rows` (tables). The AST parser **recursively flattens these into a uniform tree** for debugging.

---

## Core Types

### ExtendedToken

```typescript:desc=ExtendedToken type that adds optional fields (tokens, items, header, rows, ordered, start, loose) not exposed by marked's base Token type
type ExtendedToken = Token & {
  tokens?: Token[];
  items?: Token[];
  header?: Token[];
  rows?: Token[][];
  ordered?: boolean;
  start?: number;
  loose?: boolean;
};
```

`marked`'s base `Token` type doesn't expose all the optional fields that specific token types use (like `list.tokens`, `list.items`, `table.header`). `ExtendedToken` adds these so the parser can access them without type errors.

### ASTTokenNode

```typescript:desc=Normalized tree node interface representing a single AST node with type, metadata fields (raw, text, depth, lang), and optional children array
interface ASTTokenNode {
  type: string;
  raw?: string;
  text?: string;
  depth?: number;
  lang?: string;
  ordered?: boolean;
  start?: number;
  loose?: boolean;
  children?: ASTTokenNode[];
}
```

The normalized tree node. Every token is converted to this shape, regardless of its original type. Fields like `depth` (for headings), `lang` (for code blocks), and `children` (for nested tokens) are preserved.

---

## Core Function: tokensToAST

**Signature:** `function tokensToAST(tokens: Token[]): ASTTokenNode[]`

Converts a flat `Token[]` array into a hierarchical `ASTTokenNode[]` tree.

### How It Works

```typescript:desc=tokensToAST entry point that maps over the token array and delegates each token to tokenToNode for recursive conversion
export function tokensToAST(tokens: Token[]): ASTTokenNode[] {
  return tokens.map(tokenToNode);
}
```

The heavy lifting is done by `tokenToNode()`, which recursively processes each token:

```typescript:desc=Recursive function that converts a single marked Token into an ASTTokenNode. It extracts common fields (raw, text, depth, lang), then recursively processes nested tokens, list items, table headers, and table rows into the children array.
function tokenToNode(token: Token): ASTTokenNode {
  const ext = token as ExtendedToken;
  const node: ASTTokenNode = { type: token.type };

  // Add relevant fields
  if (ext.raw) node.raw = ext.raw;
  if (ext.text) node.text = ext.text;
  if (ext.depth !== undefined) node.depth = ext.depth;
  if (ext.lang) node.lang = ext.lang;
  if (ext.ordered !== undefined) node.ordered = ext.ordered;
  if (ext.start !== undefined) node.start = ext.start;
  if (ext.loose !== undefined) node.loose = ext.loose;

  // Recursively process nested tokens
  if (ext.tokens) {
    node.children = ext.tokens.map(tokenToNode);
  }
  if (ext.items) {
    node.children = ext.items
      .filter((item): item is Tokens.ListItem => typeof item !== "string" && "text" in item)
      .map((item) => tokenToNode(item as unknown as Token));
  }
  if (ext.header) {
    node.children = ext.header.map((cell) => tokenToNode(cell as unknown as Token));
  }
  if (ext.rows) {
    node.children = ext.rows.map((row) => ({
      type: "row",
      children: row.map((cell) => tokenToNode(cell as unknown as Token)),
    }));
  }

  return node;
}
```

### Token-Specific Processing

| Token Type | Nested Fields | What Gets Extracted |
|-----------|--------------|---------------------|
| `heading` | `tokens` | Inline tokens within the heading |
| `paragraph` | `tokens` | Inline tokens (text, strong, em, link, etc.) |
| `list` | `items` | List item tokens |
| `code` | `text`, `lang` | Code content and language |
| `table` | `header`, `rows` | Table cells as nested nodes |
| `blockquote` | `tokens` | Tokens inside the blockquote |
| `strong` / `em` | `tokens` | Inline content |

---

## Utility Functions

### countNodes

**Signature:** `function countNodes(ast: ASTTokenNode[]): number`

Counts the total number of nodes in the AST tree (including all descendants).

```typescript:desc=countNodes recursively traverses the AST tree and counts every node including all descendants
export function countNodes(ast: ASTTokenNode[]): number {
  let count = 0;
  for (const node of ast) {
    count += 1; // Count this node
    if (node.children) {
      count += countNodes(node.children); // Recurse
    }
  }
  return count;
}
```

**Example:** A heading with 3 inline tokens → 4 total nodes.

---

### getUniqueTypes

**Signature:** `function getUniqueTypes(ast: ASTTokenNode[]): string[]`

Returns a sorted array of unique token types found in the tree.

```typescript:desc=getUniqueTypes collects all node types into a Set via recursive traversal, then returns them as a sorted array
export function getUniqueTypes(ast: ASTTokenNode[]): string[] {
  const types = new Set<string>();
  function collect(nodes: ASTTokenNode[]) {
    for (const node of nodes) {
      types.add(node.type);
      if (node.children) collect(node.children);
    }
  }
  collect(ast);
  return Array.from(types).sort();
}
```

**Example output:** `["blockquote", "code", "em", "heading", "list", "paragraph", "strong", "text"]`

Used by the AST Viewer to display a filterable list of token types.

---

### getASTDepth

**Signature:** `function getASTDepth(ast: ASTTokenNode[]): number`

Returns the maximum nesting depth of the AST tree (0-indexed).

```typescript:desc=getASTDepth recursively traverses all nodes tracking current depth level and returns the maximum depth found
export function getASTDepth(ast: ASTTokenNode[]): number {
  let max = 0;
  function depth(nodes: ASTTokenNode[], current: number) {
    if (current > max) max = current;
    for (const node of nodes) {
      if (node.children) {
        depth(node.children, current + 1);
      }
    }
  }
  depth(ast, 0);
  return max;
}
```

**Example:**
- Top-level heading → depth 0
- Heading → strong → text → depth 2

---

## AST Viewer Integration

The `ASTViewer` component (`src/ASTViewer.tsx`) uses all four utilities:

```typescript:desc=ASTViewer component showing how tokensToAST, countNodes, getUniqueTypes, and getASTDepth are combined to compute display statistics
function ASTViewer({ ast: tokens }: ASTViewerProps) {
  const astNodes = useMemo(() => tokensToAST(tokens), [tokens]);

  const stats = useMemo(
    () => ({
      totalNodes: countNodes(astNodes),
      uniqueTypes: getUniqueTypes(astNodes),
      depth: getASTDepth(astNodes),
    }),
    [astNodes]
  );

  // ... render tree with expand/collapse
}
```

### Stats Display

```txt:desc=Visual layout of the AST Viewer stats panel showing token count, tree depth, unique type count, control buttons, search field, and collapsible type tag chips.
┌─────────────────────────────────┐
│ 42 tokens | Depth: 3 | 8 types   │
├─────────────────────────────────┤
│ [Expand All] [Collapse All]     │
│ [Search types...]               │
├─────────────────────────────────┤
│ 📌 heading 📝 paragraph 💻 code │
│ 📋 list 🔗 link ✨ em 🔒 strong │
├─────────────────────────────────┤
│ ▶ heading (2) h1                │
│ ▶ paragraph (5)                 │
│ ▶ code (1) typescript           │
└─────────────────────────────────┘
```

---

## When Is AST Data Available?

**Important:** The AST is **not generated during the standard build pipeline**. The `DocEntry.ast` field is only populated when the markdown lexer is run directly (e.g., in the AST Viewer debug tool).

During normal builds:
- Markdown → `marked` → HTML string
- The token array is discarded after HTML generation
- `currentDoc.ast` is `undefined`
- AST Viewer shows an empty state message

This is by design — the AST Viewer is a **debugging tool**, not a production feature.

---

## Summary

| Function | Purpose | Complexity |
|----------|---------|-----------|
| `tokensToAST()` | Convert `Token[]` → `ASTTokenNode[]` tree | O(n) |
| `countNodes()` | Count total nodes in tree | O(n) |
| `getUniqueTypes()` | Get sorted unique token types | O(n log n) |
| `getASTDepth()` | Find maximum nesting depth | O(n) |

Where `n` = total number of nodes in the tree.
