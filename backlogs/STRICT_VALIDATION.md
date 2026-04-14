# Strict Per-Article Content Validation System

## Overview

This is the **single source of truth** for content quality metrics across all markdown articles with a **dual approach**:

### ✅ STRICT Validation (Fails Build)
1. **Codeblock descriptions** - MUST have `:desc=` metadata

### ℹ️ INFORMATIONAL Only (LLM-Assistant Guidance)
2. **Admonitions** - Reports count and types, suggests enrichment targets
3. **References/Footnotes** - Reports external links and citations, suggests enrichment
4. **Mermaid Diagrams** - Reports coverage

This validator helps **LLM-code-assistants** identify enrichment opportunities for static content improvement in future runs.

## 🚀 Usage

```bash
# Run strict per-article validation
bun run validate:strict
```

This will output:
- Per-article detailed metrics
- Enrichment score (0-100%) per article
- **STRICT**: Fails if codeblocks missing descriptions
- **INFORMATIONAL**: Suggests enrichment targets for LLM assistants
- Overall project statistics
- Summary of most common enrichment needs

### Example Output

```
📊 Strict Per-Article Content Validation

STRICT: Codeblock descriptions | INFORMATIONAL: Admonitions, References, Mermaid

✅ docs/02-interface-basics/01-interface-basics.md
   Section: 02-interface-basics | Lines: 568 | Words: 1920
   Enrichment Score: 100%
   Codeblocks: 15 (Shell/Terminal: 1, Text/TXT: 7, Mermaid: 7)
   Admonitions: 5 (warning: 2, tip: 2, note: 1)
   Mermaid diagrams: 7
   References: No
   External links: 0
   Citations: 0 markers, 0 footnotes

✅ docs/03-scene-organization/03-snapping-tools.md
   Section: 03-scene-organization | Lines: 901 | Words: 3269
   Enrichment Score: 85%
   Codeblocks: 37 (Mermaid: 3, Text/TXT: 34)
   ℹ️  Admonitions: 0 (enrichment suggestion)
   Mermaid diagrams: 3
   References: No
   External links: 0
   Citations: 0 markers, 0 footnotes
   🎯 Enrichment Targets:
     → Add admonitions (target: 3+)
```

## 📊 Current Project Statistics (April 14, 2026)

```
Articles:
   Total:                     49
   Average enrichment score:  85%
   With enrichment targets:   47

Codeblocks:
   Total codeblocks:          1145
   Average per article:       23.37

Admonitions:
   Total admonitions:         29
   Articles with zero:        29 (ENRICHMENT TARGETS) ⚠️
   Average per article:       0.59

Mermaid Diagrams:
   Total diagrams:            81
   Articles with zero:        0
   Coverage:                  49/49 (100.0%) ✅

References & Citations:
   External links:            11
   Citation markers:          16
   Footnote entries:          0
   Articles with refs section:0/49 ⚠️
```

## 📋 Per-Article Report Format

Each article gets a detailed report:

```
✅ docs/02-interface-basics/01-interface-basics.md
   Section: 02-interface-basics | Lines: 568 | Words: 1920
   Enrichment Score: 100%
   
   Codeblocks: 15 (Shell/Terminal: 1, Text/TXT: 7, Mermaid: 7)
   Admonitions: 5 (warning: 2, tip: 2, note: 1)
   Mermaid diagrams: 7
   References: No
   External links: 0
   Citations: 0 markers, 0 footnotes
```

**If article has enrichment targets:**

```
✅ docs/03-scene-organization/03-snapping-tools.md
   Section: 03-scene-organization | Lines: 901 | Words: 3269
   Enrichment Score: 85%
   
   Codeblocks: 37 (Mermaid: 3, Text/TXT: 34)
   ⚠ Admonitions: 0 (ENRICHMENT TARGET)
   Mermaid diagrams: 3
   References: No
   External links: 0
   Citations: 0 markers, 0 footnotes
   
   🎯 Enrichment Targets:
     → Add admonitions (target: 3+)
```

## 🎯 Enrichment Score Calculation

The enrichment score (0-100%) is calculated based on:

| Metric | Weight | Ideal Target |
|--------|--------|--------------|
| **Codeblocks present** | 10% | At least 1 if article >500 words |
| **Codeblock descriptions** | 5% per missing | 100% described |
| **Admonitions** | 15% if zero, 10% if low | 3+ for >1000 words, 2+ for 500-1000, 1+ for <500 |
| **Mermaid diagrams** | 10% if missing | At least 1 if article >800 words |
| **References section** | 15% if missing with links | Required if external links exist |
| **Footnote entries** | 15% if missing with citations | Required if citation markers exist |

**Score Interpretation:**
- **90-100%** ✅ Excellent - Meets all standards
- **70-89%** ✅ Good - Minor improvements needed
- **50-69%** ⚠️ Needs Improvement - Several gaps
- **<50%** ❌ Poor - Significant enrichment needed

## 📈 Enrichment Targets

### Most Common Targets (Current State)

1. **Add admonitions (target: 3+)** - 22 articles
2. **Add 2 more admonitions (target: 3+)** - 14 articles
3. **Add admonitions (target: 2+)** - 7 articles
4. **Add References section for external links** - 2 articles
5. **Add footnote entries for citation markers** - 8 articles

### Articles with ZERO Admonitions (29 articles)

**High Priority (>2000 words):**
- `docs/03-scene-organization/03-snapping-tools.md` (3,269 words)
- `docs/03-scene-organization/04-origin-points.md` (3,001 words)
- `docs/04-modeling-fundamentals/02-proportional-editing.md` (2,268 words)
- `docs/04-modeling-fundamentals/03-mesh-shading.md` (2,686 words)
- `docs/04-modeling-fundamentals/04-edge-crease-weight.md` (2,532 words)
- `docs/06-materials-textures/05-procedural-textures.md` (2,179 words)
- `docs/08-animation-basics/02-nla-editor.md` (3,156 words)
- `docs/08-animation-basics/03-walk-cycle.md` (4,066 words)
- `docs/08-animation-basics/04-constraints-deep.md` (3,595 words)
- `docs/09-rigging/02-fk-vs-ik.md` (2,677 words)
- `docs/11-geometry-nodes/02-geometry-nodes-advanced.md` (3,752 words)

**Medium Priority (1000-2000 words):**
- 7 articles need 2-3 admonitions each

**Lower Priority (<1000 words):**
- 10 articles need 1 admonition each

## 🔍 What Gets Tracked

### 1. Codeblocks

**Metrics:**
- Total count
- Category breakdown (Mermaid, Text/TXT, Shell/Terminal, Programming Language, etc.)
- Description coverage (with/without `:desc=`)

**Example:**
```
Codeblocks: 37 (Mermaid: 3, Text/TXT: 34)
```

### 2. Admonitions

**Metrics:**
- Total count
- Type breakdown (tip, note, warning, info, danger, caution)
- Line numbers for each admonition

**Example:**
```
Admonitions: 5 (warning: 2, tip: 2, note: 1)
```

**Supported Types:**
| Type | Icon | Purpose |
|------|------|---------|
| `:::tip` | 💡 | Best practices, pro tips |
| `:::note` | ℹ️ | Important context |
| `:::warning` | ⚠️ | Common pitfalls |
| `:::info` | ℹ️ | Technical details |
| `:::danger` | 🚫 | Critical warnings |
| `:::caution` | ⚠️ | Less severe warnings |

### 3. Mermaid Diagrams

**Metrics:**
- Total count
- Coverage (articles with diagrams / total articles)

**Example:**
```
Mermaid diagrams: 3
```

### 4. References & Citations

**Metrics:**
- External link count
- Citation markers (e.g., `[1]`, `[^1]`)
- Footnote entry count
- Has reference section (Yes/No)

**Example:**
```
References: No (ENRICHMENT TARGET)
External links: 1
Citations: 7 markers, 0 footnotes
```

## 🎨 Output Color Coding

| Color | Meaning |
|-------|---------|
| 🟢 Green | Good/Passing |
| 🟡 Yellow | Warning/Needs Improvement |
| 🔴 Red | Critical/Enrichment Target |
| 🔵 Cyan | Codeblocks |
| 🟣 Magenta | Admonitions |
| ⚫ Gray | Informational/Dim |

## 📝 Enrichment Guidelines

### Admonition Targets by Article Length

| Word Count | Minimum Admonitions | Recommended |
|------------|---------------------|-------------|
| **>1000 words** | 3+ | 3-5 |
| **500-1000 words** | 2+ | 2-3 |
| **<500 words** | 1+ | 1-2 |

### Mermaid Diagram Targets

| Word Count | Minimum Diagrams |
|------------|------------------|
| **>800 words** | 1+ |
| **>2000 words** | 2+ |
| **>3000 words** | 3+ |

### Reference Requirements

- ✅ If article has external links → Must have References section
- ✅ If article has citation markers → Must have footnote entries
- ✅ Footnote entries should match or exceed citation marker count

## 🔧 Integration with Build System

### Available Commands

```bash
# Strict per-article validation (THIS SCRIPT)
bun run validate:strict

# Individual validators
bun run validate:codeblocks      # Codeblock descriptions only
bun run validate:references      # References/footnotes only
bun run validate:articles        # Comprehensive validation
bun run track:admonitions        # Admonition tracking only

# Run all basic validators
bun run validate
```

### CI/CD Integration

The validator exits with code 1 if any article scores <50%:

```yaml
name: Validate Content Quality
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

## 📊 Example: Full Per-Article Output

```
📊 Strict Per-Article Content Validation

Scanning: /path/to/docs

📄 Per-Article Metrics:
────────────────────────────────────────────────────────────────────────────────────

✅ docs/02-interface-basics/01-interface-basics.md
   Section: 02-interface-basics | Lines: 568 | Words: 1920
   Enrichment Score: 100%
   Codeblocks: 15 (Shell/Terminal: 1, Text/TXT: 7, Mermaid: 7)
   Admonitions: 5 (warning: 2, tip: 2, note: 1)
   Mermaid diagrams: 7
   References: No
   External links: 0
   Citations: 0 markers, 0 footnotes

⚠️ docs/03-scene-organization/03-snapping-tools.md
   Section: 03-scene-organization | Lines: 901 | Words: 3269
   Enrichment Score: 85%
   Codeblocks: 37 (Mermaid: 3, Text/TXT: 34)
   ⚠ Admonitions: 0 (ENRICHMENT TARGET)
   Mermaid diagrams: 3
   References: No
   External links: 0
   Citations: 0 markers, 0 footnotes
   🎯 Enrichment Targets:
     → Add admonitions (target: 3+)

────────────────────────────────────────────────────────────────────────────────────

📈 Overall Statistics:

Articles:
   Total:                     49
   Average enrichment score:  85%
   With enrichment targets:   47

Codeblocks:
   Total codeblocks:          1145
   Average per article:       23.37

Admonitions:
   Total admonitions:         29
   Articles with zero:        29 (ENRICHMENT TARGETS)
   Average per article:       0.59

Mermaid Diagrams:
   Total diagrams:            81
   Articles with zero:        0
   Coverage:                  49/49 (100.0%)

References & Citations:
   External links:            11
   Citation markers:          16
   Footnote entries:          0
   Articles with refs section:0/49

🎯 Enrichment Summary:

29 article(s) with ZERO admonitions:
   • docs/03-scene-organization/02-reference-images.md (1282 words)
   • docs/03-scene-organization/03-snapping-tools.md (3269 words)
   ... and 27 more

Most common enrichment targets:
   → Add admonitions (target: 3+) (22 articles)
   → Add 2 more admonition(s) (target: 3+) (14 articles)
   → Add admonitions (target: 2+) (7 articles)

✅ All articles meet minimum enrichment standards!
```

## 🚀 How to Enrich Articles

### Adding Admonitions

```markdown
## Your Content

Some technical explanation about Blender modifiers.

:::tip
Use Ctrl+A to apply all transforms before exporting to game engines.
This prevents position and scale issues.
:::

More content here...

:::warning
High poly counts (>100K tris) will cause viewport lag.
Consider using the Decimate modifier to reduce complexity.
:::
```

### Adding References Section

```markdown
## References

- [Blender Official Documentation](https://docs.blender.org) - The official manual
- [Blender Artists Community](https://artists.blender.org) - Community forum
- [Modifier Guide](https://docs.blender.org/manual/en/latest/modeling/modifiers/) - Detailed modifier documentation
```

### Adding Footnotes

```markdown
This technique is widely used[1] and recommended by experts[2].

## Footnotes

[^1]: Blender Manual, "Modeling Basics" section
[^2]: Blender Guru tutorial series, Episode 3
```

## 📈 Tracking Progress Over Time

Run periodically and compare results:

```bash
# Save current state
bun run validate:strict > validation-$(date +%Y-%m-%d).txt

# After enrichment, compare
diff validation-2026-04-14.txt validation-2026-04-21.txt
```

**Expected improvements:**
- ↑ Average enrichment score (currently 85%)
- ↓ Articles with zero admonitions (currently 29)
- ↑ Articles with reference sections (currently 0)
- ↑ Footnote entries (currently 0)

## 🎯 Success Criteria

**Target State (After Full Enrichment):**
- ✅ Average enrichment score: ≥90%
- ✅ Articles with zero admonitions: 0
- ✅ Articles with reference sections: 100% of articles with external links
- ✅ Footnote entries: Match or exceed citation markers
- ✅ Mermaid coverage: 100% (already achieved!)
- ✅ Codeblock descriptions: 100% (already achieved!)

---

**Last Updated:** April 14, 2026  
**Script Location:** `scripts/strict-content-validator.mts`  
**Total Metrics Tracked:** 15+ per article  
**Validation Time:** <2 seconds for 49 articles
