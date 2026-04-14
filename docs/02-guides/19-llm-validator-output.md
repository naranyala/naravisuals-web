---
title: LLM-Friendly Validator Output
description: How the validation system provides actionable tasks for LLM code agents
sidebar_label: LLM Validator Output
sidebar_position: 19
---

## Overview

The validation system now includes a **dedicated section for LLM Code Agents** that provides clear, actionable, prioritized tasks. This makes it easy for AI assistants to understand what needs to be done and how to do it.

---

## LLM Code Agent Section

### Example Output

```text:desc=Example text content
╔═══════════════════════════════════════════════════╗
║  🤖 LLM Code Agent - Next Tasks                  ║
╚═══════════════════════════════════════════════════╝

1. [CRITICAL] Fix codeblocks missing :desc= metadata
   Files: guides/build-statistics, guides/validation-plugins
   Example:
     ```typescript:desc=Your description here
     const x = 1;
     ```

2. [HIGH] Add admonitions for context and clarity
   Files: guides/validation-plugins, guides/validation-formatting
   Example:
     :::note
     Important context about this topic.
     :::
     
     :::tip
     Helpful suggestion or best practice.
     :::

3. [MEDIUM] Add footnotes/references for citations and clarifications
   Files: getting-started/project-overview, getting-started/directory-structure, guides/build-system
   Example:
     Text with footnote[^1]
     
     [^1]: Reference or additional context

4. [LOW] Consider adding Mermaid diagrams for visualization
   Files: guides/component-reference, guides/css-theme-architecture, guides/react-hooks
   Example:
     ```mermaid:desc=Flowchart showing process
     graph TD
         A[Start] --> B[End]
     ```

💡 Tip: Start with CRITICAL tasks, then work down by priority
💡 Run 'bun run validate' again after making changes to verify
```

---

## Task Priority Levels

### 🔴 CRITICAL
**What:** Fix strict validation errors  
**Impact:** Build will fail if not fixed  
**Action Required:** Immediate

**Example Tasks:**
- Codeblocks missing `:desc=` metadata
- Syntax errors in markdown
- Broken links (if strict mode enabled)

**LLM Should:**
1. ✅ Fix these FIRST
2. ✅ Run validation to confirm fix
3. ✅ Ensure build passes

---

### 🟡 HIGH
**What:** Important enrichment opportunities  
**Impact:** Documentation clarity suffers without it  
**Action Required:** Soon

**Example Tasks:**
- Articles with no admonitions (2+ headings)
- Missing important callouts
- Security/safety warnings needed

**LLM Should:**
1. ✅ Address after CRITICAL tasks
2. ✅ Add 2-5 admonitions per article
3. ✅ Use diverse types (note, tip, warning)

---

### 🔵 MEDIUM
**What:** Nice-to-have improvements  
**Impact:** Documentation could be better  
**Action Required:** When convenient

**Example Tasks:**
- Add footnotes to long articles (5+ headings)
- Add citations and references
- Clarify confusing sections

**LLM Should:**
1. ✅ Consider for articles 1000+ words
2. ✅ Add references where appropriate
3. ✅ Improve clarity

---

### ⚪ LOW
**What:** Optional enhancements  
**Impact:** Minor improvements  
**Action Required:** If time permits

**Example Tasks:**
- Add Mermaid diagrams (3+ headings)
- Diversify admonition types
- Add more code examples

**LLM Should:**
1. ✅ Consider for visualization opportunities
2. ✅ Add diagrams where helpful
3. ✅ Improve overall quality

---

## Task Structure

Each task includes:

### 1. Priority Level
```text:desc=Example text content
[CRITICAL] [HIGH] [MEDIUM] [LOW]
```
Color-coded for quick identification:
- 🔴 Red = CRITICAL
- 🟡 Yellow = HIGH
- 🔵 Blue = MEDIUM
- ⚪ Gray = LOW

### 2. Task Description
Clear, actionable description of what needs to be done.

**Examples:**
- "Fix codeblocks missing :desc= metadata"
- "Add admonitions for context and clarity"
- "Add footnotes/references for citations"
- "Consider adding Mermaid diagrams"

### 3. Affected Files
List of files that need attention (up to 5 shown, rest indicated).

**Format:**
```text:desc=Example text content
Files: file1, file2, file3
... and 8 more files
```

### 4. Example
Concrete example showing exactly how to implement the fix.

**Codeblocks Example:**
```text:desc=Example text content
Example:
  ```typescript:desc=Your description here
  const x = 1;
  ```
```

**Admonitions Example:**
```text:desc=Example text content
Example:
  :::note
  Important context about this topic.
  :::
  
  :::tip
  Helpful suggestion or best practice.
  :::
```

**Footnotes Example:**
```text:desc=Example text content
Example:
  Text with footnote[^1]
  
  [^1]: Reference or additional context
```

**Mermaid Example:**
```text:desc=Example text content
Example:
  ```mermaid:desc=Flowchart showing process
  graph TD
      A[Start] --> B[End]
  ```
```

---

## How LLM Code Agents Should Use This

### Workflow

**Step 1: Run Validation**
```bash:desc=Example shell command
bun run validate
```

**Step 2: Read LLM Section**
Scroll to the bottom and find:
```text:desc=Example text content
🤖 LLM Code Agent - Next Tasks
```

**Step 3: Start with CRITICAL**
```text:desc=Example text content
1. [CRITICAL] Fix codeblocks missing :desc= metadata
   Files: guides/build-statistics, guides/validation-plugins
```

**Step 4: Fix Issues**
- Open each file
- Add `:desc=` to codeblocks
- Use the example as reference

**Step 5: Re-run Validation**
```bash:desc=Example shell command
bun run validate
```

**Step 6: Move to Next Priority**
Once CRITICAL is clear, move to HIGH, then MEDIUM, then LOW.

---

## Task Detection Logic

The validator automatically detects and generates tasks for:

### 1. Codeblock Descriptions (CRITICAL)
**Detected when:** Any codeblock lacks `:desc=` metadata  
**Task generated:** If `errors.length > 0`

### 2. Admonitions (HIGH)
**Detected when:** Article has 0 admonitions but 2+ headings  
**Task generated:** If `admonition-enrichment` infos exist

### 3. Footnotes (MEDIUM)
**Detected when:** Article has 0 footnotes but 5+ headings  
**Task generated:** If `footnote-enrichment` infos exist

### 4. Admonition Diversity (LOW)
**Detected when:** Article has 2+ admonitions but only 1 type  
**Task generated:** If `admonitions >= 2 && admonitionTypes.length < 2`

### 5. Mermaid Diagrams (LOW)
**Detected when:** Article has 0 diagrams but 3+ headings  
**Task generated:** If `mermaidDiagrams === 0 && headings >= 3`

---

## Example LLM Interaction

### User Request
"Improve the documentation quality"

### LLM Response
```text:desc=Example text content
I'll help improve the documentation. Let me first run validation to identify priorities.

[bun run validate]

I can see the following tasks:

1. [CRITICAL] Fix 2 files with codeblocks missing descriptions
   - guides/build-statistics
   - guides/validation-plugins

2. [HIGH] Add admonitions to 2 files
   - guides/validation-plugins
   - guides/validation-formatting

I'll start with the CRITICAL task. Let me fix the codeblock descriptions...

[Fixes codeblocks]

Now let me verify and move to HIGH priority...
```

### Progress Tracking
```text:desc=Example text content
✅ CRITICAL: Fixed 13 codeblocks with :desc= metadata
🔄 HIGH: Adding admonitions to 2 files
⏳ MEDIUM: 17 files could use footnotes
⏳ LOW: 5 files could benefit from Mermaid diagrams
```

---

## Benefits for LLM Code Agents

### ✅ Clear Prioritization
- Know exactly what to fix first
- No guessing about importance
- Structured workflow

### ✅ Actionable Information
- Specific files to edit
- Exact examples to follow
- Clear success criteria

### ✅ Efficient Workflow
- One command gets full picture
- Prioritized task list
- Verification step included

### ✅ Context-Aware
- Tasks based on actual content
- Respects strict vs informative modes
- Adapts to project state

---

## Commands

### Run Full Validation
```bash:desc=Example shell command
bun run validate
```
Shows all sections including LLM tasks

### Strict Mode Only
```bash:desc=Example shell command
bun run validate:strict
```
Shows only CRITICAL errors (no LLM section)

### Informative Mode
```bash:desc=Example shell command
bun run validate:info
```
Shows enrichment + LLM tasks (no errors)

---

## Sample Complete Output

```text:desc=Example text content
╔═══════════════════════════════════════════════════╗
║   Unified Markdown Validator                      ║
║   Plugin-based validation system                  ║
╚═══════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────┐
│  Validation Summary                            │
├─────────────────────────────────────────────────┤
│ 🔒 codeblock-descriptions      ✗ 14 issue(s) │
│ 📋 admonitions                    ✓ Pass │
│ 📋 footnotes                      ✓ Pass │
└─────────────────────────────────────────────────┘

[... errors and recommendations ...]

╔═══════════════════════════════════════════════════╗
║  🤖 LLM Code Agent - Next Tasks                  ║
╚═══════════════════════════════════════════════════╝

1. [CRITICAL] Fix codeblocks missing :desc= metadata
   Files: guides/build-statistics, guides/validation-plugins
   Example:
     ```typescript:desc=Your description here
     const x = 1;
     ```

2. [HIGH] Add admonitions for context and clarity
   Files: guides/validation-plugins, guides/validation-formatting
   Example:
     :::note
     Important context about this topic.
     :::

💡 Tip: Start with CRITICAL tasks, then work down by priority
💡 Run 'bun run validate' again after making changes to verify

✓ Validation complete!
```

---

## Integration with CI/CD

### Pre-Commit Hook
```bash:desc=Example shell command
#!/bin/bash
# Check for CRITICAL issues before commit
bun run validate:strict
if [ $? -ne 0 ]; then
  echo "❌ Fix CRITICAL validation errors before committing"
  exit 1
fi
```

### PR Check
```bash:desc=Example shell command
# In CI pipeline
bun run validate

# Parse LLM tasks section
# If CRITICAL tasks exist, fail PR
# If only HIGH/MEDIUM/LOW, add comment with suggestions
```

### Automated Enrichment
```bash:desc=Example shell command
# Bot can run periodically
bun run validate --json > validation-report.json

# Parse and create issues for each task
# Label by priority (CRITICAL, HIGH, MEDIUM, LOW)
# Assign to documentation team
```

---

## Summary

The LLM-friendly validator output provides:

✅ **Prioritized tasks** - CRITICAL → HIGH → MEDIUM → LOW  
✅ **Specific files** - Know exactly what to edit  
✅ **Clear examples** - See exactly how to fix  
✅ **Actionable workflow** - Fix, verify, move to next  
✅ **Color-coded priorities** - Visual distinction  
✅ **Progressive enhancement** - Work down by priority  

Run `bun run validate` and scroll to the bottom to see tasks for your LLM code agent! 🤖✨
