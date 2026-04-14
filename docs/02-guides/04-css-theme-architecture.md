---
title: CSS and Theme Architecture
description: Modular CSS organization, theme system, and code theme filters
sidebar_label: CSS & Themes
sidebar_position: 6
---

# CSS and Theme Architecture

:::note CSS Architecture
The project uses Modular CSS (not CSS-in-JS) for all styling. CSS variables in `variables.css` define the design system, making theme switching simple and performant.
:::

## Modular CSS Structure

CSS is split into 18 modular files, imported in strict dependency order by `src/styles/index.css`:

| Order | File | Purpose |
|-------|------|---------|
| 1 | `variables.css` | Design tokens, 6 theme palettes |
| 2 | `layout.css` | Topbar, sidebar, overlay, scroll, main content grid |
| 3 | `panels.css` | Settings overlay, print button, AST viewer, fonts, scroll-to-top |
| 4 | `print-view.css` | Print-all-docs view layout |
| 5 | `breadcrumbs.css` | Breadcrumb navigation |
| 6 | `doc-content.css` | Prose: headings, paragraphs, lists, tables, blockquotes |
| 7 | `code-blocks.css` | Code block containers, headers, copy buttons, inline code |
| 8 | `admonitions.css` | Note/tip/info/warning/danger/caution callout blocks |
| 9 | `math.css` | MathJax inline and display math containers |
| 10 | `toc.css` | Table of contents (desktop + mobile) |
| 11 | `metadata.css` | Metadata panel (collapsible details) |
| 12 | `mermaid.css` | Mermaid diagram containers, loading, error states |
| 13 | `doc-footer.css` | Footer, pagination, edit page link |
| 14 | `states.css` | Loading, empty, not-found states |
| 15 | `responsive.css` | Mobile breakpoint utilities |
| 16 | `shiki-themes.css` | CSS filter transforms for code theme switching |
| 17 | `print-media.css` | @media print overrides |

## CSS Delivery

CSS is loaded via `style-loader` + `css-loader` in rspack, which injects `<style>` tags into the document at runtime. No CSS extraction to separate files.

## Theme System

6 UI themes via `[data-theme="..."]` attribute selectors, each defining:
- `--ifm-color-primary`, `--ifm-color-primary-dark`, `--ifm-color-primary-light`
- `--bg`, `--bg-surface`, `--bg-code`, `--border`
- `--text`, `--text-secondary`

### Theme Palette

| Theme | Primary | Background | Code BG | Text |
|-------|---------|-----------|---------|------|
| `paperlike-white` | `#2563eb` | `#ffffff` | `#f0f0f0` | `#2c2c2c` |
| `paperlike-gray` | `#5b8db8` | `#e8e8e8` | `#d5d5d5` | `#333333` |
| `paperlike-sepia` | `#8b6914` | `#f4ecd8` | `#e5dcc5` | `#433422` |
| `paperlike-dark-gray` | `#7ba3cc` | `#2a2a2a` | `#383838` | `#d0d0d0` |
| `navy` | `#3b82f6` | `#f0f4f8` | `#dae1e9` | `#1e293b` |
| `dark-navy` | `#60a5fa` | `#0f172a` | `#253349` | `#e2e8f0` |

## Code Theme System (CSS Filters)

Since Shiki renders syntax highlighting at build time with `github-dark`, runtime theme switching uses CSS filter transforms on `.code-block` elements:

```css:desc=CSS filter transforms applied to .code-block elements for runtime theme switching. Each filter chain converts the build-time github-dark Shiki output to match the selected UI theme.
/* paperlike-white: light theme */
[data-code-theme="paperlike-white"] .code-block {
  filter: invert(1) hue-rotate(180deg) brightness(1.02);
}

/* paperlike-sepia: warm sepia tones */
[data-code-theme="paperlike-sepia"] .code-block {
  filter: sepia(0.3) saturate(1.2) brightness(1.05) hue-rotate(10deg);
}

/* dark-navy: deep blue tones */
[data-code-theme="dark-navy"] .code-block {
  filter: saturate(1.2) hue-rotate(210deg) brightness(0.9) contrast(1.1);
}
```

## Custom Properties

Theme preferences are persisted via:
- `--docs-font-size`: Font size (12-20px, default 15)
- `--docs-line-height`: Line height (1.2-2.2, default 1.6)
- `data-theme`: Applied to `<html>` element
- `data-code-theme`: Applied to `<html>` for code blocks
- `data-font`: Font family selection

## Inline Code Styling

Inline code (backticks) uses theme-aware styling:
- Background: `var(--bg-code)`
- Border: `1px solid var(--border)`
- Font weight: 500 (medium)
- Subtle box shadow for depth
- Adapts to all 6 themes
