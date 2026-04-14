# Markdown Validator Plugin System

## Overview

This project uses a **unified, extensible plugin system** for validating markdown content. The system is built on a flexible module architecture that allows easy addition of new validators as plugins.

## 🏗️ Architecture

```
scripts/plugins/
├── validators/
│   ├── index.ts                    # Validator registry
│   ├── codeblock-validator.ts      # STRICT: Codeblock descriptions
│   ├── admonition-validator.ts     # INFO: Admonition tracking
│   ├── reference-validator.ts      # STRICT: References/footnotes
│   └── types.ts                    # TypeScript interfaces
├── index.ts                        # Plugin exports
├── types.ts                        # Plugin interfaces
├── admonitions.ts                  # Markdown transform plugin
├── mermaid.ts                      # Mermaid diagram plugin
└── math.ts                         # MathJax plugin

scripts/
└── validate-all.mts                # Unified validation runner
```

## 🔌 Plugin System

### Validator Interface

```typescript
export interface MarkdownValidator {
  /** Unique validator name */
  name: string;
  
  /** Human-readable label */
  label: string;
  
  /** Validate a single markdown file */
  validate(content: string, filePath: string): ValidationResult;
  
  /** Whether validation should fail the build */
  isStrict?: boolean;
}

export interface ValidationResult {
  /** Number of items checked */
  checked: number;
  /** Issues found */
  issues: ValidationIssue[];
  /** Statistics for reporting */
  stats?: Record<string, number>;
}

export interface ValidationIssue {
  severity: "error" | "warning" | "info";
  file: string;
  line?: number;
  message: string;
  detail?: string;
}
```

### Registering New Validators

To add a new validator:

1. **Create validator file** in `scripts/plugins/validators/`:

```typescript
// my-validator.ts
import type { MarkdownValidator, ValidationResult, ValidationIssue } from "./types.ts";

export const myValidator: MarkdownValidator = {
  name: "my-validator",
  label: "My Custom Validator",
  isStrict: false, // or true for strict validation

  validate(content: string, filePath: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    
    // Your validation logic here
    if (someCondition) {
      issues.push({
        severity: "warning",
        file: filePath,
        line: lineNumber,
        message: "Issue found",
        detail: "How to fix it",
      });
    }

    return {
      checked: count,
      issues,
      stats: { metric1: value1, metric2: value2 },
    };
  },
};

export default myValidator;
```

2. **Register in index.ts**:

```typescript
// scripts/plugins/validators/index.ts
import { codeblockValidator } from "./codeblock-validator.ts";
import { admonitionValidator } from "./admonition-validator.ts";
import { referenceValidator } from "./reference-validator.ts";
import { myValidator } from "./my-validator.ts"; // NEW

export const validators: MarkdownValidator[] = [
  codeblockValidator,
  admonitionValidator,
  referenceValidator,
  myValidator, // NEW
];
```

3. **Run validation**:

```bash
bun run validate
```

## 📊 Current Validators

### 1. Codeblock Description Validator (STRICT)

**File:** `codeblock-validator.ts`  
**Strict:** ✅ Yes - Fails build if violations found  
**Purpose:** Ensures all codeblocks have `:desc=` metadata

**Checks:**
- Every codeblock has a description
- Categorizes codeblocks (Mermaid, Text/TXT, Shell, etc.)
- Reports statistics per category

**Example Issue:**
```
✗ docs/example.md:42
   Codeblock missing description
   → typescript codeblock at line 42 has no desc= attribute
```

### 2. Admonition Tracker (INFORMATIONAL)

**File:** `admonition-validator.ts`  
**Strict:** ❌ No - Only informs/suggests  
**Purpose:** Tracks admonition usage and suggests enrichment

**Checks:**
- Counts admonitions by type (tip, note, warning, etc.)
- Identifies articles with zero admonitions
- Validates admonition types are supported

**Example Issue:**
```
ℹ docs/example.md
   No admonitions found - enrichment candidate
   → Consider adding :::tip, :::warning, :::note for context and clarity
```

### 3. Reference & Footnote Validator (STRICT)

**File:** `reference-validator.ts`  
**Strict:** ✅ Yes - Fails build if violations found  
**Purpose:** Ensures references and footnotes are complete

**Checks:**
- External links have References section
- Citation markers have footnote definitions
- Footnote reference/definition counts match

**Example Issue:**
```
✗ docs/example.md
   External links (3) but no References section
   → Add a ## References or ## See Also section at the end of the article
```

## 🚀 Usage

### Run All Validators

```bash
# Standard validation (shows all issues)
bun run validate

# Strict mode (exits with code 1 on strict violations)
bun run validate:strict

# Stats only (summary without details)
bun run validate:stats
```

### Command Line Flags

```bash
bun run scripts/validate-all.mts          # Run all validators
bun run scripts/validate-all.mts --strict # Exit on first strict failure
bun run scripts/validate-all.mts --stats  # Show only summary stats
```

### Example Output

```
🔍 Unified Markdown Validator
Validators: codeblock-descriptions, admonitions, references

Scanning 49 markdown files...

════════════════════════════════════════════════════════════
Validator: Codeblock Description Validator
════════════════════════════════════════════════════════════

  (no issues - all codeblocks have descriptions)

Files with issues: 0

════════════════════════════════════════════════════════════
Validator: Admonition Tracker
════════════════════════════════════════════════════════════

  ℹ docs/03-scene-organization/02-reference-images.md
     No admonitions found - enrichment candidate
     → Consider adding :::tip, :::warning, :::note for context and clarity

Files with issues: 29

════════════════════════════════════════════════════════════
Validator: Reference & Footnote Validator
════════════════════════════════════════════════════════════

  ✗ docs/01-getting-started/01-blender-roadmap-overview.md
     External links (1) but no References section
     → Add a ## References or ## See Also section at the end of the article

Files with issues: 2

════════════════════════════════════════════════════════════
📊 Overall Summary
════════════════════════════════════════════════════════════

  ✓ codeblock-descriptions: 0 issues 
  ✓ admonitions: 29 issues 
  ✗ references: 2 issues (STRICT)

  Total: 2 errors, 0 warnings

⚠ Build succeeded but has 2 error(s) to fix
```

## 🎯 Severity Levels

| Severity | Color | Build Impact | Use Case |
|----------|-------|--------------|----------|
| **error** | 🔴 Red | May fail strict validation | Critical issues |
| **warning** | 🟡 Yellow | Informational | Potential improvements |
| **info** | 🔵 Cyan | Informational | Suggestions for enrichment |

## 🔧 Validation Pipeline

### How It Works

1. **Scan** all markdown files in `docs/` directory
2. **Run** each validator sequentially on each file
3. **Collect** issues and statistics
4. **Report** per-validator and overall summaries
5. **Exit** with appropriate code based on strict mode

### Exit Codes

| Condition | Exit Code |
|-----------|-----------|
| All validations pass | `0` |
| Has errors but not strict mode | `0` |
| Has strict violations in strict mode | `1` |

## 📝 Creating Custom Validators

### Example: Word Count Validator

```typescript
// word-count-validator.ts
import type { MarkdownValidator, ValidationResult, ValidationIssue } from "./types.ts";

export const wordCountValidator: MarkdownValidator = {
  name: "word-count",
  label: "Word Count Checker",
  isStrict: false,

  validate(content: string, filePath: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    const words = content.split(/\s+/).filter((w) => w.length > 0).length;

    if (words < 100) {
      issues.push({
        severity: "warning",
        file: filePath,
        message: `Article has only ${words} words`,
        detail: "Consider expanding to at least 300 words for better coverage",
      });
    }

    return {
      checked: 1,
      issues,
      stats: { wordCount: words },
    };
  },
};

export default wordCountValidator;
```

### Example: Image Alt Text Validator

```typescript
// image-alt-validator.ts
import type { MarkdownValidator, ValidationResult, ValidationIssue } from "./types.ts";

export const imageAltValidator: MarkdownValidator = {
  name: "image-alt-text",
  label: "Image Alt Text Validator",
  isStrict: true,

  validate(content: string, filePath: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      // Match images without alt text: ![](...)
      const match = lines[i].match(/!\[\]\([^)]+\)/);
      if (match) {
        issues.push({
          severity: "error",
          file: filePath,
          line: i + 1,
          message: "Image missing alt text",
          detail: "Add descriptive alt text: ![Description](image.png)",
        });
      }
    }

    return {
      checked: lines.length,
      issues,
      stats: { imagesWithoutAlt: issues.length },
    };
  },
};

export default imageAltValidator;
```

## 🧩 Plugin Types

The system supports two types of plugins:

### 1. Markdown Transform Plugins

**Location:** `scripts/plugins/*.ts`  
**Purpose:** Transform markdown content during build  
**Interface:** `MarkdownPlugin`

**Examples:**
- `admonitions.ts` - Converts `:::tip` blocks to HTML
- `mermaid.ts` - Renders Mermaid diagrams
- `math.ts` - Processes MathJax equations

**Pipeline:**
```
raw .md → preProcess() → marked → postProcess() → output
```

### 2. Validators

**Location:** `scripts/plugins/validators/*.ts`  
**Purpose:** Validate markdown content quality  
**Interface:** `MarkdownValidator`

**Examples:**
- `codeblock-validator.ts` - Checks codeblock descriptions
- `admonition-validator.ts` - Tracks admonition usage
- `reference-validator.ts` - Validates references/footnotes

**Pipeline:**
```
raw .md → validate() → issues + stats → report
```

## 📈 Statistics & Reporting

Each validator can return statistics for reporting:

```typescript
return {
  checked: 42,
  issues: [...],
  stats: {
    total: 42,
    withDescription: 40,
    withoutDescription: 2,
    Mermaid_total: 10,
    Text_TXT_total: 30,
    Shell_Terminal_total: 2,
  },
};
```

These stats are aggregated and can be used for:
- CI/CD dashboards
- Quality trend tracking
- Content improvement planning

## 🎨 Customization

### Change Validator Severity

```typescript
// Make admonitions strict
export const admonitionValidator: MarkdownValidator = {
  name: "admonitions",
  label: "Admonition Tracker",
  isStrict: true, // Changed from false
  // ...
};
```

### Add Validator Options

```typescript
export interface WordCountOptions {
  minimumWords: number;
  strictMode: boolean;
}

export function createWordCountValidator(options: WordCountOptions): MarkdownValidator {
  return {
    name: "word-count",
    label: "Word Count Checker",
    isStrict: options.strictMode,
    validate(content: string, filePath: string): ValidationResult {
      // Use options.minimumWords
    },
  };
}
```

### Conditional Validation

```typescript
// Only validate articles in specific sections
if (filePath.includes("/guides/")) {
  // Apply stricter checks
}
```

## 🔍 Testing Validators

### Manual Testing

```bash
# Run validator on single file
bun run scripts/validate-all.mts --stats | grep "your-file.md"

# Test specific validator
# Add console.log to validator code and run:
bun run validate
```

### Automated Testing

Add to CI/CD:

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

## 📚 Best Practices

### For Validator Authors

1. **Return accurate stats** - Enable meaningful reporting
2. **Use appropriate severity** - error for critical, info for suggestions
3. **Include line numbers** - Help users find issues quickly
4. **Provide actionable details** - Explain how to fix issues
5. **Keep validators fast** - Avoid expensive operations

### For Users

1. **Run validate before commits** - Catch issues early
2. **Use strict mode in CI** - Prevent regressions
3. **Review info-level issues** - Improve content quality
4. **Add custom validators** - Extend for project needs

## 🗂️ File Structure Summary

```
scripts/
├── plugins/
│   ├── validators/
│   │   ├── index.ts                    # Registry
│   │   ├── codeblock-validator.ts      # STRICT
│   │   ├── admonition-validator.ts     # INFO
│   │   ├── reference-validator.ts      # STRICT
│   │   └── types.ts                    # Interfaces
│   ├── index.ts                        # Plugin exports
│   ├── types.ts                        # Plugin interfaces
│   ├── admonitions.ts                  # Transform plugin
│   ├── mermaid.ts                      # Transform plugin
│   └── math.ts                         # Transform plugin
├── validate-all.mts                    # Runner
├── build-docs.mts                      # Build script
└── cli.mts                             # CLI interface
```

## 🚀 Future Enhancements

Potential improvements:

- [ ] Parallel validation for faster execution
- [ ] Incremental validation (only changed files)
- [ ] Auto-fix for common issues
- [ ] Validator configuration files
- [ ] Integration with IDE extensions
- [ ] Historical trend reporting
- [ ] Custom validator plugins via npm packages

---

**Last Updated:** April 14, 2026  
**Total Validators:** 3  
**Total Validators Registered:** 3 (codeblock, admonition, reference)  
**Build Status:** ✅ Passing (2 strict errors to fix)
