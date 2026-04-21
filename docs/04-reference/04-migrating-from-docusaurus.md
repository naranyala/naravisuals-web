---
title: Migrating from Docusaurus
description: How to migrate from Docusaurus, VitePress, or other SSGs
sidebar_label: Migrating from Docusaurus
sidebar_position: 6
tags: ["reference", "migration", "docusaurus", "compat"]
---

# Migrating from Docusaurus

This guide covers migrating documentation from Docusaurus, VitePress, MkDocs, and other static site generators to rspack-react-docs.

## Compatibility Overview

| Feature | Docusaurus | rspack-react-docs | Compatible? |
|---|---|---|---|
| Markdown source | `.md` files | `.md` files | Yes |
| Frontmatter | YAML `---` block | YAML `---` block | Yes |
| Sidebar config | `sidebars.js` | Auto-generated from files | Partial |
| Admonitions | `:::note` / `:::tip` | `:::note` / `:::tip` | Yes |
| MDX support | Yes | No | No |
| i18n | Built-in | Not supported | No |
| Versioning | `versioned_docs/` | Not supported | No |
| Blog | `blog/` directory | `blog/` directory | Yes |
| Static assets | `static/` | Place in `dist/` or public server | Partial |
| Custom React pages | `src/pages/` | Add components to `src/` | Partial |

## Migrating from Docusaurus

### Step 1: Copy Markdown Files

Copy all `.md` files from your Docusaurus `docs/` directory to this project's `docs/` directory. Use numeric prefixes to control ordering:

```bash:desc=Copy markdown files command example
# Create category folders with numeric prefixes
mkdir -p docs/01-getting-started
mkdir -p docs/02-architecture
mkdir -p docs/03-guides
mkdir -p docs/04-reference

# Copy docs (strip any version prefixes from filenames)
cp ../my-docusaurus-docs/docs/*.md docs/
```

### Step 2: Adjust Frontmatter

Docusaurus and rspack-react-docs share most frontmatter fields. The core fields are directly compatible:

```yaml:desc=YAML frontmatter example
---
title: "Page Title"           # Same in both
description: "Page desc"      # Same in both
sidebar_label: "Short Label"  # Same in both
sidebar_position: 1           # Same in both (or use filename prefix)
slug: "custom/slug"           # Auto-derived from filename in rspack-react-docs
---
```

**Fields to remove or ignore:**

| Docusaurus Field | Action |
|---|---|
| `id` | Removed -- derived from filename |
| `sidebar_class_name` | Removed -- not supported |
| `custom_edit_url` | Removed -- use global `repoEditUrl` in config |
| `pagination_label` | Removed -- uses `sidebar_label` |
| `hide_title` | Removed -- not supported |
| `keywords` | Moved to `metadata` (arbitrary field) |

### Step 3: Sidebar Configuration

Docusaurus uses `sidebars.js` for explicit sidebar configuration. rspack-react-docs **auto-generates** the sidebar from the file structure:

```js:desc=Docusaurus sidebars.js example
// Docusaurus: sidebars.js (REMOVE THIS FILE)
module.exports = {
  mySidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['overview', 'installation'],
    },
  ],
};
```

In rspack-react-docs, the sidebar is determined by folder structure and filename prefixes:

```text:desc=Sidebar folder structure example
docs/
├── 00-abstract.md                         # Position 0
├── 01-getting-started/
│   ├── 01-overview.md                     # Position 1 in category
│   └── 02-installation.md                 # Position 2 in category
└── 02-architecture/
    └── 01-overview.md                     # Position 1 in category
```

The numeric prefix in filenames (e.g., `01-`) sets `sidebar_position`. Numeric prefixes in folder names determine category order.

### Step 4: Admonitions

Admonition syntax is **fully compatible**:

```markdown:desc=Admonition syntax examples
:::note
This is a note.
:::

:::tip
This is a tip.
:::

:::info
This is info.
:::

:::warning
This is a warning.
:::

:::danger
This is a danger alert.
:::

:::caution
:::note    <!-- Maps to note in rspack-react-docs -->
This is a caution.
:::
```

The `:::caution` type maps to `:::note` in rspack-react-docs.

### Step 5: Code Blocks

Code block syntax is compatible. rspack-react-docs supports additional metadata in the info string:

`````text:desc=Codeblock syntax comparison example
<!-- Docusaurus (compatible) -->
```typescript:desc=Docusaurus compatible code block
const x = 1;
```

<!-- rspack-react-docs extensions -->
```typescript:title=src/example.ts:desc=Example code
const x = 1;
```

```mermaid:desc=User flow:zoom=true
flowchart TD
  A --> B
```

### What You Lose

| Feature | Workaround |
|---|---|
| **MDX** | Rewrite MDX components as React components in `src/`. Static markdown content works as-is. |
| **i18n** | Not supported. Maintain separate doc directories for each language if needed. |
| **Versioning** | Not supported. Use separate branches or directories for different versions. |
| **Theme inheritance** | Customize via `src/styles/` CSS files directly instead of `@theme` aliases. |
| **Plugins (Docusaurus)** | Rewrite using the [Markdown Plugins API](./04-markdown-plugins-api.md). |

## Migrating from VitePress

### Differences

| Feature | VitePress | rspack-react-docs |
|---|---|---|
| Frontmatter | Same YAML format | Same YAML format |
| Sidebar | `.vitepress/config.js` | Auto-generated from files |
| Theme | Default theme + CSS | Paper-like themes + goober |
| Routing | File-based | File-based with `routes.docs` prefix |
| Components | Vue SFCs | React components |
| Search | Algolia/Local | Not built-in |

### Migration Steps

1. Copy `.md` files from the VitePress docs directory
2. VitePress frontmatter (`title`, `description`, `sidebar_label`) is directly compatible
3. Remove `.vitepress/` directory -- configuration is in `src/services/container.ts`
4. Replace any Vue components with React equivalents in `src/`

## Migrating from MkDocs / Material for MkDocs

### Differences

| Feature | MkDocs | rspack-react-docs |
|---|---|---|
| Config format | `mkdocs.yml` (YAML) | `src/services/container.ts` (TypeScript) |
| Sidebar | `nav:` in YAML | Auto-generated from files |
| Frontmatter | YAML (same format) | YAML (same format) |
| Admonitions | `!!! note` syntax | `:::note` syntax |
| Themes | `material` theme | Paper-like CSS modules |
| Plugins | Python plugins | TypeScript plugins |

### Migration Steps

1. **Convert admonitions**: MkDocs uses `!!! note` while rspack-react-docs uses `:::note`:

```markdown:desc=MkDocs to rspack-react-docs admonition conversion
<!-- MkDocs (before) -->
!!! note "Title"
    Content here
<!-- rspack-react-docs (after) -->
:::note
**Title**
Content here
:::
```

2. **Copy markdown files** to the `docs/` directory
3. **Remove `mkdocs.yml`** -- sidebar is auto-generated from file structure
4. **Adjust frontmatter** -- MkDocs may use different field names (`nav_title` -> `sidebar_label`)

## General Migration Steps

### 1. Audit Existing Documentation

```bash:desc=Audit documentation commands
# Count files by type
find docs/ -name "*.md" | wc -l
# Check for MDX files (need rewriting)
find docs/ -name "*.mdx" -o -name "*.md" -exec grep -l "<[A-Z]" {} \;
# Check for custom admonition types
grep -r ":::" docs/ | grep -oP ':[a-z]+' | sort | uniq -c
```

### 2. Set Up Project Structure

```bash:desc=Create project structure
# Create category directories
mkdir -p docs/{01-getting-started,02-architecture,03-guides,04-reference,05-contributing}

# Copy markdown files with numeric prefixes
# (adjust based on your content)
```

### 3. Rebuild Documentation

```bash:desc=Rebuild documentation commands
# Generate TypeScript data from markdown
bun run build:docs
# Verify no build errors
bun run validate
# Start development server
bun run dev
```

### 4. Test Links and Navigation

- Verify all internal links resolve correctly
- Check sidebar ordering matches expectations
- Test responsive behavior at different viewport sizes
- Verify code block syntax highlighting works
- Confirm Mermaid diagrams render correctly
- Check MathJax equations display properly

### 5. Post-Migration Checklist

- [ ] All `.md` files copied to `docs/`
- [ ] Frontmatter fields validated (run `bun run validate`)
- [ ] Admonition syntax converted if needed
- [ ] Code block language tags present
- [ ] Internal links tested
- [ ] Sidebar ordering verified
- [ ] Mermaid diagrams render
- [ ] Math equations render
- [ ] Mobile layout tested (below 800px)
- [ ] TOC hiding verified (below 1100px)
- [ ] Print view tested

## Cross-References

- [Configuration](./03-configuration.md) -- `IAppConfig` for site settings
- [Plugins API](./04-markdown-plugins-api.md) -- replacing Docusaurus/VitePress plugins
- [File Structure](./05-file-structure.md) -- project directory layout
- [Generated Output](./01-generated-output.md) -- how markdown becomes data
