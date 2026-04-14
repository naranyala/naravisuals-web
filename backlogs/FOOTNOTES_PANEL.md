# References & Footnotes Panel

## Overview

The **References & Footnotes Panel** is a collapsible section in the article footer that displays only footnote and reference citations (`[^index]`) found in the current article. It's **expanded by default** for immediate visibility.

## What Changed

### Before (All-Links Scanner)
- Scanned ALL links in the article
- Showed external, internal, and anchor links
- Positioned at the top of the article
- Overwhelming with too many links
- Less focused on citations

### After (Footnotes Only)
- **Only** captures `[^\d+]` footnote references
- Shows citation index and reference link
- Positioned in the **footer** after content
- Clean, focused, and useful
- Matches academic paper style

## How It Works

### Detection Logic

The panel scans the rendered HTML and looks for:

```html
<a href="#footnote-1">[^1]</a>
<a href="#ref-2">[^2]</a>
<a href="#note-abc">[^abc]</a>
```

**Pattern Matching:**
1. Link href must start with `#` (anchor link)
2. Link text must match the pattern `[^<index>]`
3. Example matches: `[^1]`, `[^2]`, `[^note]`, `[^ref]`

### What Gets Captured

✅ **Captured:**
- `[^1]` → Standard numbered footnote
- `[^2]` → Another numbered footnote
- `[^note]` → Named footnote
- `[^ref]` → Named reference
- `[^citation]` → Named citation

❌ **NOT Captured:**
- Regular links: `[Click here](https://...)`
- Internal links: `[Other Doc](/docs/other)`
- Section anchors: `[Section](#section)`
- External URLs: `[Resource](https://...)`

## Visual Design

### Collapsible Header (Expanded by Default)
```
┌─────────────────────────────────────────┐
│ 📖 References & Footnotes (3)       ▴   │  ← Expanded by default
├─────────────────────────────────────────┤
```

### Footnote List
```
┌─────────────────────────────────────────┤
│                                         │
│ [1]    [^1]                             │
│ [2]    [^2]                             │
│ [note] [^note]                          │
│                                         │
└─────────────────────────────────────────┘
```

### Collapsed State
```
┌─────────────────────────────────────────┐
│ 📖 References & Footnotes (3)       ▾   │  ← Click to expand
└─────────────────────────────────────────┘
```

## Location in UI

The panel appears in the footer area:

```
┌──────────────────────────────────────┐
│ [Article Content]                    │
│ ...                                  │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ 📖 References & Footnotes (3)    ▴   │ ← HERE (footer)
├──────────────────────────────────────┤
│ [^1] [^2] [^note]                    │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ 📊 Document Stats                    │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ ← Previous | Next →                  │
└──────────────────────────────────────┘
```

## Styling

### Color Scheme

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| **Header Text** | #374151 | #f9fafb |
| **Background** | #f9fafb | #1f2937 |
| **Footnote Link** | #7c3aed (purple) | #a78bfa (light purple) |
| **Index Badge** | #6b7280 (gray) | #9ca3af (light gray) |
| **Border** | #e5e7eb | #374151 |

### Interactive States

- **Hover**: Background lightens, link underlines
- **Focus**: Accessible focus ring
- **Active**: Subtle scale effect

## Technical Details

### Component Structure

```typescript
ArticleRefsPanel
├── isOpen: boolean (default: true)
├── references: ReferenceInfo[]
│   ├── index: string (e.g., "1", "note")
│   ├── href: string (e.g., "#footnote-1")
│   ├── text: string (e.g., "[^1]")
│   └── isFootnote: boolean (always true)
└── Render
    ├── Header (collapsible button)
    └── Content (list of footnotes)
```

### Extraction Algorithm

```typescript
1. Parse HTML content into temporary DOM
2. Query all <a href="..."> elements
3. Filter for footnote pattern:
   - href starts with "#"
   - text matches /^\[\^[^\]]+\]$/
4. Extract index from text: [^1] → "1"
5. Deduplicate by href
6. Sort by appearance order
7. Display in list
```

### Performance

- Uses `useMemo` for efficient caching
- Only recalculates when content changes
- Lightweight DOM queries
- No impact on page load

## Benefits

### For Readers
- ✅ See all footnotes/references at a glance
- ✅ Quick navigation to footnote definitions
- ✅ Count of citations in article
- ✅ Academic paper-like experience

### For Writers
- ✅ Validates footnote placement
- ✅ Shows citation density
- ✅ Helps identify missing footnotes
- ✅ Encourages proper citations

### For Reviewers
- ✅ Easy audit of references
- ✅ Check footnote completeness
- ✅ Verify citation consistency
- ✅ Track reference usage

## Use Cases

### Academic Papers
```markdown
According to recent studies[^1], ...

As noted in previous research[^2][^3], ...

[^1]: Smith et al., "Study Title", 2024
[^2]: Johnson, "Previous Work", 2023
[^3]: See also Williams, "Related Study", 2023
```

**Panel shows:** `[^1]`, `[^2]`, `[^3]`

### Documentation
```markdown
This feature requires configuration[^config].

See the deployment guide[^deploy] for details.

[^config]: See config.md for details
[^deploy]: See /docs/deployment
```

**Panel shows:** `[^config]`, `[^deploy]`

### Technical Articles
```markdown
The algorithm has O(n²) complexity[^complexity].

This matches the theoretical prediction[^theory].

[^complexity]: See Knuth, Vol. 3
[^theory]: Proven in [Author] 2020
```

**Panel shows:** `[^complexity]`, `[^theory]`

## Comparison with Previous Version

| Feature | Old (All Links) | New (Footnotes Only) |
|---------|----------------|---------------------|
| **Scope** | All links | Only `[^...]` |
| **Position** | Top of article | **Footer** |
| **Count** | Many (10-50+) | Few (1-10) |
| **Types** | External, Internal, Anchors | **Footnotes only** |
| **Use Case** | Link inventory | **Citation tracking** |
| **Value** | Overwhelming | **Focused & useful** |
| **Style** | Link directory | **Academic reference** |

## Edge Cases

### Handled Gracefully
- ✅ **No footnotes**: Panel doesn't render
- ✅ **Duplicate references**: Deduplicated by href
- ✅ **Empty index**: Skipped
- ✅ **Malformed markup**: Ignored safely
- ✅ **Multiple citations**: Each shown once

### Not Handled (Future)
- [ ] Footnote content preview
- [ ] Broken footnote detection
- [ ] Footnote validation
- [ ] Export reference list

## Accessibility

- ✅ Semantic HTML structure
- ✅ ARIA attributes (aria-expanded)
- ✅ Keyboard accessible
- ✅ Screen reader friendly
- ✅ Clear visual hierarchy
- ✅ Sufficient color contrast

## Files Modified

### Renamed
- `src/ArticleLinksPanel.tsx` → `src/ArticleRefsPanel.tsx`

### Updated
- `src/ArticleRefsPanel.tsx` - Component logic (footnotes only)
- `src/App.tsx` - Import and placement in footer
- `src/styles/article-links-panel.css` - Renamed classes to `.article-refs-*`
- `src/styles/index.css` - CSS import (unchanged)

## Testing

To test the panel:

1. **Create a test article with footnotes:**
   ```markdown
   # Test Article
   
   This is a statement[^1].
   
   Another claim[^2].
   
   [^1]: First footnote
   [^2]: Second footnote
   ```

2. **Run dev server:** `bun run dev`

3. **Navigate to the test article**

4. **Scroll to footer** - Panel should appear expanded

5. **Verify:**
   - Shows "📖 References & Footnotes (2)"
   - Lists `[^1]` and `[^2]`
   - Clicking jumps to footnote
   - Clicking header collapses/expands

## Future Enhancements

Potential improvements:
- [ ] Show footnote content on hover
- [ ] Detect broken footnotes (reference without definition)
- [ ] Export as citation list
- [ ] Count unique vs repeated citations
- [ ] Link to external citation managers
- [ ] Citation format selector (APA, MLA, etc.)

## Summary

The References & Footnotes Panel provides:
1. **Focused tracking** of only footnote citations
2. **Footer placement** for better UX
3. **Academic style** matching research papers
4. **Expanded by default** for immediate visibility
5. **Clean, minimal design** with purple accent colors

It's more useful than the previous all-links scanner because it:
- Shows only relevant citations
- Matches academic paper conventions
- Doesn't overwhelm with regular links
- Helps track footnote usage
- Provides citation auditing
