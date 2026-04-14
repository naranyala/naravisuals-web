# Strict Reference & Footnote Validator

## Overview

The Reference & Footnote Validator enforces **strict validation** for all references, external links, and footnotes in markdown content. This validator **will fail the build** if violations are found.

## 🔒 Strict Rules

### 1. External Links Require References Section

**Rule:** If an article has external links, it MUST have a References/See Also section.

**Valid:**
```markdown
Content with [Blender](https://blender.org) link.

## References

- [Blender Official](https://blender.org) - Official website
```

**Invalid:**
```markdown
Content with [Blender](https://blender.org) link.
# No references section
```

**Error:**
```
[ERROR] docs/example.md
   1 external link(s) but no References section
   → Add a ## References or ## See Also section at the end of the article with link entries
```

### 2. External Links Must Be Valid URLs

**Rule:** All external links must start with `http://` or `https://`.

**Valid:**
```markdown
[Blender](https://blender.org)
```

**Invalid:**
```markdown
[Blender](blender.org)
[Blender](www.blender.org)
```

**Error:**
```
[ERROR] docs/example.md:42
   Invalid external URL: blender.org
   → External links must start with http:// or https://
```

### 3. References Section Must Have Entries

**Rule:** If a References section exists and article has external links, it must contain actual link entries.

**Valid:**
```markdown
## References

- [Blender](https://blender.org)
- [Documentation](https://docs.blender.org)
```

**Invalid:**
```markdown
## References

(Empty section with no links)
```

**Error:**
```
[ERROR] docs/example.md:100
   References section exists but has no link entries
   → Found 3 external link(s) but reference section has 0 entries. Add links as list items: - [Name](URL)
```

### 4. Footnote References Must Have Definitions

**Rule:** Every `[^id]` reference must have a matching `[^id]:` definition.

**Valid:**
```markdown
This is a fact[^1].

[^1]: Source description
```

**Invalid:**
```markdown
This is a fact[^1].
# No definition
```

**Error:**
```
[ERROR] docs/example.md:42
   Footnote reference [^1] has no matching definition
   → Add definition: [^1]: Source description
```

### 5. Footnote Definitions Must Be Referenced

**Rule:** Every `[^id]:` definition must be referenced in the text.

**Valid:**
```markdown
This is a fact[^1].

[^1]: Source description
```

**Invalid:**
```markdown
Content without footnote reference.

[^1]: Orphaned definition
```

**Error:**
```
[ERROR] docs/example.md:100
   Footnote definition [^1]: is never referenced
   → Remove unused footnote definitions or add references in the text
```

### 6. No Empty Footnote Definitions

**Rule:** Footnote definitions must contain text content.

**Valid:**
```markdown
[^1]: Source description
```

**Invalid:**
```markdown
[^1]:
```

**Error:**
```
[ERROR] docs/example.md:100
   Empty footnote definition: [^1]
   → Footnote definitions must contain text content
```

### 7. No Duplicate Footnote Identifiers

**Rule:** Each footnote identifier must be unique.

**Invalid:**
```markdown
[^1]: First definition
[^1]: Second definition  # Duplicate!
```

**Error:**
```
[ERROR] docs/example.md:101
   Duplicate footnote definition: [^1]:
   → Each footnote identifier must be unique
```

### 8. Reference/Definition Counts Must Match

**Rule:** Total footnote references must equal total definitions (only checked if no orphaned issues).

**Error:**
```
[ERROR] docs/example.md
   Footnote reference count (3) != definition count (2)
   → Ensure every [^ref] has a matching [^ref]: definition
```

## 📊 Validation Stats

The validator reports detailed statistics:

```json
{
  "stats": {
    "externalLinks": 5,
    "invalidUrls": 0,
    "internalLinks": 10,
    "hasReferencesSection": true,
    "referencesSectionEntries": 5,
    "footnoteReferences": 3,
    "footnoteDefinitions": 3,
    "orphanedFootnoteRefs": 0,
    "orphanedFootnoteDefs": 0,
    "duplicateIdentifiers": 0
  }
}
```

## 🎨 Supported Reference Section Headers

The validator recognizes these section headers:

- `## References`
- `### References`
- `## See Also`
- `## Further Reading`
- `## External Links`
- `## Notes`
- `## Footnotes`
- `## Bibliography`

## 📝 Reference Section Format

References should be formatted as list items:

```markdown
## References

- [Blender Official](https://blender.org) - Official website
- [Documentation](https://docs.blender.org) - User manual
- [Community](https://artists.blender.org) - Forum
```

Or numbered:

```markdown
## References

1. [Blender Official](https://blender.org)
2. [Documentation](https://docs.blender.org)
```

## 🔍 What Gets Validated

### Validated

- ✅ External links have References section
- ✅ External links are valid URLs (http/https)
- ✅ References section has entries
- ✅ Footnote references have definitions
- ✅ Footnote definitions are referenced
- ✅ No empty footnote definitions
- ✅ No duplicate footnote identifiers
- ✅ Reference/definition counts match

### NOT Validated (Ignored)

- ❌ Internal links (`/path`, `#anchor`, `docs/file.md`)
- ❌ Links inside code blocks (skipped)
- ❌ Link text content
- ❌ URL accessibility (no HTTP requests)
- ❌ Reference section ordering

## 🚀 Usage

```bash
# Run validation (strict mode by default)
bun run validate

# Strict mode (exits with code 1 on failure)
bun run validate:strict

# LLM-friendly output
bun run validate:llm
```

## 🤖 LLM-Code-Agent Actions

When violations are found, the LLM validator provides actionable items:

```json
{
  "priority": "high",
  "action": "fix_error",
  "file": "docs/example.md",
  "reason": "1 external link(s) but no References section",
  "howToFix": "Add a ## References or ## See Also section at the end of the article with link entries",
  "estimatedEffort": "quick"
}
```

**LLM Response:**
```markdown
I'll add a References section to `docs/example.md`:

## References

- [Link Name](https://example.com) - Description
```

## ⚠️ Common Errors & Fixes

### Error: External links but no References section

**Fix:**
```markdown
# Add at end of article

## References

- [Link Text](URL) - Brief description
```

### Error: Invalid external URL

**Fix:**
```markdown
# Before
[Blender](blender.org)

# After
[Blender](https://blender.org)
```

### Error: Footnote reference has no definition

**Fix:**
```markdown
# Add definition at end of article

[^1]: Full source description and URL
```

### Error: Footnote definition is never referenced

**Fix Option 1:** Add reference in text
```markdown
As documented[^1], ...

[^1]: Source
```

**Fix Option 2:** Remove orphaned definition
```markdown
# Remove the unused [^1]: definition
```

## 📋 Best Practices

1. **Add References section** whenever adding external links
2. **Use valid URLs** with http:// or https://
3. **Match every footnote** reference with a definition
4. **Remove orphaned** footnote definitions
5. **Use unique identifiers** for each footnote
6. **Fill in definitions** with meaningful content

---

**Last Updated:** April 14, 2026  
**Validator:** reference-validator.ts  
**Strict:** ✅ Yes - Fails build on violations  
**Rules Enforced:** 8 strict checks
