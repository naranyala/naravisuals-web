# Article Links Panel

## Overview

The **Article Links Panel** is a new collapsible section that extracts and displays all links mentioned in the current article. It replaces the previous Table of Contents (TOC) mobile collapsible and is **expanded by default** for immediate visibility.

## What It Does

The panel automatically:
1. **Scans** the current article's rendered HTML content
2. **Extracts** all `<a href="...">` links
3. **Categorizes** them by type (External, Internal, Anchor)
4. **Displays** them in a clean, organized list
5. **Updates** dynamically when navigating between articles

## Link Categories

### 🔗 External Links
- Links starting with `http://` or `https://`
- Point to external websites/resources
- Shows "↗" indicator to indicate external destination
- Opens in new tab when clicked

### 📄 Internal Links
- Links starting with `/docs/` or `/`
- Point to other pages within the documentation site
- Displayed in blue to distinguish from external links
- Navigates within the site

### 🔖 Section Anchors
- Links starting with `#`
- Point to sections within the current article
- Displayed in purple to indicate same-page navigation
- Scrolls to the target section

## Visual Design

### Collapsible Header
```
┌─────────────────────────────────────────┐
│ 📎 Links in this Article (12)       ▾   │  ← Click to collapse/expand
├─────────────────────────────────────────┤
```

### Expanded View (Default)
```
┌─────────────────────────────────────────┐
│ 📎 Links in this Article (12)       ▴   │
├─────────────────────────────────────────┤
│                                         │
│ 🔗 EXTERNAL LINKS (5)                   │
│ ─────────────────────────────────       │
│ ┌─────────────────────────────────┐     │
│ │ React Documentation             │     │
│ │ https://react.dev               │     │
│ └─────────────────────────────────┘     │
│ ┌─────────────────────────────────┐     │
│ │ Mermaid.js ↗                    │     │
│ │ https://mermaid.js.org          │     │
│ └─────────────────────────────────┘     │
│                                         │
│ 📄 INTERNAL LINKS (4)                   │
│ ─────────────────────────────────       │
│ ┌─────────────────────────────────┐     │
│ │ Getting Started                 │     │
│ │ /docs/getting-started/install   │     │
│ └─────────────────────────────────┘     │
│                                         │
│ 🔖 SECTION ANCHORS (3)                  │
│ ─────────────────────────────────       │
│ ┌─────────────────────────────────┐     │
│ │ Configuration Options           │     │
│ │ #configuration                  │     │
│ └─────────────────────────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

## Features

### ✅ Expanded by Default
- Panel opens automatically when you load an article
- No need to click to see links
- Immediately visible and accessible

### ✅ Smart Deduplication
- Same URL appears only once
- First occurrence's link text is used
- Prevents clutter from repeated links

### ✅ Visual Indicators
- **External links**: "↗" suffix
- **Internal links**: Blue text color
- **Anchor links**: Purple text color
- **Link count**: Shows in header

### ✅ Link Display Format
Each link shows:
1. **Link Text**: The visible text from the article (bold)
2. **URL**: The actual href value (monospace, gray)

### ✅ Responsive Design
- Adapts to mobile screens
- Proper spacing and padding
- Readable on all devices

### ✅ Dark Mode Support
- Automatically adjusts colors
- Maintains readability
- Consistent with site theme

## How It Works

### Technical Implementation

```typescript
// 1. Parse HTML content
const tempDiv = document.createElement("div");
tempDiv.innerHTML = contentHtml;

// 2. Extract all anchor elements
const anchors = tempDiv.querySelectorAll("a[href]");

// 3. Categorize each link
links.forEach(link => {
  if (link.href.startsWith("http")) → External
  if (link.href.startsWith("/docs/")) → Internal
  if (link.href.startsWith("#")) → Anchor
});

// 4. Display in grouped lists
```

### Performance

- Uses `useMemo` for efficient re-computation
- Only recalculates when content changes
- Lightweight DOM operations
- No impact on page load time

## User Experience

### Before (TOC Mobile)
- Showed document headings
- Collapsed by default
- Required click to expand
- Limited navigation value

### After (Links Panel)
- Shows all referenced resources
- **Expanded by default** ✅
- Immediate visibility of links
- More useful for research/references

## Benefits

### For Readers
- ✅ Quick access to all referenced resources
- ✅ See external dependencies at a glance
- ✅ Navigate to related docs easily
- ✅ Find section anchors quickly

### For Writers
- ✅ Validates link placement
- ✅ Shows link density in articles
- ✅ Helps identify broken links
- ✅ Encourages proper linking

### For Developers
- ✅ Track external resource usage
- ✅ Monitor internal link structure
- ✅ Identify popular references
- ✅ Audit link health

## Location in UI

The panel appears:
1. **After** the page title
2. **Before** the metadata panel
3. **Above** the article content
4. **Visible** on all articles with links

## Styling

### Color Scheme

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| **Header** | #374151 | #f9fafb |
| **Background** | #f9fafb | #1f2937 |
| **External Link** | #111827 | #f9fafb |
| **Internal Link** | #2563eb | #60a5fa |
| **Anchor Link** | #7c3aed | #a78bfa |
| **URL Text** | #6b7280 | #9ca3af |
| **Border** | #e5e7eb | #374151 |

### Interactive States

- **Hover**: Background darkens, border strengthens
- **Active**: Subtle scale effect
- **Focus**: Accessible focus ring

## Configuration

### Default Behavior
- ✅ Expanded on load
- ✅ Shows all link types
- ✅ Automatic extraction

### Future Options
- [ ] Filter by link type
- [ ] Search within links
- [ ] Export link list
- [ ] Check link validity
- [ ] Show link frequency

## Files Created/Modified

### New Files
- `src/ArticleLinksPanel.tsx` - React component
- `src/styles/article-links-panel.css` - Styling

### Modified Files
- `src/App.tsx` - Integrated component, removed TOC state
- `src/styles/index.css` - Added CSS import

## Browser Support

Works in all modern browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Accessibility

- ✅ Semantic HTML structure
- ✅ ARIA attributes (aria-expanded)
- ✅ Keyboard accessible
- ✅ Screen reader friendly
- ✅ Focus management

## Edge Cases

### Handled Gracefully
- **No links**: Panel doesn't render
- **Empty href**: Skipped
- **Hash only (#)**: Skipped
- **Duplicate URLs**: Deduplicated
- **Empty link text**: Uses href as fallback

### Not Handled (Future)
- JavaScript-disabled environments
- SSR/pre-rendered content
- Dynamic link injection

## Testing

To test the panel:

1. **Run dev server**: `bun run dev`
2. **Navigate** to any article with links
3. **Observe** the expanded links panel at the top
4. **Click** header to collapse/expand
5. **Click** links to navigate/test

## Comparison with TOC

| Feature | TOC (Old) | Links Panel (New) |
|---------|-----------|-------------------|
| **Content** | Document headings | All article links |
| **Default State** | Collapsed | **Expanded** ✅ |
| **Use Case** | Navigation | Reference & Navigation |
| **Scope** | Document structure | External + Internal + Anchors |
| **Value** | Low (breadcrumbs show title) | **High** (resource inventory) |
| **Dynamic** | Static (from frontmatter) | **Dynamic** (from rendered HTML) |

## Future Enhancements

Potential improvements:
- [ ] Link validity checking
- [ ] Link search/filter
- [ ] Export as JSON/CSV
- [ ] Show link metadata (title, rel, target)
- [ ] Group by domain for external links
- [ ] Link preview on hover
- [ ] Broken link detection
- [ ] Link click tracking

## Summary

The Article Links Panel provides immediate value by:
1. **Extracting** all links automatically
2. **Organizing** them by type
3. **Displaying** them expanded by default
4. **Updating** dynamically per article
5. **Enhancing** research and navigation

It's more useful than the old TOC because it shows actual resources referenced in the article rather than just headings!
