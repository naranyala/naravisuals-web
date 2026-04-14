# Admonition Tracking & Enrichment System

## Overview

This system provides **strict tracking** of all `:::type` admonition blocks across your markdown documentation and offers **actionable enrichment recommendations** to improve content clarity and context.

## 📊 Current Statistics (As of April 14, 2026)

```
Articles:
   Total articles:                    49
   With admonitions:                  20 (40.8%)
   Without admonitions:               29 (59.2%) ⚠️

Admonitions:
   Total admonitions:                 29
   Average per article:               0.59
   Average (with admonitions only):   1.45

Type Distribution:
   💡 Tip           18 (62.1%)
   ⚠️ Warning        6 (20.7%)
   ℹ️ Note           5 (17.2%)
   ℹ️ Info           0 (0.0%)
   🚫 Danger         0 (0.0%)
   ⚠️ Caution        0 (0.0%)

Enrichment Scores:
   ★★★ Excellent:                3 articles
   ★★☆ Good:                     3 articles
   ★☆☆ Needs Improvement:        21 articles
   ☆☆☆ Empty (Zero Admonitions):  22 articles
```

## 🎯 What Are Admonitions?

Admonitions are **callout blocks** that highlight important information, tips, warnings, and notes. They use the `:::type` syntax:

```markdown
:::tip
This is a helpful tip with **markdown** support
:::

:::warning
Watch out for this common pitfall!
:::

:::note
Important note to remember
:::
```

## 🎨 Supported Admonition Types

| Type | Icon | Use Case | Target % |
|------|------|----------|----------|
| **:::tip** | 💡 | Best practices, pro advice, shortcuts | 60% |
| **:::warning** | ⚠️ | Common pitfalls, gotchas, things to avoid | 25% |
| **:::note** | ℹ️ | Important context, additional info | 15% |
| **:::info** | ℹ️ | Technical details, specifications | 0% |
| **:::danger** | 🚫 | Critical warnings, destructive actions | 0% |
| **:::caution** | ⚠️ | Similar to warning, less severe | 0% |

## 📈 Enrichment Guidelines

### Target Admonition Counts

| Article Length | Minimum Admonitions | Ideal Count |
|----------------|---------------------|-------------|
| **>1000 words** | 3+ | 3-5 |
| **500-1000 words** | 2+ | 2-3 |
| **<500 words** | 1+ | 1-2 |

### Strategic Placement

Place admonitions:
- ✅ **After complex sections** - Help reinforce understanding
- ✅ **Before examples** - Set context for what's coming
- ✅ **At decision points** - Guide users on best practices
- ✅ **Before common pitfalls** - Warn about gotchas
- ✅ **After code blocks** - Explain why this approach

### Don't Overuse

- ❌ Don't put admonitions on every paragraph
- ❌ Don't repeat the same information
- ❌ Don't use warnings for non-warning content
- ✅ Use sparingly for maximum impact

## 🔍 Usage

### Run Admonition Tracker

```bash
# Track all admonitions and get enrichment recommendations
bun run track:admonitions
```

### Output Includes

1. **Per-Article Report** - Shows admonition count, types, and locations
2. **Section Summaries** - Aggregated stats per documentation section
3. **Overall Statistics** - Total counts, averages, distribution
4. **Enrichment Recommendations** - Lists articles needing admonitions

### Example Output

```
★★★ docs/02-interface-basics/01-interface-basics.md
   Section: 02-interface-basics | Words: 1920
   Admonitions: 5 total (⚠️ warning: 2, 💡 tip: 2, ℹ️ note: 1)
   Locations: L22, L185, L360, L410, L482

☆☆☆ docs/03-scene-organization/03-snapping-tools.md
   Section: 03-scene-organization | Words: 3269
   ⚠ No admonitions - enrichment candidate!
```

## 📋 Articles Needing Enrichment

**29 articles have ZERO admonitions:**

### High Priority (Long articles >2000 words)

These articles are substantial but lack any admonitions:

1. `docs/03-scene-organization/03-snapping-tools.md` (3,269 words)
2. `docs/03-scene-organization/04-origin-points.md` (3,001 words)
3. `docs/04-modeling-fundamentals/02-proportional-editing.md` (2,268 words)
4. `docs/04-modeling-fundamentals/03-mesh-shading.md` (2,686 words)
5. `docs/04-modeling-fundamentals/04-edge-crease-weight.md` (2,532 words)
6. `docs/07-lighting-rendering/04-volumetrics-atmosphere.md` (2,085 words)
7. `docs/07-lighting-rendering/05-camera-composition.md` (2,378 words)
8. `docs/08-animation-basics/02-nla-editor.md` (3,156 words)
9. `docs/08-animation-basics/03-walk-cycle.md` (4,066 words)
10. `docs/08-animation-basics/04-constraints-deep.md` (3,595 words)
11. `docs/09-rigging/02-fk-vs-ik.md` (2,677 words)
12. `docs/11-geometry-nodes/02-geometry-nodes-advanced.md` (3,752 words)

### Medium Priority (1000-2000 words)

1. `docs/03-scene-organization/02-reference-images.md` (1,282 words)
2. `docs/05-modeling-workflows/03-subdivision-modeling.md` (1,198 words)
3. `docs/06-materials-textures/02-uv-unwrapping.md` (1,170 words)
4. `docs/06-materials-textures/05-procedural-textures.md` (2,179 words)
5. `docs/09-rigging/03-character-modeling.md` (1,063 words)
6. `docs/10-sculpting/01-sculpting-basics.md` (1,279 words)
7. `docs/11-geometry-nodes/01-geometry-nodes-intro.md` (1,198 words)

### Lower Priority (<1000 words)

1. `docs/06-materials-textures/03-texture-painting.md` (932 words)
2. `docs/09-rigging/04-environment-creation.md` (942 words)
3. `docs/12-game-pipeline/*` (4 articles, 797-962 words each)
4. `docs/13-professional-practice/02-export-formats.md`
5. `docs/13-professional-practice/03-critique-feedback.md`
6. `docs/14-projects-practice/01-portfolio-project.md`
7. `docs/14-projects-practice/03-community-resources.md`

## 🎨 Enrichment Examples

### Adding Tips (60% of admonitions)

```markdown
## Vertex Snapping

The most common snap type. Snaps to individual vertices.

:::tip
Use vertex snapping when connecting two mesh pieces together. 
It ensures vertices merge perfectly without gaps.
:::

**How to use:**
1. Select vertices you want to connect
2. Enable snap (magnet icon) and set to **Vertex**
3. Press **G** to grab one vertex
```

### Adding Warnings (25% of admonitions)

```markdown
## Applying Transforms

Before exporting, always apply transforms.

:::warning
Forgetting to apply transforms (Ctrl+A) will cause 
issues in game engines. Objects may appear at wrong 
positions or scales.
:::

**How to apply:**
1. Select all objects
2. Press Ctrl+A
3. Choose "All Transforms"
```

### Adding Notes (15% of admonitions)

```markdown
## Origin Points

The origin point controls how objects transform.

:::note
The origin point is independent of geometry. 
You can move it anywhere without affecting the mesh.
:::

**To move the origin:**
1. Place 3D cursor where you want it
2. Right-click object → Set Origin → Origin to 3D Cursor
```

## 📊 Section Coverage

| Section | Articles | With Admonitions | Coverage | Total Admonitions |
|---------|----------|------------------|----------|-------------------|
| 01-getting-started | 1 | 1 | 100% | 2 |
| 02-interface-basics | 4 | 4 | 100% ✅ | 9 |
| 03-scene-organization | 4 | 1 | 25% ⚠️ | 1 |
| 04-modeling-fundamentals | 4 | 1 | 25% ⚠️ | 1 |
| 05-modeling-workflows | 3 | 2 | 67% | 2 |
| 06-materials-textures | 5 | 2 | 40% | 2 |
| 07-lighting-rendering | 5 | 3 | 60% | 3 |
| 08-animation-basics | 4 | 1 | 25% ⚠️ | 1 |
| 09-rigging | 4 | 1 | 25% ⚠️ | 1 |
| 10-sculpting | 2 | 1 | 50% | 2 |
| 11-geometry-nodes | 2 | 0 | 0% ❌ | 0 |
| 12-game-pipeline | 4 | 0 | 0% ❌ | 0 |
| 13-professional-practice | 4 | 2 | 50% | 4 |
| 14-projects-practice | 3 | 1 | 33% | 1 |

## 🎯 Enrichment Strategy

### Phase 1: High Priority (This Week)

Focus on the **12 longest articles** (>2000 words) with zero admonitions:
- Target: 3+ admonitions per article
- Mix: 2 tips, 1 warning, 1 note
- Estimated time: 2-3 hours

### Phase 2: Medium Priority (Next Week)

Address the **7 medium articles** (1000-2000 words):
- Target: 2+ admonitions per article
- Mix: 1 tip, 1 warning/note
- Estimated time: 1-2 hours

### Phase 3: Lower Priority (Following Week)

Complete the **10 shorter articles** (<1000 words):
- Target: 1+ admonitions per article
- Mix: 1 tip or warning
- Estimated time: 1 hour

### Expected Result

After full enrichment:
- **Total admonitions:** ~100-120 (currently 29)
- **Coverage:** 100% of articles (currently 40.8%)
- **Average per article:** 2.0-2.5 (currently 0.59)
- **Type distribution:** 60% tip, 25% warning, 15% note

## 🔧 Integration with Build System

The admonition tracker integrates with the existing validation system:

```bash
# Run all validations
bun run validate:codeblocks      # Check codeblock descriptions
bun run validate:references      # Check references/footnotes
bun run validate:articles        # Comprehensive validation
bun run track:admonitions        # Track and recommend enrichment

# Run all validators
bun run validate
```

## 📝 Best Practices

### When to Use Each Type

**:::tip** - Use for:
- Pro tips and shortcuts
- Best practices
- Time-saving techniques
- Recommended workflows

**:::warning** - Use for:
- Common mistakes to avoid
- Destructive actions
- Performance impacts
- Compatibility issues

**:::note** - Use for:
- Additional context
- Technical details
- Background information
- Related concepts

**:::info** - Use for:
- API specifications
- Version requirements
- System requirements
- Technical prerequisites

**:::danger** - Use for:
- Data loss risks
- Irreversible actions
- Security vulnerabilities
- System crashes

### Writing Good Admonitions

✅ **Good:**
```markdown
:::tip
Apply transforms (Ctrl+A) before exporting to game engines 
to prevent position/scale issues.
:::
```

❌ **Bad:**
```markdown
:::tip
This is obvious.
:::
```

✅ **Good:**
```markdown
:::warning
High poly counts (>100K tris) will cause lag in viewport. 
Use Decimate modifier to reduce if needed.
:::
```

❌ **Bad:**
```markdown
:::warning
Too many polys is bad.
:::
```

## 📈 Tracking Progress

Run the tracker periodically to monitor enrichment progress:

```bash
# Before enrichment
bun run track:admonitions > before.txt

# After enrichment
bun run track:admonitions > after.txt

# Compare results
diff before.txt after.txt
```

## 🚀 Future Enhancements

Potential improvements to the tracking system:

- [ ] Auto-suggest admonition placements based on content analysis
- [ ] Validate admonition markdown syntax
- [ ] Track admonition trends over time
- [ ] Set minimum thresholds per section
- [ ] Generate enrichment tickets for GitHub Issues
- [ ] Integration with LLM for automatic admonition generation

---

**Last Updated:** April 14, 2026  
**Total Articles:** 49  
**Articles Needing Enrichment:** 29 (59.2%)  
**Target Coverage:** 100%  
**Current Coverage:** 40.8%
