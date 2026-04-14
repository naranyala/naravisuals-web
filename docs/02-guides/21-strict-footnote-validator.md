---
title: Strict Footnote/Reference Validator
description: How the footnote validator enforces strict syntax rules for footnote references and definitions
sidebar_label: Strict Footnote Validator
sidebar_position: 21
---

## Overview

The footnote validator now operates in **STRICT mode** - it will **FAIL THE BUILD** if footnote syntax is incorrect. This ensures all footnotes are properly formatted and cross-referenced.

---

## Strict Rules (Build Will FAIL)

### Rule 1: No Undefined References

**❌ FAILS:**
```markdown:desc=Example markdown syntax
This text references a footnote[^undefined].

[Note: ^undefined is never defined anywhere!]
```

**✅ PASSES:**
```markdown:desc=Example markdown syntax
This text references a footnote[^defined].

[^defined]: This is the definition of the footnote.
```

**Error Message:**
```text:desc=Example text content
✗ Line  14  Footnote reference [^undefined] has no corresponding definition
  💡 Add a definition: [^undefined]: Your footnote content here
```

---

### Rule 2: No Unused Definitions

**❌ FAILS:**
```markdown:desc=Example markdown syntax
[^unused]: This definition exists but is never referenced in the text.

[No [^unused] reference appears anywhere in the document!]
```

**✅ PASSES:**
```markdown:desc=Example markdown syntax
This references the footnote[^used].

[^used]: This definition is properly referenced.
```

**Error Message:**
```text:desc=Example text content
✗ Line  20  Footnote definition [^unused] is never referenced
  💡 Either remove the definition or add a reference [^unused] in the text
```

---

### Rule 3: No Duplicate Definitions

**❌ FAILS:**
```markdown:desc=Example markdown syntax
[^dup]: First definition of this footnote.

Some text[^dup].

[^dup]: Second definition of the same footnote (ERROR!).
```

**✅ PASSES:**
```markdown:desc=Example markdown syntax
[^single]: Definition of this footnote.

Some text[^single].

[Only defined once - correct!]
```

**Error Message:**
```text:desc=Example text content
✗ Line  34  Footnote [^dup] is defined 2 times (lines 30, 34)
  💡 Remove duplicate definitions - each footnote should be defined only once
```

---

### Rule 4: Valid Footnote Names Only

**❌ FAILS:**
```markdown:desc=Example markdown syntax
This has invalid characters[^invalid name!].

[^invalid name!]: Names can only use alphanumeric, hyphens, underscores.
```

**✅ PASSES:**
```markdown:desc=Example markdown syntax
This uses valid characters[^valid-name].

[^valid-name]: Only letters, numbers, hyphens, and underscores allowed.
```

**Error Message:**
```text:desc=Example text content
✗ Line  52  Footnote name [^invalid name!] contains invalid characters
  💡 Use only alphanumeric, hyphens, and underscores (e.g., [^note-1] or [^ref_2])
```

---

## Informative Suggestions (Never Fails Build)

### Suggestion 1: Add Footnotes to Long Articles

**Trigger:** Article has 3+ headings but no footnotes

**Message:**
```text:desc=Example text content
ℹ️ Document has no footnotes (12 headings)
  💡 Consider adding [^1]: Reference for additional sources
```

---

### Suggestion 2: Use Descriptive Names

**Trigger:** Using numeric footnote names like `[^1]` (escaped), `[^2]` (escaped)

**Message:**
```text:desc=Example text content
ℹ️ Using numeric footnote names (3 found)
  💡 Consider using descriptive names like [^source] or [^example] instead of [^1]
```

**Better Practice:**
```markdown:desc=Example markdown syntax
# Instead of this:
Text with footnote[^1].
[^1]: Source URL

# Use this:
Text with footnote[^source-url].
[^source-url]: https://example.com
```

---

## Correct Footnote Syntax

### Basic Format

```markdown:desc=Example markdown syntax
Reference in text[^footnote-name].

[^footnote-name]: Definition of the footnote goes here.
```

### Multi-line Definitions

```markdown:desc=Example markdown syntax
Longer explanation[^detailed].

[^detailed]: This is a longer footnote definition
  that can span multiple lines.
  
  It can even have multiple paragraphs!
```

### Named vs Numeric

```markdown:desc=Example markdown syntax
# Numeric (not recommended):
Text[^1], more text[^2].

[^1]: First footnote
[^2]: Second footnote

# Descriptive (recommended):
Text[^source], more text[^example].

[^source]: https://example.com
[^example]: This is an example
```

---

## LLM Code Agent Usage

### Priority: CRITICAL

**When validator fails:**
1. Read the error message
2. Fix the specific issue
3. Re-run validation

**Example Workflow:**
```text:desc=Example text content
LLM: "Footnote validation failed. Let me fix the errors..."

Error: Footnote reference [^undefined] has no corresponding definition
Fix: Add definition at bottom of file
  [^undefined]: This is the missing definition.

Error: Footnote definition [^unused] is never referenced
Fix: Either remove definition or add reference in text
  Option 1: Remove the definition line
  Option 2: Add [^unused] somewhere in the text

Error: Footnote [^dup] is defined 2 times
Fix: Remove duplicate definition, keep only one

Validation passed! ✓
```

---

## Common Mistakes & Fixes

### Mistake 1: Typo in Footnote Name

**Wrong:**
```markdown:desc=Example markdown syntax
Text[^refernce].

[^reference]: Definition with different spelling!
```

**Fix:** Make names match exactly
```markdown:desc=Example markdown syntax
Text[^reference].

[^reference]: Definition matches exactly.
```

---

### Mistake 2: Space in Footnote Name

**Wrong:**
```markdown:desc=Example markdown syntax
Text[^my footnote].

[^my footnote]: Spaces not allowed in names!
```

**Fix:** Use hyphens or underscores
```markdown:desc=Example markdown syntax
Text[^my-footnote].

[^my-footnote]: Use hyphens instead of spaces.
```

---

### Mistake 3: Forgetting the Colon in Definition

**Wrong:**
```markdown:desc=Example markdown syntax
Text[^note].

[^note] Missing colon after bracket!
```

**Fix:** Add colon
```markdown:desc=Example markdown syntax
Text[^note].

[^note]: Colon is required after the bracket.
```

---

### Mistake 4: Definition in Wrong Place

**Wrong:**
```markdown:desc=Example markdown syntax
[^note]: Definitions at top of file before any text
are confusing.

Here is the actual content that should reference [^note].
```

**Fix:** Put definition after or near reference
```markdown:desc=Example markdown syntax
Here is the content that references the footnote[^note].

[^note]: Definition placed after the reference - much clearer!
```

---

## Validator Output Example

### Failing Build

```text:desc=Example text content
╔═══════════════════════════════════════════════════╗
║  ❌ Validation Errors                              ║
╚═══════════════════════════════════════════════════╝

📄 guides/example-article
   ────────────────────────────────────────────────────────────
  ✗ Line  14  Footnote reference [^undefined] has no corresponding definition
     💡 Add a definition: [^undefined]: Your footnote content here
  ✗ Line  34  Footnote [^duplicate] is defined 2 times (lines 30, 34)
     💡 Remove duplicate definitions - each footnote should be defined only once

✖ Validation failed. Please fix the errors above.
error: script "validate" exited with code 1
```

### Passing Build

```text:desc=Example text content
┌─────────────────────────────────────────────────┐
│  Validation Summary                            │
├─────────────────────────────────────────────────┤
│ 🔒 footnotes                      ✓ Pass │
└─────────────────────────────────────────────────┘

✓ All validations passed!
```

---

## Best Practices

### ✅ Do

- Use descriptive names: `[^source-url]` (escaped), `[^example-case]` (escaped)
- Define footnotes at bottom of file
- Keep definitions concise
- Reference before defining
- One definition per footnote name

### ❌ Don't

- Use numeric names when descriptives work better
- Define footnotes you never reference
- Reference footnotes you never define
- Use spaces or special characters in names
- Define the same footnote twice

---

## How It Works

### Detection Logic

```typescript:desc=Example TypeScript code
function extractFootnotes(content: string) {
  // Find all references: [^name]
  const refRegex = /\[\^([\w-]+)\]/g;
  
  // Find all definitions: [^name]: content
  const defRegex = /^\s*\[\^([\w-]+)\]:\s*(.+)$/;
  
  // Validate each matches the other
  // Report mismatches as errors
}
```

### Validation Flow

```text:desc=Example text content
1. Extract all footnote references [^name]
2. Extract all footnote definitions [^name]: content
3. Check every reference has a definition
4. Check every definition has a reference
5. Check no duplicates exist
6. Check names are valid (alphanumeric + hyphens/underscores)
7. Report errors (strict) or suggestions (informative)
```

---

## Integration with Build

### Strict Mode

```bash:desc=Example bash command
bun run validate:strict
```
- **Fails build** if any footnote errors
- Returns exit code 1
- Shows specific line numbers and fixes

### Informative Mode

```bash:desc=Example bash command
bun run validate:info
```
- **Never fails** build
- Shows enrichment suggestions
- Best practice recommendations

### Full Validation

```bash:desc=Example bash command
bun run validate
```
- Runs all validators including footnotes
- Shows both errors and suggestions
- Best for CI/CD pipelines

---

## Summary

The strict footnote validator ensures:

✅ **No broken references** - Every `[^name]` (example) has a definition  
✅ **No orphaned definitions** - Every `[^name]:` is referenced  
✅ **No duplicates** - Each footnote defined exactly once  
✅ **Valid names** - Only alphanumeric, hyphens, underscores  
✅ **Clear errors** - Exact line numbers and fix suggestions
✅ **LLM-friendly** - Actionable tasks with examples

**Result:** Professional, well-formatted documentation with reliable footnotes! 📝✨

<!-- 
  NOTE: This file contains intentional examples of broken footnote syntax
  to demonstrate the strict validator. Run dev server with --skip-validation
  when working on this file:
  
  bun run dev --skip-validation
-->
