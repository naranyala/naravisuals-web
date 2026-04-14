# Validator Formatting Guide

## Overview

The validator output has been enhanced with professional formatting including:
- ✅ Centered headers with borders
- ✅ Severity badges ([ERROR], [WARN], [INFO])
- ✅ Status badges (✓ PASS, ✗ FAIL)
- ✅ Aligned metrics with consistent spacing
- ✅ Visual separators between sections
- ✅ Color-coded severity indicators
- ✅ Summary breakdown with totals

## 📊 Output Structure

### Header Section

```
────────────────────────────────────────────────────────────────────────────────
                         🔍 Unified Markdown Validator
                         Quality checks for markdown content
────────────────────────────────────────────────────────────────────────────────

Validators: Codeblock Description Validator → Admonition Tracker → Reference & Footnote Validator

Scanning 49 markdown files in /path/to/docs
```

### Per-Validator Section

```
════════════════════════════════════════════════════════════════════════════════
📝  Codeblock Description Validator
════════════════════════════════════════════════════════════════════════════════

  [ERROR]  docs/example.md:42
           Codeblock missing description
           → typescript codeblock at line 42 has no desc= attribute

────────────────────────────────────────────────────────────────────────────────
  Files checked:       49
  Total issues:        1
    Errors:            1
    Warnings:          0
    Info:              0
  Strict issues:       1
  Status:              FAIL

Files with issues: 1

  • docs/example.md
```

### Overall Summary

```
────────────────────────────────────────────────────────────────────────────────
                               📊 Overall Summary
────────────────────────────────────────────────────────────────────────────────

  Codeblock Description Validator   ✓ PASS  (clean)
  Admonition Tracker                ✓ PASS  (0 errors, 0 warnings, 29 info)
  Reference & Footnote Validator    ✗ FAIL (strict)  (2 errors, 0 warnings, 0 info)

────────────────────────────────────────────────────────────────────────────────

  Total Issues: 31  |  2 errors  |  0 warnings  |  29 info

  Validators: 3 total  |  2 passed  |  1 failed

════════════════════════════════════════════════════════════════════════════════

⚠ Build succeeded but has 2 error(s) to fix
```

## 🎨 Formatting Features

### 1. Severity Badges

| Badge | Color | Meaning |
|-------|-------|---------|
| `[ERROR]` | 🔴 Red | Critical issue, may fail strict validation |
| `[WARN]` | 🟡 Yellow | Potential improvement, not critical |
| `[INFO]` | 🔵 Cyan | Suggestion for enrichment |

### 2. Status Badges

| Badge | Meaning |
|-------|---------|
| `✓ PASS` | Validator passed all strict checks |
| `✓ PASS (strict clean)` | Passed with zero strict issues |
| `✗ FAIL (strict)` | Failed strict validation |

### 3. Visual Indicators

- **═** Double line: Section headers
- **─** Single line: Subsection separators
- **→** Arrow: Actionable details
- **•** Bullet: File lists

### 4. Color Coding

| Color | Usage |
|-------|-------|
| 🔴 Red | Errors, failures |
| 🟡 Yellow | Warnings, suggestions |
| 🟢 Green | Success, clean status |
| 🔵 Cyan | Info, metadata |
| 🟣 Magenta | Section borders |
| ⚫ Gray | File paths, details |

### 5. Aligned Metrics

All metrics are aligned with consistent padding:

```
  Files checked:       49
  Total issues:        2
    Errors:            2
    Warnings:          0
    Info:              0
  Strict issues:       2
  Status:              FAIL
```

## 🚀 Usage Modes

### Standard Mode

```bash
bun run validate
```

Shows all issues with full details.

### Stats Mode

```bash
bun run validate:stats
```

Shows only summary statistics without individual issues.

### Strict Mode

```bash
bun run validate:strict
```

Exits with code 1 if any strict validators fail.

## 📝 Formatting Functions

The validator uses these formatting helpers:

```typescript
// Centered header with borders
formatHeader(title: string, subtitle?: string): string

// Section header with icon
formatSectionHeader(label: string, icon: string): string

// Severity badge
formatSeverityBadge(severity: string): string

// Status badge
formatStatusBadge(pass: boolean, strict: boolean): string

// Aligned metric
formatMetric(label: string, value: string, highlight?: boolean): string
```

## 🎯 Benefits

### Before Formatting

```
Validator: Codeblock Description Validator
✗ docs/example.md:42
   Codeblock missing description
   → typescript codeblock at line 42 has no desc= attribute
Files with issues: 1
```

### After Formatting

```
════════════════════════════════════════════════════════════════════════════════
📝  Codeblock Description Validator
════════════════════════════════════════════════════════════════════════════════

  [ERROR]  docs/example.md:42
           Codeblock missing description
           → typescript codeblock at line 42 has no desc= attribute

────────────────────────────────────────────────────────────────────────────────
  Files checked:       49
  Total issues:        1
    Errors:            1
    Warnings:          0
    Info:              0
  Strict issues:       1
  Status:              FAIL

Files with issues: 1

  • docs/example.md
```

**Improvements:**
- ✅ Clear section boundaries
- ✅ Visual severity indicators
- ✅ Aligned and organized metrics
- ✅ Professional appearance
- ✅ Easier to scan quickly
- ✅ Better CI/CD logs

## 🔧 Customization

### Change Width

```typescript
const WIDTH = 80; // Change to 100 for wider output
```

### Add Custom Colors

```typescript
const colors = {
  // Add new colors
  orange: "\x1b[38;5;208m",
  purple: "\x1b[38;5;129m",
};
```

### Custom Badges

```typescript
function formatCustomBadge(type: string): string {
  switch (type) {
    case "new":
      return `${colors.green}[NEW]${colors.reset}`;
    case "deprecated":
      return `${colors.yellow}[DEPRECATED]${colors.reset}`;
    default:
      return `[${type}]`;
  }
}
```

## 📈 CI/CD Integration

The formatted output works well in CI/CD pipelines:

```yaml
name: Validate Markdown
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run validate:strict
```

**Example GitHub Actions Output:**
- Clear section headers
- Color-coded severity (when supported)
- Aligned metrics for easy scanning
- Professional appearance in logs

## 🎨 Future Enhancements

Potential improvements:

- [ ] JSON output format for programmatic use
- [ ] HTML report generation
- [ ] Progress bars for large file sets
- [ ] Emoji-free mode for terminals without emoji support
- [ ] Custom themes via config file
- [ ] Summary diff between runs

---

**Last Updated:** April 14, 2026  
**Formatting Width:** 80 characters  
**Validators:** 3  
**Output Style:** Professional formatted text with color and alignment
