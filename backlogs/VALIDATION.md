# Build System Validation Guide

This project includes a comprehensive validation system that checks every markdown article for quality, completeness, and consistency.

## 📊 Validation Scripts

### 1. Codeblock Description Validator

**Command:** `bun run validate:codeblocks`

Validates that every codeblock in the documentation has a description using the `:desc=` syntax.

**What it checks:**
- All codeblocks must have descriptions
- Reports files with missing descriptions
- Provides line numbers for easy fixing

**Example:**
```markdown
✓ Good:
```typescript:desc=This function handles validation
const validate = () => { }
```

✗ Bad:
```typescript
const validate = () => { }
```
```

### 2. Reference/Footnote Validator

**Command:** `bun run validate:references`

Validates that articles with external links or citations have proper reference sections.

**What it checks:**
- Articles with external links must have a "References" or "See Also" section
- Articles with citation markers `[1]`, `[^1]` must have corresponding footnote entries
- Reports per-article statistics

**Wikipedia-like Reference Format:**

At the end of your article, add:

```markdown
## References

- [Blender Official Documentation](https://docs.blender.org)
- [Blender Artists Community](https://artists.blender.org)
- [Blender Manual - Modeling](https://docs.blender.org/manual/en/latest/modeling/)
```

**For Citations:**

```markdown
This is a documented fact[^1] and another one[^2].

## Footnotes

[^1]: Source description with link or explanation
[^2]: Another source with details
```

### 3. Comprehensive Article Validator

**Command:** `bun run validate:articles`

The most thorough validation - checks everything per article:

**Metrics collected:**
- Total lines and word count
- Codeblock count (with/without descriptions)
- Admonition count and types (note, tip, warning, etc.)
- Mermaid diagram count
- External links count
- Citation markers count
- Footnote entries count

**Reports:**
- Per-article detailed breakdown
- Overall statistics across all articles
- Issues (validation failures)
- Warnings (suggestions for improvement)

### 4. Run All Validators

**Command:** `bun run validate`

Runs both codeblock and reference validators together.

## 📈 Current Statistics

As of the latest validation:

```
Articles:
   Total articles:              49
   Passing validation:        40
   With issues (failed):       9

Codeblocks:
   Total codeblocks:          1144
   With descriptions:         1143 (99.9%)
   Without descriptions:      1 (0.1%)

Admonitions:
   Total admonitions:         20
     - note:                  3
     - tip:                   12
     - warning:               5

Visualizations:
   Mermaid diagrams:          81
   Articles with Mermaid:     49/49 (100%)

References & Citations:
   External links:            11
   Citation markers:          16
   Footnote entries:          0
   Articles with references:  0/49 (0%)
```

## 🔧 How to Fix Validation Issues

### Missing Codeblock Descriptions

Find the file and line number reported, then add `:desc=...`:

```markdown
Before:
```python
def hello():
    print("Hi")
```

After:
```python:desc=Simple greeting function
def hello():
    print("Hi")
```
```

### Missing Reference Sections

For articles with external links, add at the end:

```markdown
## References

- [Resource Name](https://example.com) - Brief description
- [Another Resource](https://example.com) - What it covers
```

### Missing Footnote Entries

For articles with citation markers like `[1]`, `[2]`, add:

```markdown
## Footnotes

[^1]: Blender Foundation. "Modeling Basics." docs.blender.org
[^2]: Community wiki on topology best practices
```

## 🎯 Validation in CI/CD

The validators exit with code 1 if issues are found, making them perfect for:

- **Pre-commit hooks**: Run `bun run validate` before commits
- **CI pipelines**: Add to GitHub Actions or other CI
- **Pull request checks**: Ensure new articles meet quality standards

Example GitHub Action:

```yaml
name: Validate Articles
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run validate:articles
```

## 📋 Best Practices

### For New Articles

1. **Always add descriptions** to codeblocks
2. **Include at least one Mermaid diagram** for visual clarity
3. **Add References section** if linking to external resources
4. **Use admonitions** for tips, warnings, and notes
5. **Run validators** before submitting

### Reference Section Guidelines

- Place at the very end of the article
- Use heading level 2 or 3 (`## References` or `### References`)
- List format (bullets or numbered)
- Include full URLs for external resources
- Add brief descriptions for each reference

### Citation Guidelines

- Use `[1]`, `[2]`, etc. for numbered citations
- Or use `[^1]`, `[^2]` for footnote-style citations
- Always provide corresponding footnote entries
- Place footnotes in the References section at the end

## 🚀 Future Enhancements

Potential improvements to the validation system:

- [ ] Auto-fix missing codeblock descriptions with placeholder text
- [ ] Validate Mermaid diagram syntax
- [ ] Check for broken external links
- [ ] Validate frontmatter completeness
- [ ] Suggest admonition placements
- [ ] Reading time accuracy validation
- [ ] Image alt-text validation

## 📝 Notes

- The citation marker detection is conservative - it matches any `[number]` pattern
- Some legitimate uses of brackets (like `[1920x1080]`) may trigger false positives
- Reference section detection looks for common heading patterns
- The validator is designed to help, not hinder - use warnings as improvement opportunities

---

**Last updated:** 2026-04-14
**Total validation scripts:** 3
**Total checks performed:** 15+ per article
