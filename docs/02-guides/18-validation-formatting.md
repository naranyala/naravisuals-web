---
title: Validation Output Formatting
description: How the validation output is formatted with visual indicators and alignment
sidebar_label: Validation Formatting
sidebar_position: 18
---

## Overview

Enhanced the validation output formatting with better alignment, visual indicators, and cleaner structure for improved readability.

---

## What Changed

### Before

```text:desc=Example text content
Validation Results:
  🔒 codeblock-descriptions: 0 issue(s)
  📋 admonitions: 0 issue(s)
  📋 footnotes: 0 issue(s)

Errors found:
  ✗ guides/build-statistics Line 120: 💻 programming (typescript) has no description
    💡 Add :desc=Your description here to the codeblock fence

Informative Recommendations:
  • getting-started/project-overview: Document has no footnotes (5 headings)
  ...

📋 Per-Document Metrics
Doc                              Code Diag Note Foot Head
---- ---- ---- ---- ----
 getting-started/project-overview 4 2 2 0 5
```

### After

```text:desc=Example text content
┌─────────────────────────────────────────────────┐
│  Validation Summary                            │
├─────────────────────────────────────────────────┤
│ 🔒 codeblock-descriptions         ✓ Pass │
│ 📋 admonitions                    ✓ Pass │
│ 📋 footnotes                      ✓ Pass │
└─────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════╗
║  ❌ Validation Errors                              ║
╚═══════════════════════════════════════════════════╝

📄 guides/build-statistics
   ────────────────────────────────────────────────────────────
  ✗ Line 120  💻 programming (typescript) has no description
     💡 Add :desc=Your description here to the codeblock fence

╔═══════════════════════════════════════════════════╗
║  💡 Enrichment Opportunities                        ║
╚═══════════════════════════════════════════════════╝

Footnote Enrichment (16 documents):
  • getting-started/project-overview    Document has no footnotes (5 headings)
  • getting-started/directory-structure Document has no footnotes (3 headings)
  ...

┌─────────────────────────────────────────────────┐
│  📊 Per-Document Metrics                         │
├─────────────────────────────────────────────────┤
│ Document                          Code  Diag  Note  Foot  Head │
│ ─────────────────────────────────────────────────────────────────── │
│ getting-started/project-overview ✓   4 ✓   2 ✓   2 –   0 ✓   5 │
│ guides/react-hooks               ✓  17 ✗   0 ⚠   1 –   0 ✓  21 │
│ TOTAL                              ─ 147   ─  23   ─  23   ─   5   ─ 233 │
└─────────────────────────────────────────────────┘

Legend: Code=Codeblocks, Diag=Mermaid, Note=Admonitions, Foot=Footnotes, Head=h2/h3
Icons: ✓ Good  ⚠ Low  ✗ None  – N/A
```

---

## Improvements Made

### 1. **Validation Summary Box**

**What changed:**
- Added bordered box with title
- Shows pass/fail status with icons
- Clear visual separation

**Before:**
```text:desc=Example text content
Validation Results:
  🔒 codeblock-descriptions: 0 issue(s)
```

**After:**
```text:desc=Example text content
┌─────────────────────────────────────────────────┐
│  Validation Summary                            │
├─────────────────────────────────────────────────┤
│ 🔒 codeblock-descriptions         ✓ Pass │
│ 📋 admonitions                    ✓ Pass │
└─────────────────────────────────────────────────┘
```

**Status indicators:**
- ✅ `✓ Pass` - No issues (green)
- ❌ `✗ 5 issue(s)` - Strict validation failed (red)
- ℹ️ `ℹ 3 suggestion(s)` - Informative recommendations (yellow)

---

### 2. **Error Section**

**What changed:**
- Bold red header with icon
- File separator lines
- Aligned line numbers
- Clearer structure

**Before:**
```text:desc=Example text content
Errors found:
  ✗ Line 120: 💻 programming (typescript) has no description
    💡 Add :desc=Your description here to the codeblock fence
```

**After:**
```text:desc=Example text content
╔═══════════════════════════════════════════════════╗
║  ❌ Validation Errors                              ║
╚═══════════════════════════════════════════════════╝

📄 guides/build-statistics
   ────────────────────────────────────────────────────────────
  ✗ Line 120  💻 programming (typescript) has no description
     💡 Add :desc=Your description here to the codeblock fence
```

**Features:**
- Prominent header with double-line borders
- File names highlighted with 📄 icon
- Separator line under each file
- Line numbers right-aligned and padded (3 digits)
- Suggestions indented with 💡 icon

---

### 3. **Enrichment Opportunities**

**What changed:**
- Grouped by rule type
- Shows count of affected documents
- Better alignment of file names
- Truncated lists with "and X more"

**Before:**
```text:desc=Example text content
Informative Recommendations:
  • getting-started/project-overview: Document has no footnotes (5 headings)
  ... and 16 more
```

**After:**
```text:desc=Example text content
╔═══════════════════════════════════════════════════╗
║  💡 Enrichment Opportunities                        ║
╚═══════════════════════════════════════════════════╝

Footnote Enrichment (16 documents):
  • getting-started/project-overview    Document has no footnotes (5 headings)
  • getting-started/directory-structure Document has no footnotes (3 headings)
  • guides/build-system                 Document has no footnotes (4 headings)
  ... and 8 more
```

**Features:**
- Blue header box
- Grouped by enrichment type
- File names padded to 35 chars for alignment
- Shows first 8, then "and X more"

---

### 4. **Per-Document Metrics Table**

**What changed:**
- Bordered table structure
- Icon-based indicators instead of raw numbers
- Clear legend with icon meanings
- Better column alignment

**Before:**
```text:desc=Example text content
📋 Per-Document Metrics
Doc                              Code Diag Note Foot Head
---- ---- ---- ---- ----
 getting-started/project-overview 4 2 2 0 5
```

**After:**
```text:desc=Example text content
┌─────────────────────────────────────────────────┐
│  📊 Per-Document Metrics                         │
├─────────────────────────────────────────────────┤
│ Document                          Code  Diag  Note  Foot  Head │
│ ─────────────────────────────────────────────────────────────────── │
│ getting-started/project-overview ✓   4 ✓   2 ✓   2 –   0 ✓   5 │
│ guides/react-hooks               ✓  17 ✗   0 ⚠   1 –   0 ✓  21 │
│ TOTAL                              ─ 147   ─  23   ─  23   ─   5   ─ 233 │
└─────────────────────────────────────────────────┘

Legend: Code=Codeblocks, Diag=Mermaid, Note=Admonitions, Foot=Footnotes, Head=h2/h3
Icons: ✓ Good  ⚠ Low  ✗ None  – N/A
```

**Icon System:**
| Icon | Meaning | When Shown |
|------|---------|------------|
| **✓** | Good | Codeblocks ≥3, Diagrams ≥1, Admonitions ≥2, etc. |
| **⚠** | Low | Codeblocks 1-2, Admonitions 1 |
| **✗** | None | Codeblocks 0, Diagrams 0, Admonitions 0 |
| **–** | N/A | Footnotes (not tracked strictly) |

---

## Color Coding

| Element | Color | Purpose |
|---------|-------|---------|
| **Validation Summary** | Cyan | Neutral information |
| **Errors** | Red | Critical issues requiring attention |
| **Enrichment** | Blue | Helpful suggestions |
| **Metrics Table** | Magenta | Data/statistics |
| **File Names** | Cyan | Identifying documents |
| **Line Numbers** | Gray | Secondary information |
| **Suggestions** | Dim Gray | Optional improvements |

---

## Box Styles

### Single-Line Border (Summary, Metrics)
```text:desc=Example text content
┌─────────────────────────────────────────────────┐
│  Title                                          │
├─────────────────────────────────────────────────┤
│  Content                                        │
└─────────────────────────────────────────────────┘
```

### Double-Line Border (Errors, Enrichment)
```text:desc=Example text content
╔═══════════════════════════════════════════════════╗
║  Title                                            ║
╚═══════════════════════════════════════════════════╝
```

**Why two styles?**
- **Single-line** - Informational sections (summary, metrics)
- **Double-line** - Action-required sections (errors) or important recommendations (enrichment)

---

## Alignment Rules

### File Names
- **Padded to 32 characters** in metrics table
- **Padded to 35 characters** in enrichment lists
- Ensures vertical alignment of subsequent columns

### Line Numbers
- **Right-aligned, 3 digits** (e.g., `Line 120`, `Line   5`)
- Consistent width for easy scanning

### Numeric Values
- **Right-aligned, 3 digits** in metrics table
- Icons on left, numbers on right
- Example: `✓  17`, `✗   0`, `⚠   1`

---

## Benefits

### For Developers
✅ **Clear visual hierarchy** - Easy to spot errors vs suggestions  
✅ **Better scanning** - Icons faster to read than numbers  
✅ **Grouped information** - Related items shown together  

### For LLM Code Agents
✅ **Structured output** - Easier to parse programmatically  
✅ **Clear priorities** - Errors separated from suggestions  
✅ **Actionable format** - File + Line + Suggestion structure  

### For CI/CD
✅ **Readable logs** - Clean formatting in build outputs  
✅ **Quick assessment** - Summary box shows status at glance  
✅ **Detailed breakdown** - Full metrics available when needed  

---

## Example Outputs

### Strict Mode (`bun run validate:strict`)

Shows only:
- Validation Summary box
- Errors section (if any)
- Pass/fail message

### Informative Mode (`bun run validate:info`)

Shows only:
- Validation Summary box
- Enrichment Opportunities section
- Per-Document Metrics table

### All Mode (`bun run validate`)

Shows everything:
- Validation Summary box
- Errors section (if any)
- Enrichment Opportunities section
- Per-Document Metrics table
- Final status message

---

## Files Modified

**Updated:**
- `scripts/validate.mts` - Enhanced formatting with:
  - Box-drawing characters (┌┐└┘╔╗╚╝║─)
  - Icon-based status indicators
  - Improved alignment and padding
  - Grouped enrichment recommendations
  - Clear section headers

**No new files created** - Pure formatting enhancement

---

## Summary

The validation output is now:

✅ **Visually appealing** - Box borders, icons, colors  
✅ **Well-structured** - Clear sections with headers  
✅ **Easy to scan** - Icons faster than numbers  
✅ **Properly aligned** - Consistent column widths  
✅ **Actionable** - Errors separated from suggestions  
✅ **Professional** - Clean, polished appearance  

Run `bun run validate` to see the improved formatting! 📊✨
