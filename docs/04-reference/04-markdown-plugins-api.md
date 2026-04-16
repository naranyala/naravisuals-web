---
title: Markdown Plugins API
description: Plugin interfaces, types, and registry reference
sidebar_label: Plugins API
sidebar_position: 4
---

# Markdown Plugins API

The markdown plugin system allows transforming content before and after the `marked` parser converts markdown to HTML. Plugins are applied during the build process (`scripts/build-docs.mts`) and affect the generated output in `src/generated/`.

## Plugin Pipeline

```mermaid:desc=Plugin pipeline diagram
flowchart lr
    A["Raw .md"] --> B["preProcess plugins"]
    B --> C["marked.parse()"]
    C --> D["HTML output"]
    D --> E["postProcess plugins (reverse order)"]
    E --> F["Final HTML in DocEntry.content"]
```

The execution order is:

1. **preProcess** -- all plugins run in registration order on raw markdown
2. **marked** -- markdown is converted to HTML
3. **postProcess** -- all plugins run in **reverse** registration order on the HTML output

## MarkdownPlugin Interface

```ts:desc=MarkdownPlugin interface definition
export interface MarkdownPlugin {
  /** Unique plugin name */
  name: string;

  /**
   * Run BEFORE marked converts markdown to HTML.
   * Use this to transform markdown syntax into something else,
   * or to inject custom markdown syntax.
   */
  preProcess?(md: string): string;

  /**
   * Run AFTER marked converts markdown to HTML.
   * Use this to transform HTML output, replace code blocks,
   * or inject scripts/styles.
   */
  postProcess?(html: string): string;
}
```

Both `preProcess` and `postProcess` are optional. A plugin can implement one, both, or neither (though a plugin with neither hook does nothing).

### Registered Plugins

The plugin registry (`scripts/plugins/index.ts`) exports the active plugins array:

```ts:desc=MarkdownPlugin interface definition
import { mathPlugin } from "./math.ts";
import { admonitionsPlugin } from "./admonitions.ts";
import { mermaidPlugin } from "./mermaid.ts";

export const plugins: MarkdownPlugin[] = [mathPlugin, admonitionsPlugin, mermaidPlugin];
```

**Order matters:**

| Order | Plugin | Phase | Purpose |
|---|---|---|---|
| 1 | `mathPlugin` | `preProcess` | Extracts `$...$` math expressions outside code blocks |
| 2 | `admonitionsPlugin` | `preProcess` | Extracts `:::` blocks (runs after math is removed from content) |
| 3 | `mermaidPlugin` | `postProcess` | Transforms mermaid code blocks into rendered diagram wrappers |

## MarkdownValidator Interface

Validators analyze markdown content for quality checks. They run independently of the build pipeline and can be invoked via `bun run validate` commands.

```ts:desc=MarkdownPlugin interface definition
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
```

### ValidationIssue

```ts:desc=MarkdownPlugin interface definition
export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  severity: ValidationSeverity;
  file: string;
  line?: number;
  message: string;
  detail?: string;
}
```

| Field | Description |
|---|---|
| `severity` | `"error"` (build fails), `"warning"` (advisory), `"info"` (informational) |
| `file` | Relative path to the markdown file |
| `line` | Optional line number where the issue was found |
| `message` | Human-readable description of the issue |
| `detail` | Optional additional context or suggestion |

### ValidationResult

```ts:desc=MarkdownPlugin interface definition
export interface ValidationResult {
  /** Number of items checked */
  checked: number;
  /** Issues found */
  issues: ValidationIssue[];
  /** Statistics for reporting */
  stats?: Record<string, number>;
}
```

### Registered Validators

The validator registry (`scripts/plugins/validators/index.ts`) exports:

```ts:desc=MarkdownPlugin interface definition
export const validators: MarkdownValidator[] = [
  codeblockValidator,     // STRICT - fails build if missing descriptions
  mermaidValidator,       // STRICT - fails build if invalid mermaid content
  frontmatterValidator,   // NOT strict - exposes frontmatter data for LLM use
  admonitionValidator,    // NOT strict - only informs about enrichment
  referenceValidator,     // STRICT - fails build if missing references/footnotes
];
```

Strict validators (`isStrict: true`) cause the build to fail when errors are found. Non-strict validators only report warnings and info.

## Writing a Plugin

### Example: Custom Syntax Plugin

A plugin that transforms a custom `!!important!!` syntax into an admonition:

```ts:desc=MarkdownPlugin interface definition
import type { MarkdownPlugin } from "./types.ts";

export const importantPlugin: MarkdownPlugin = {
  name: "important",
  preProcess(md: string): string {
    // Replace !!text!! with :::note...:::
    return md.replace(/!!(.+?)!!/g, ":::note\n$1\n:::");
  },
};
```

Add it to the registry:

```ts:desc=MarkdownPlugin interface definition
// scripts/plugins/index.ts
import { importantPlugin } from "./important.ts";

export const plugins: MarkdownPlugin[] = [
  mathPlugin,
  admonitionsPlugin,
  mermaidPlugin,
  importantPlugin, // added after admonitions so :::note is processed
];
```

### Example: Post-Process Plugin

A plugin that injects a script after all HTML is generated:

```ts:desc=MarkdownPlugin interface definition
import type { MarkdownPlugin } from "./types.ts";

export const injectAnalyticsPlugin: MarkdownPlugin = {
  name: "inject-analytics",
  postProcess(html: string): string {
    return html.replace(
      "</body>",
      `<script src="/analytics.js"></script></body>`
    );
  },
};
```

## Error Handling

The build script wraps plugin execution in try/catch blocks. If a plugin throws an error, it is logged as a diagnostic but does not crash the entire build:

```ts:desc=MarkdownPlugin interface definition
for (const plugin of plugins) {
  if (plugin.preProcess) {
    try {
      processed = plugin.preProcess(processed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      diags.error("plugin", relPath, `Plugin "${plugin.name}" preProcess failed`, msg);
    }
  }
}
```

PostProcess hooks run in **reverse order** with the same error handling.

## Available Validators

### codeblockValidator

Checks that all fenced code blocks have a language specified and a meaningful description via the `desc` metadata:

`````markdown:desc=Codeblock syntax example
```typescript:desc=Example usage of the DI container
const container = createContainer();
```````

Missing descriptions generate a **warning**. Missing language generates an **error** in strict mode.

### mermaidValidator

Validates that mermaid diagram blocks contain parseable content. Checks for:

- Empty mermaid blocks
- Syntax that would fail `mermaid.parse()`
- Missing diagram type declarations

### frontmatterValidator

Extracts and validates frontmatter fields. Reports:

- Missing `title` or `description`
- Invalid `sidebar_position` values
- Unknown frontmatter fields (reported as info for metadata tracking)

### admonitionValidator

Analyzes admonition usage across documents. Reports:

- Documents with no admonitions (info)
- Admonition type distribution
- Suggested admonition types based on content patterns

### referenceValidator

Validates footnote references. Checks that:

- All footnote references have a matching definition
- No orphaned footnote definitions exist

## Validation CLI Commands

```bash
# Run all validators
bun run validate

# Strict mode (fail on warnings too)
bun run validate:strict

# Show statistics only
bun run validate:stats

# Output in LLM-readable format
bun run validate:llm
```

## Cross-References

- [Generated Output](./01-generated-output.md) -- how plugins affect generated doc content
- [Configuration](./03-configuration.md) -- build configuration that controls the pipeline
- [File Structure](./05-file-structure.md) -- location of `scripts/plugins/` directory
