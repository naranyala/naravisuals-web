---
title: Validation Plugin System
description: How the unified plugin-based validation system works for markdown content
sidebar_label: Validation Plugins
sidebar_position: 17
---

## Overview

The project uses a **unified, plugin-based validation system** for markdown content. All validators are modular plugins that implement a common interface, making it easy to add new validation rules.

---

## Architecture

### Plugin System Structure

```text:desc=Example text content
scripts/
├── validate.mts                      # Unified validation runner
└── plugins/
    ├── validate-types.ts             # Plugin interface definitions
    ├── validate-codeblocks.ts        # Codeblock descriptions plugin
    ├── validate-admonitions.ts       # Admonitions plugin
    └── validate-footnotes.ts         # Footnotes plugin
```

### Plugin Interface

All validation plugins implement the `ValidatePlugin` interface:

```typescript:desc=Example TypeScript code
interface ValidatePlugin {
  name: string;                        // Unique plugin ID
  description: string;                 // Plugin description
  mode: "strict" | "informative";     // Validation mode
  validate(docs: Document[]): ValidationResult[];
  computeMetrics?(content: string, slug: string): Partial<DocumentMetrics>;
}
```

### Validation Modes

**🔒 Strict Mode:**
- **FAILS the build** if validation fails
- Used for critical requirements (e.g., codeblock descriptions)
- Run with: `bun run validate:strict`

**📋 Informative Mode:**
- **Reports only** - never fails build
- Used for enrichment suggestions (e.g., admonitions, footnotes)
- Run with: `bun run validate:info`

---

## Available Plugins

### 1. Codeblock Descriptions (🔒 STRICT)

**File:** `scripts/plugins/validate-codeblocks.ts`

**What it validates:**
- ✅ Every codeblock MUST have `:desc=` metadata
- ❌ Build **FAILS** if any codeblock missing description

**Example:**

❌ **Will fail** (no `:desc=` metadata):
```text:desc=Example showing codeblock WITHOUT :desc= metadata (this will fail validation)
const x = 1;
```

✅ **Will pass:**
```typescript:desc=Variable declaration example
const x = 1;
```

**Codeblock Type Detection:**
- 📊 Mermaid diagrams
- 💻 Programming languages (TypeScript, JavaScript, Python, etc.)
- 📋 Data formats (JSON, YAML, XML, etc.)
- 📝 Markup languages (HTML, Markdown, LaTeX)
- ⚡ Shell/Scripts (Bash, Zsh, PowerShell)
- 📄 Plain text

---

### 2. Admonitions (📋 INFORMATIVE)

**File:** `scripts/plugins/validate-admonitions.ts`

**What it validates:**
- ℹ️ Reports admonition usage per document
- ℹ️ Suggests adding admonitions if none found
- ✅ **NEVER fails build**

**Supported Types:**
- `:::note` - General information
- `:::tip` - Helpful suggestions
- `:::warning` - Important cautions
- `:::danger` - Critical warnings
- `:::info` - Background context
- `:::caution` - Safety notices

**Example Output:**
```text:desc=Example text content
ℹ️ guides/react-hooks: Document has no admonitions (21 headings)
   💡 Consider adding :::note, :::tip, or :::warning for context
```

---

### 3. Footnotes (📋 INFORMATIVE)

**File:** `scripts/plugins/validate-footnotes.ts`

**What it validates:**
- ℹ️ Reports footnote usage per document
- ℹ️ Suggests adding footnotes for long articles (3+ headings)
- ✅ **NEVER fails build**

**Syntax:**
```markdown:desc=Example markdown syntax
Text with footnote[^1]

[^1]: Footnote content here
```

**Example Output:**
```text:desc=Example text content
ℹ️ guides/react-hooks: Document has no footnotes (21 headings)
   💡 Consider adding [^1]: Reference for additional sources
```

---

## Usage

### Run All Validators

```bash:desc=Example shell command
bun run validate
```

**Output:**
- ✅ Strict validation results (errors)
- ℹ️ Informative recommendations
- 📊 Per-document metrics table

### Run Strict Only

```bash:desc=Example shell command
bun run validate:strict
```

Shows only strict validation errors (will fail build).

### Run Informative Only

```bash:desc=Example shell command
bun run validate:info
```

Shows only enrichment suggestions (never fails).

### List Plugins

```bash:desc=Example shell command
bun run validate:list
```

Shows all available validation plugins and their modes.

---

## Adding New Validation Plugins

### Step 1: Create Plugin File

Create `scripts/plugins/validate-your-validator.ts`:

```typescript:desc=Example TypeScript code
import type { ValidatePlugin, ValidationResult, DocumentMetrics } from "./validate-types.ts";

export const yourValidatorPlugin: ValidatePlugin = {
  name: "your-validator",
  description: "Validates something useful",
  mode: "informative", // or "strict"

  validate(docs) {
    const results: ValidationResult[] = [];

    for (const doc of docs) {
      // Your validation logic here
      if (/* validation fails */) {
        results.push({
          id: "your-rule-id",
          file: doc.slug,
          line: lineNumber,
          severity: "error", // or "warning" or "info"
          rule: "your-rule",
          message: "Description of the issue",
          suggest: "How to fix it",
        });
      }
    }

    return results;
  },

  computeMetrics(content, slug) {
    // Return metrics for this document
    return {
      // Your custom metrics
    };
  },
};
```

### Step 2: Register Plugin

Edit `scripts/validate.mts` and add your plugin:

```typescript:desc=Example TypeScript code
import { yourValidatorPlugin } from "./plugins/validate-your-validator.ts";

const plugins: ValidatePlugin[] = [
  codeblockDescriptionsPlugin,
  admonitionsPlugin,
  footnotesPlugin,
  yourValidatorPlugin,  // ← Add here
];
```

### Step 3: Test

```bash:desc=Example shell command
bun run validate
```

---

## Per-Document Metrics

The validator automatically tracks these metrics for each document:

| Metric | Description |
|--------|-------------|
| **Code** | Total codeblocks |
| **Diag** | Mermaid diagrams |
| **Note** | Admonitions (:::type blocks) |
| **Foot** | Footnotes/references |
| **Head** | Headings (h2, h3) |

**Example Output:**
```text:desc=Example text content
📋 Per-Document Metrics
Doc                              Code Diag Note Foot Head
 guides/react-hooks               17    0    1    0   21
 guides/cli-reference             17    1    1    0   18
 TOTAL                            134   23   23    0  204
```

---

## Integration with Build Process

The build script (`scripts/build-docs.mts`) also displays per-document metrics:

```bash:desc=Example shell command
bun run build:docs
```

**Shows:**
- Codeblock type distribution
- Admonition counts
- Enrichment recommendations
- Per-document metrics table

---

## Current Project Status

### Strict Validation
```text:desc=Example text content
✅ Codeblock Descriptions: 132/132 (98.5% coverage)
   Status: 1 codeblock missing description in guides/build-statistics.md
```

### Informative Metrics
```text:desc=Example text content
📊 Admonitions: 23 total (1.4 avg/article)
📊 Mermaid Diagrams: 23 total (1.4 avg/article)
📊 Footnotes: 0 total
   Status: 16 articles could benefit from footnotes
```

---

## How LLM Code Agents Should Use This

### When Adding Content

**1. Codeblocks (STRICT):**
```text:desc=Example text content
LLM: "I'll add a code example"
     ```typescript:desc=Example code
     const x = 1;
     ```
     ✅ Codeblock has description"
```

**2. Admonitions (INFORMATIVE):**
```text:desc=Example text content
LLM: "Running validation..."
     "ℹ️ Article has no admonitions"
     "I'll add :::note and :::tip for clarity"
     ":::note
     This is important context.
     :::
     Added 2 admonitions"
```

**3. Footnotes (INFORMATIVE):**
```text:desc=Example text content
LLM: "ℹ️ Long article (1000+ words) without footnotes"
     "I'll add a reference here[^1]"
     "[^1]: React documentation"
```

### Validation Workflow

```bash:desc=Example shell command
# After making changes
bun run validate

# Check strict only (must pass)
bun run validate:strict

# Check enrichment opportunities
bun run validate:info
```

---

## Benefits of Plugin Architecture

✅ **Modular** - Easy to add/remove validators  
✅ **Unified** - Single command runs all validators  
✅ **Flexible** - Strict vs informative modes  
✅ **Extensible** - Common interface for plugins  
✅ **Metrics** - Automatic per-document tracking  
✅ **LLM-Friendly** - Clear suggestions for agents  

---

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/validate.mts` | Main validation runner |
| `scripts/plugins/validate-types.ts` | Plugin interface definitions |
| `scripts/plugins/validate-codeblocks.ts` | Codeblock descriptions validator |
| `scripts/plugins/validate-admonitions.ts` | Admonitions usage reporter |
| `scripts/plugins/validate-footnotes.ts` | Footnotes usage reporter |

---

## Summary

The unified validation system provides:

- ✅ **Plugin-based architecture** - Easy to extend
- ✅ **Strict validation** - Codeblock descriptions enforced
- ✅ **Informative metrics** - Admonitions, footnotes tracked
- ✅ **Per-document tracking** - Metrics for each article
- ✅ **LLM-friendly** - Clear, actionable suggestions

Run `bun run validate` to see the complete analysis! 📊✨
