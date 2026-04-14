# LLM-Code-Agent Validation Guide

## Overview

The validator provides **LLM-friendly output** that tells code agents exactly what to do, in priority order, with clear action items.

## 🚀 Usage for LLM-Code-Agents

```bash
# LLM-friendly output (structured markdown + JSON)
bun run validate:llm

# Human-friendly output (formatted for reading)
bun run validate
```

## 📋 LLM Output Structure

The `--llm` mode outputs:

1. **Status Summary** - Quick overview of validation state
2. **Recommended Actions** - Grouped by priority (high/medium/low)
3. **Next Steps** - Explicit instructions for what the LLM should do
4. **JSON Data Block** - Machine-parseable structured data

## 🎯 How LLM-Code-Agents Should Respond

### Step 1: Parse the Output

Look for these markers in the output:

```
<!-- VALIDATION_START -->
... validation results ...
<!-- VALIDATION_END -->

<!-- VALIDATION_JSON_START -->
```json
{
  "summary": { ... },
  "actionItems": [ ... ]
}
```
<!-- VALIDATION_JSON_END -->
```

### Step 2: Identify Priority Actions

The output groups actions by priority:

#### 🔴 HIGH PRIORITY (Must Fix)
- **These cause build failures or affect quality**
- Fix these FIRST
- Example: Missing references, codeblocks without descriptions

#### 🟡 MEDIUM PRIORITY (Should Fix)
- **These improve content quality**
- Fix these SECOND
- Example: Warnings, potential improvements

#### 🟢 LOW PRIORITY (Consider Fixing)
- **Enrichment suggestions**
- Fix these LAST
- Example: Missing admonitions, additional content

### Step 3: Execute Actions

For each action item, the LLM should:

1. **Read the file** mentioned in the action
2. **Understand the issue** from the `reason` field
3. **Apply the fix** using the `howToFix` guidance
4. **Verify** by running `bun run validate` again

### Step 4: Report Results

After fixing, report:
- ✅ What was fixed
- ⚠️ What still needs work
- 📊 New validation status

## 📊 Example LLM Workflow

### Input (from validator)

```markdown
#### 🔴 HIGH PRIORITY (Must Fix)

**2 action(s)** - These will cause build failures or affect content quality.

**Action:** fix error
**Affected files:** 2

  docs/01-getting-started:
    - `docs/01-getting-started/01-blender-roadmap-overview.md`
  docs/14-projects-practice:
    - `docs/14-projects-practice/03-community-resources.md`

**Reason:** External links (1) but no References section
**How to fix:** Add a ## References or ## See Also section at the end of the article
```

### LLM Response

```
I'll fix the 2 HIGH PRIORITY errors:

1. Adding References section to `docs/01-getting-started/01-blender-roadmap-overview.md`
2. Adding References section to `docs/14-projects-practice/03-community-resources.md`

Let me start...
```

### LLM Actions

```markdown
For docs/01-getting-started/01-blender-roadmap-overview.md:

Add at the end of the file:

## References

- [Blender Official Website](https://www.blender.org) - Official Blender website
- [Blender Download](https://www.blender.org/download/) - Download Blender

For docs/14-projects-practice/03-community-resources.md:

Add at the end of the file:

## References

- [Blender Artists Community](https://artists.blender.org) - Community forum
- [Blender Discord](https://discord.gg/blender) - Official Discord server
- [Reddit r/blender](https://reddit.com/r/blender) - Reddit community
```

### Verification

```bash
bun run validate:llm
```

### Expected Result

```markdown
### Status

- **Total files scanned:** 49
- **Total issues found:** 29
- **Errors (must fix):** 0 ✅
- **Warnings (should fix):** 0
- **Info (consider fixing):** 29
- **Strict validation:** ✅ PASSED

### ✅ No Actions Needed

All validations passed. No enrichment or fixes required at this time.
```

## 🔧 JSON Data Structure

The validator outputs structured JSON for programmatic use:

```json
{
  "timestamp": "2026-04-14T02:51:35.163Z",
  "summary": {
    "totalFiles": 49,
    "totalIssues": 31,
    "errors": 2,
    "warnings": 0,
    "info": 29,
    "strictPass": false
  },
  "validators": [
    {
      "name": "codeblock-descriptions",
      "label": "Codeblock Description Validator",
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
      "priority": "high",
      "action": "fix_error",
      "file": "docs/01-getting-started/01-blender-roadmap-overview.md",
      "reason": "External links (1) but no References section",
      "howToFix": "Add a ## References or ## See Also section at the end of the article",
      "estimatedEffort": "quick"
    }
  ]
}
```

## 🤖 LLM Decision Tree

```
Validation Output
  │
  ├─ errors > 0?
  │   └─ YES → Fix errors first (HIGH PRIORITY)
  │
  ├─ warnings > 0?
  │   └─ YES → Fix warnings second (MEDIUM PRIORITY)
  │
  ├─ info > 0?
  │   └─ YES → Consider enrichment (LOW PRIORITY)
  │
  └─ All zero?
      └─ YES → No actions needed, report success
```

## 📝 Common Action Types

### fix_error

**What it means:** Something is broken or missing that affects build/validation

**Common fixes:**
- Add missing `:desc=` to codeblocks
- Add References section for external links
- Add footnote definitions for citation markers

### address_warning

**What it means:** Content could be improved but isn't broken

**Common fixes:**
- Improve unclear explanations
- Add missing context
- Fix formatting inconsistencies

### consider_enrichment

**What it means:** Content would benefit from additional elements

**Common fixes:**
- Add admonitions (:::tip, :::warning, :::note)
- Add Mermaid diagrams for visual clarity
- Add examples or code snippets

## 🎯 Batch Processing

The LLM can batch similar fixes together:

```markdown
I see 29 files need admonitions. I'll add them in batches:

**Batch 1: Add :::tip to modeling fundamentals articles (3 files)**
- docs/04-modeling-fundamentals/02-proportional-editing.md
- docs/04-modeling-fundamentals/03-mesh-shading.md
- docs/04-modeling-fundamentals/04-edge-crease-weight.md

**Batch 2: Add :::warning to scene organization articles (3 files)**
- docs/03-scene-organization/02-reference-images.md
- docs/03-scene-organization/03-snapping-tools.md
- docs/03-scene-organization/04-origin-points.md

...
```

## ✅ Best Practices for LLM-Code-Agents

1. **Always check validation first** - Run `bun run validate:llm` before making changes
2. **Fix HIGH PRIORITY first** - These may block builds
3. **Batch similar fixes** - More efficient than one-by-one
4. **Verify after each batch** - Run `bun run validate` to confirm
5. **Report progress** - Tell the user what was fixed and what remains
6. **Use JSON data** - Parse the JSON block for programmatic processing

## 🔍 Parsing the Output

For LLM-code-agents that process the output:

```python
# Example: Extract action items from output
import json
import re

output = """... validator output ..."""

# Extract JSON block
json_match = re.search(r'<!-- VALIDATION_JSON_START -->\s*```json\s*(.*?)\s*```\s*<!-- VALIDATION_JSON_END -->', output, re.DOTALL)

if json_match:
    data = json.loads(json_match.group(1))
    action_items = data['actionItems']
    
    # Process by priority
    for item in sorted(action_items, key=lambda x: {'high': 0, 'medium': 1, 'low': 2}[x['priority']]):
        print(f"Fix {item['file']}: {item['howToFix']}")
```

## 📊 Example LLM Session

```
User: Check the validation status

LLM: Running validator...

[Output from bun run validate:llm]

I found 31 issues:
- 2 errors (must fix)
- 0 warnings
- 29 info (enrichment suggestions)

The 2 errors are in:
1. docs/01-getting-started/01-blender-roadmap-overview.md
2. docs/14-projects-practice/03-community-resources.md

Both need References sections added. Should I fix them?

User: Yes, please fix them

LLM: I'll add References sections to both files...

[LLM makes edits]

Verifying fixes...

[Runs bun run validate]

✅ Great! Both errors are now fixed. The validation now shows:
- 0 errors
- 0 warnings
- 29 info (enrichment suggestions)

Strict validation: ✅ PASSED

Would you like me to address the 29 enrichment suggestions?
```

## 🚀 Future Enhancements

Potential improvements for LLM integration:

- [ ] Auto-fix mode for common issues
- [ ] Interactive mode where LLM asks for confirmation before each fix
- [ ] Progress tracking across multiple sessions
- [ ] Learning from past fixes to improve future suggestions
- [ ] Integration with GitHub issues/PRs for tracking

---

**Last Updated:** April 14, 2026  
**Command:** `bun run validate:llm`  
**Output Format:** Markdown + JSON  
**Target Audience:** LLM-Code-Agents (Qwen Code, GitHub Copilot, etc.)
