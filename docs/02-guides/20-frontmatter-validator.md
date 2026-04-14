---
title: Frontmatter Validator Plugin
description: How the frontmatter validator analyzes YAML metadata and provides enrichment suggestions
sidebar_label: Frontmatter Validator
sidebar_position: 20
---

## Overview

The frontmatter validator plugin analyzes YAML frontmatter in markdown files and provides **informative, non-strict suggestions** for enrichment. It helps LLM code agents understand what metadata could be improved without blocking the build.

---

## What It Checks

The validator examines frontmatter and reports on:

### ✅ Required Fields (Informative)
- `title` - Document title
- `description` - SEO description (50-160 chars recommended)
- `sidebar_label` - Sidebar navigation label
- `sidebar_position` - Sort order in sidebar

### 💡 Optional Fields (Suggestions)
- `date` - Publication/update date
- `author` - Document author
- `tags` - Content organization tags

### 🔍 Custom Fields
- Reports any custom frontmatter fields found
- Confirms they are supported and preserved

---

## Validation Mode

**Mode:** `informative` (NEVER fails build)

**Severity:** All results are `info` level

**Purpose:** Help LLM agents identify enrichment opportunities

---

## Example Output

### Validation Report

```text:desc=Example text content
Frontmatter Enrichment (27 documents):
  • getting-started/project-overview    Long article (5 headings) without date/author metadata
  • guides/dependency-injection         Long article (12 headings) without date/author metadata
  • guides/dependency-injection         Comprehensive article (12 headings) without tags
  • guides/react-hooks                  Long article (21 headings) without date/author metadata
  • guides/react-hooks                  Comprehensive article (21 headings) without tags
  ... and 19 more
```

### LLM Task

```text:desc=Example text content
5. [MEDIUM] Enhance frontmatter metadata (title, description, tags, date, author)
   Files: getting-started/project-overview, guides/dependency-injection, guides/component-reference
   Example:
     ---
     title: My Article
     description: A comprehensive guide explaining...
     sidebar_label: My Article
     sidebar_position: 1
     date: 2026-04-14
     author: Author Name
     tags: [guide, tutorial]
     ---
```

---

## Detection Rules

### 1. No Frontmatter
**Trigger:** Document has no YAML frontmatter  
**Message:** "Document has no YAML frontmatter"  
**Suggestion:** Add frontmatter with title, description, and sidebar metadata

### 2. Missing Recommended Fields
**Trigger:** Missing any of: title, description, sidebar_label, sidebar_position  
**Message:** "Frontmatter missing X recommended field(s): ..."  
**Suggestion:** Add missing fields for better SEO and sidebar organization

### 3. Short Description
**Trigger:** Description exists but < 20 characters  
**Message:** "Description is very short (X chars)"  
**Suggestion:** Expand description to 50-160 characters for better SEO

### 4. Long Article Without Metadata
**Trigger:** Article has 5+ headings but no date/author  
**Message:** "Long article (X headings) without date/author metadata"  
**Suggestion:** Consider adding date and author fields for better documentation

### 5. No Tags for Comprehensive Articles
**Trigger:** Article has 10+ headings but no tags  
**Message:** "Comprehensive article (X headings) without tags"  
**Suggestion:** Add tags for better content organization and searchability

### 6. Custom Fields (Informational)
**Trigger:** Document has custom frontmatter fields  
**Message:** "Document has custom frontmatter fields: ..."  
**Suggestion:** Custom fields are supported and will be preserved

---

## Frontmatter Format

### Complete Example

```yaml:desc=Example YAML configuration
---
title: Build System
description: How the markdown-to-TypeScript build pipeline works
sidebar_label: Build System
sidebar_position: 3
date: 2026-04-14
author: Documentation Team
tags: [build, markdown, pipeline]
custom_field: custom_value
---
```

### Minimal Example

```yaml:desc=Example YAML configuration
---
title: Getting Started
description: Learn how to set up the project
---
```

### How It's Parsed

The validator extracts:
- **Known fields:** title, description, sidebar_label, sidebar_position, date, author, tags
- **Custom fields:** Any other key-value pairs are preserved
- **Arrays:** Tags can be YAML list or JSON array format
- **Numbers:** sidebar_position is parsed as integer

---

## LLM Code Agent Usage

### When to Add/Improve Frontmatter

**Priority:** MEDIUM

**When to act:**
1. Article has no frontmatter at all
2. Missing recommended fields
3. Description is too short
4. Long article (5+ headings) lacks date/author
5. Comprehensive article (10+ headings) lacks tags

### How to Fix

**Step 1: Add Basic Frontmatter**
```yaml:desc=Example YAML configuration
---
title: Document Title
description: A comprehensive description of this document (50-160 chars)
sidebar_label: Short Label
sidebar_position: 1
---
```

**Step 2: Add Metadata for Long Articles**
```yaml:desc=Example YAML configuration
---
title: React Hooks Reference
description: Complete guide to all 14 custom React hooks with examples
sidebar_label: React Hooks
sidebar_position: 5
date: 2026-04-14
author: Development Team
tags: [react, hooks, reference]
---
```

**Step 3: Add Custom Fields (Optional)**
```yaml:desc=Example YAML configuration
---
title: Advanced Configuration
description: Deep dive into configuration options
sidebar_label: Configuration
sidebar_position: 7
reviewed: 2026-04-01
status: draft
version: 2.0
---
```

---

## Benefits

### For SEO
✅ **Better descriptions** - 50-160 chars optimal for search snippets  
✅ **Title tags** - Clear document titles  
✅ **Metadata** - Date and author for credibility  

### For Organization
✅ **Sidebar ordering** - Consistent navigation  
✅ **Tags** - Content categorization  
✅ **Labels** - User-friendly navigation  

### For Documentation Quality
✅ **Author attribution** - Clear ownership  
✅ **Date tracking** - Freshness indicator  
✅ **Complete metadata** - Professional documentation  

---

## Current Project Status

### Frontmatter Coverage

```text:desc=Example text content
Total Articles: 19
With Frontmatter: 17 (89.5%)
Without Frontmatter: 2 (10.5%)

Missing Fields:
  title: 2 articles
  description: 2 articles
  sidebar_label: 15 articles
  sidebar_position: 15 articles
  date: 17 articles
  author: 17 articles
  tags: 19 articles
```

### Enrichment Opportunities

**HIGH Priority:**
- 2 articles missing basic frontmatter

**MEDIUM Priority:**
- 17 articles could add date/author
- 15 articles could add sidebar metadata
- 19 articles could benefit from tags

---

## How It Works

### Parsing Logic

```typescript:desc=Example TypeScript code
function parseFrontmatter(content: string): FrontmatterData {
  // Extract YAML between --- markers
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  
  // Parse each line
  for (const line of fmContent.split("\n")) {
    const colonIndex = line.indexOf(":");
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    
    // Categorize as known or custom
    if (knownFields.has(key)) {
      data[key] = parseValue(value);
    } else {
      custom[key] = value;
    }
  }
  
  return data;
}
```

### Validation Logic

```typescript:desc=Example TypeScript code
validate(docs) {
  for (const doc of docs) {
    const { data } = parseFrontmatter(doc.content);
    
    // Check for missing fields
    if (!data.title) missingFields.push("title");
    if (!data.description) missingFields.push("description");
    
    // Check description quality
    if (data.description && data.description.length < 20) {
      results.push({ /* short description warning */ });
    }
    
    // Check for long articles without metadata
    if (headingCount >= 5 && !data.date && !data.author) {
      results.push({ /* long article warning */ });
    }
  }
  
  return results;
}
```

---

## Files

**Plugin:**
- `scripts/plugins/validate-frontmatter.ts` - Frontmatter validator implementation

**Types:**
- `scripts/plugins/validate-types.ts` - Plugin interface definitions

**Runner:**
- `scripts/validate.mts` - Unified validation runner (includes frontmatter plugin)

---

## Example Use Cases

### Case 1: New Article
**Scenario:** Creating a new documentation article  
**Action:** Add complete frontmatter  
**Result:** Better SEO, sidebar organization, attribution

### Case 2: Existing Article
**Scenario:** Article has title/description but no date/author  
**Action:** Add missing metadata  
**Result:** Improved credibility and tracking

### Case 3: Comprehensive Guide
**Scenario:** 20-heading reference article  
**Action:** Add tags, date, author  
**Result:** Better organization and searchability

### Case 4: Custom Metadata
**Scenario:** Need to track review status  
**Action:** Add custom fields  
**Result:** Custom data preserved and reported

---

## Summary

The frontmatter validator plugin provides:

✅ **Informative checks** - Never fails build  
✅ **Clear suggestions** - Specific improvements  
✅ **LLM-friendly** - Actionable tasks with examples  
✅ **Flexible** - Supports custom fields  
✅ **SEO-focused** - Description quality checks  
✅ **Organization** - Tags and metadata tracking  

Run `bun run validate` to see frontmatter enrichment opportunities! 📝✨
