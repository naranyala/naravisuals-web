# Frontmatter Validator Guide

## Overview

The **Frontmatter Inspector** is a validator plugin that **exposes all frontmatter data** from every markdown file without strict validation rules. It helps LLM-code-agents understand article metadata and identify enrichment opportunities.

## 🎯 Purpose

Unlike other validators that enforce rules, the frontmatter validator:

- ✅ **Exposes** all frontmatter fields and values
- ✅ **Reports** which standard fields are present/missing
- ✅ **Identifies** placeholder or empty values
- ❌ **Does NOT fail** the build (not strict)
- ❌ **Does NOT enforce** specific frontmatter structure

## 📊 What It Tracks

### Standard Fields

These fields are tracked for presence/absence:

| Field | Type | Purpose |
|-------|------|---------|
| `title` | string | Article title |
| `description` | string | SEO/meta description |
| `sidebar_label` | string | Navigation label |
| `sidebar_position` | number | Sort order |

### Custom Fields

Any other frontmatter fields are captured and reported:

- `tags` - Array of tags
- `date` - Publication date
- `author` - Author name
- Any custom fields you add

## 🔍 Output Format

### Human-Readable (bun run validate)

```
════════════════════════════════════════════════════════════════════════════════
📊  Frontmatter Inspector
════════════════════════════════════════════════════════════════════════════════

────────────────────────────────────────────────────────────────────────────────
  Files checked:       49
  Total issues:        0
    Errors:            0
    Warnings:          0
    Info:              0
  Status:              PASS
```

### LLM-Ready JSON (bun run validate:llm)

```json
{
  "validators": [
    {
      "name": "frontmatter",
      "label": "Frontmatter Inspector",
      "filesChecked": 49,
      "totalIssues": 0,
      "errorCount": 0,
      "warningCount": 0,
      "infoCount": 0,
      "strictIssues": 0,
      "pass": true
    }
  ],
  "actionItems": [
    {
      "priority": "low",
      "action": "consider_enrichment",
      "file": "docs/example.md",
      "reason": "Missing 2 standard field(s): sidebar_label, sidebar_position",
      "howToFix": "Consider adding: sidebar_label: value, sidebar_position: value",
      "estimatedEffort": "quick"
    }
  ]
}
```

### Per-Article Frontmatter Data

Each article's frontmatter is exposed in the validator stats:

```json
{
  "stats": {
    "hasFrontmatter": true,
    "fieldCount": 4,
    "fields": ["title", "description", "sidebar_label", "sidebar_position"],
    "standardFields": {
      "present": ["title", "description"],
      "missing": ["sidebar_label", "sidebar_position"]
    },
    "data": {
      "title": "My Article",
      "description": "Article description",
      "sidebar_label": "My Article",
      "sidebar_position": 1
    }
  }
}
```

## 🤖 How LLM-Code-Agents Use This

### Example 1: Identify Missing Fields

**Validator Output:**
```json
{
  "reason": "Missing 2 standard field(s): sidebar_label, sidebar_position",
  "howToFix": "Consider adding: sidebar_label: My Label, sidebar_position: 5"
}
```

**LLM Action:**
```markdown
I'll add the missing frontmatter fields to `docs/example.md`:

```yaml
---
title: Existing Title
description: Existing description
sidebar_label: My Label          # Added
sidebar_position: 5              # Added
---
```
```

### Example 2: Find Placeholder Values

**Validator Output:**
```json
{
  "reason": "1 field(s) with empty/placeholder values: description",
  "howToFix": "Consider filling in these fields with actual content"
}
```

**LLM Action:**
```markdown
I'll replace the placeholder description with actual content:

Before:
description: TODO

After:
description: Learn how to use Blender's modeling tools for beginners
```

### Example 3: Standardize Frontmatter

**LLM sees:**
```
29 articles missing standard frontmatter fields
```

**LLM does:**
```markdown
I'll batch-update articles to add missing standard fields:

**Batch 1: Add sidebar metadata to scene organization articles**
- docs/03-scene-organization/02-reference-images.md
- docs/03-scene-organization/03-snapping-tools.md
- docs/03-scene-organization/04-origin-points.md

Adding:
  sidebar_label: [Auto-generated from title]
  sidebar_position: [Based on file order]
```

## 📋 Supported Frontmatter Formats

### Basic Key-Value

```yaml
---
title: My Title
description: My description
---
```

### Lists

```yaml
---
tags:
  - blender
  - 3d
  - modeling
---
```

### Inline Arrays

```yaml
---
tags: [blender, 3d, modeling]
---
```

### Numbers

```yaml
---
sidebar_position: 5
version: 2.0
---
```

### Booleans

```yaml
---
published: true
draft: false
---
```

## 🎨 Custom Fields

The validator captures **all** frontmatter fields, not just standard ones:

```yaml
---
title: Custom Example
custom_field: custom_value
another_field: another_value
nested:
  - item1
  - item2
---
```

**Reported in stats:**
```json
{
  "fieldCount": 5,
  "fields": ["title", "custom_field", "another_field", "nested"],
  "data": {
    "title": "Custom Example",
    "custom_field": "custom_value",
    "another_field": "another_value",
    "nested": ["item1", "item2"]
  }
}
```

## 🚀 Usage

### For Humans

```bash
# Standard validation (shows frontmatter status)
bun run validate

# Stats only
bun run validate:stats
```

### For LLM-Code-Agents

```bash
# LLM-friendly output with frontmatter data
bun run validate:llm
```

The JSON output includes full frontmatter data for each file in the `stats.data` field.

## 📊 Statistics Explained

| Stat | Type | Description |
|------|------|-------------|
| `hasFrontmatter` | boolean | Whether file has frontmatter |
| `fieldCount` | number | Total number of fields |
| `fields` | string[] | List of all field names |
| `standardFields.present` | string[] | Standard fields that exist |
| `standardFields.missing` | string[] | Standard fields that don't exist |
| `data` | object | Complete frontmatter data |

## 🔧 Validator Behavior

### Parsing Rules

1. **Strings** - Quoted or unquoted values
2. **Numbers** - Auto-detected integers and floats
3. **Booleans** - `true` or `false`
4. **Arrays** - Inline `[...]` or multi-line list
5. **Nested objects** - Not supported (flattened)

### Edge Cases

| Input | Result |
|-------|--------|
| `title: "My Title"` | `title: "My Title"` (quotes preserved if spaces) |
| `title: My Title` | `title: "My Title"` (quotes stripped) |
| `count: 42` | `count: 42` (number) |
| `count: "42"` | `count: "42"` (string, quotes force string) |
| `tags:` | `tags: []` (empty array) |
| `tags: [a, b]` | `tags: ["a", "b"]` |

## 📝 Best Practices for LLM-Code-Agents

1. **Check frontmatter first** - Understand article metadata before editing
2. **Fill missing standard fields** - Add title, description, sidebar fields
3. **Replace placeholders** - Fix TODO, FIXME, TBD values
4. **Preserve custom fields** - Don't remove non-standard fields
5. **Batch similar updates** - Update multiple files with same pattern

## 🎯 Example LLM Session

```
User: Check what frontmatter needs work

LLM: Running validator...

[Output from bun run validate:llm]

I found:
- 49 files with frontmatter
- 12 files missing standard fields
- 3 files with placeholder values

Top issues:
1. 8 files missing `sidebar_label`
2. 5 files missing `sidebar_position`
3. 3 files with `description: TODO`

Should I fix these?

User: Yes, please fix them

LLM: I'll batch-update the files...

[LLM makes edits in batches]

Verifying...

✅ All frontmatter issues resolved!
- Added sidebar_label to 8 files
- Added sidebar_position to 5 files
- Replaced 3 placeholder descriptions
```

## 🔍 Accessing Frontmatter Data Programmatically

For custom scripts:

```typescript
import { frontmatterValidator } from "./plugins/validators/frontmatter-validator.ts";

const content = fs.readFileSync("docs/example.md", "utf-8");
const result = frontmatterValidator.validate(content, "docs/example.md");

console.log(result.stats.data); // Full frontmatter object
console.log(result.stats.fields); // List of field names
```

---

**Last Updated:** April 14, 2026  
**Validator Name:** frontmatter  
**Label:** Frontmatter Inspector  
**Strict:** No (informational only)  
**Purpose:** Expose frontmatter data for LLM use
