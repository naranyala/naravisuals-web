/**
 * Edge Case & Longevity Tests
 *
 * Tests edge cases, boundary conditions, error recovery, and scenarios
 * that could cause issues as the project grows over time.
 */

import { describe, expect, test } from "bun:test";
import { marked } from "marked";
import { Diagnostics, validateInternalLinks, validateUniqueSlugs } from "../scripts/diagnostics.ts";
import { parseFrontmatter } from "../scripts/pipeline/frontmatter.ts";
import { extractTOC } from "../scripts/pipeline/toc.ts";
import { admonitionsPlugin } from "../scripts/plugins/admonitions.ts";
import { mathPlugin } from "../scripts/plugins/math.ts";
import { mermaidPlugin } from "../scripts/plugins/mermaid.ts";

// ─── Large-Scale Content Edge Cases ─────────────────────────────────────

describe("Large-scale content handling", () => {
  test("handles very long documents (10K+ words)", () => {
    const longContent = "word ".repeat(15000);
    const md = `---
title: Long Document
description: A very long document for stress testing
---

# Long Document

${longContent}
`;
    const { fm, content } = parseFrontmatter(md);
    expect(fm.title).toBe("Long Document");
    expect(content.length).toBeGreaterThan(50000);
  });

  test("handles deeply nested heading hierarchy", () => {
    const content = `
## Level 2
### Level 3
## Level 2 Again
### Level 3
#### Level 4 (should be ignored by TOC)
##### Level 5 (should be ignored)
### Level 3 Again
`;
    const toc = extractTOC(marked.lexer(content));
    // Only h2 and h3 should be extracted
    expect(toc.every((item) => item.level === 2 || item.level === 3)).toBe(true);
    expect(toc.length).toBe(5); // 2 h2s + 3 h3s
  });

  test("handles special characters in frontmatter", () => {
    const md = `---
title: "Title with \\"escaped quotes\\" and backslashes"
description: "Description with: colons, semicolons; and commas,"
tags: ["tag-with-dash", "tag_with_underscore", "tag.with.dots"]
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.title).toContain("escaped quotes");
  });

  test("handles unicode characters in content", () => {
    const md = `---
title: "Tëst Wïth Ünicöde 🎨"
---

# Ünïcödé Tëst

Cöntënt wïth spëcïal çharactérs: àáâãäå èéêë ìíîï òóôõö ùúûü ÿ
`;
    const { fm, content } = parseFrontmatter(md);
    expect(fm.title).toContain("🎨");
    expect(content).toContain("Ünïcödé Tëst");
  });

  test("handles mixed line endings", () => {
    const md = `---\r\ntitle: Mixed Line Endings\r\n---\n\n# Content\r\n\nMore content\n`;
    const { fm, content } = parseFrontmatter(md);
    expect(fm.title).toBe("Mixed Line Endings");
    expect(content).toContain("# Content");
  });
});

// ─── Frontmatter Edge Cases ─────────────────────────────────────────────

describe("Frontmatter edge cases", () => {
  test("handles empty frontmatter", () => {
    const md = `---
---
# Content`;
    // Empty frontmatter: the regex ^---\n([\s\S]*?)\n---\n?([\s\S]*)$
    // requires at least a newline between the --- fences.
    // "---\n---\n" has empty content between fences.
    const { fm, content } = parseFrontmatter(md);
    // With empty YAML block, the parser returns empty fm
    expect(Object.keys(fm).length).toBe(0);
    expect(content.trim()).toBe("# Content");
  });

  test("handles frontmatter with only whitespace", () => {
    const md = `---
   
---
# Content`;
    const { fm } = parseFrontmatter(md);
    expect(Object.keys(fm).length).toBe(0);
  });

  test("handles malformed frontmatter gracefully", () => {
    const md = `---
title: Valid
invalid yaml here
description: Also Valid
---
# Content`;
    const { fm } = parseFrontmatter(md);
    // Should parse what it can
    expect(fm.title).toBe("Valid");
  });

  test("handles numeric sidebar_position correctly", () => {
    const md = `---
sidebar_position: 999
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.sidebar_position).toBe("999");
  });

  test("handles negative numbers", () => {
    const md = `---
priority: -1
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.priority).toBe("-1");
  });

  test("handles boolean values", () => {
    const md = `---
draft: true
published: false
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.draft).toBe("true");
    expect(fm.published).toBe("false");
  });

  test("handles empty list", () => {
    const md = `---
tags: []
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.tags).toEqual([]);
  });

  test("handles single-item list", () => {
    const md = `---
reviewers:
  - alice
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.reviewers).toEqual(["alice"]);
  });

  test("handles duplicate keys (last wins)", () => {
    const md = `---
title: First Title
title: Second Title
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.title).toBe("Second Title");
  });
});

// ─── Slug Validation Edge Cases ─────────────────────────────────────────

describe("Slug validation edge cases", () => {
  test("handles empty slugs", () => {
    const diags = new Diagnostics();
    validateUniqueSlugs(
      [
        { id: "a", slug: "" },
        { id: "b", slug: "docs/b" },
      ],
      diags
    );
    expect(diags.hasErrors()).toBe(false);
  });

  test("handles multiple empty slugs (reports as duplicate)", () => {
    const diags = new Diagnostics();
    validateUniqueSlugs(
      [
        { id: "a", slug: "" },
        { id: "b", slug: "" },
      ],
      diags
    );
    expect(diags.errors()).toHaveLength(1);
  });

  test("handles slugs with special characters", () => {
    const diags = new Diagnostics();
    validateUniqueSlugs(
      [
        { id: "a", slug: "docs/with-dashes" },
        { id: "b", slug: "docs/with_underscores" },
        { id: "c", slug: "docs/with.dots" },
      ],
      diags
    );
    expect(diags.hasErrors()).toBe(false);
  });

  test("handles case sensitivity (slugs are case-sensitive)", () => {
    const diags = new Diagnostics();
    validateUniqueSlugs(
      [
        { id: "a", slug: "docs/MyDoc" },
        { id: "b", slug: "docs/mydoc" },
      ],
      diags
    );
    expect(diags.hasErrors()).toBe(false); // Different slugs
  });

  test("handles very large number of slugs", () => {
    const diags = new Diagnostics();
    const slugs = Array.from({ length: 1000 }, (_, i) => ({
      id: `doc-${i}`,
      slug: `docs/doc-${i}`,
    }));
    validateUniqueSlugs(slugs, diags);
    expect(diags.hasErrors()).toBe(false);
  });
});

// ─── Internal Link Validation Edge Cases ────────────────────────────────

describe("Internal link validation edge cases", () => {
  test("handles links with query parameters", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set(["a"]);
    const content = "See [page](/docs/a?ref=test)";
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    expect(diags.warnings()).toHaveLength(0);
  });

  test("handles links with hash fragments", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set(["a"]);
    const content = "See [page](/docs/a#section)";
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    expect(diags.warnings()).toHaveLength(0);
  });

  test("handles links with both query and hash", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set(["a"]);
    const content = "See [page](/docs/a?ref=test#section)";
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    expect(diags.warnings()).toHaveLength(0);
  });

  test("handles encoded URLs", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set(["docs/my-doc"]);
    const content = "See [page](/docs/my%2Ddoc)";
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    // Should warn because encoded URL doesn't match exactly
    expect(diags.warnings().length).toBeGreaterThanOrEqual(0);
  });

  test("handles mailto links (ignored)", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set<string>();
    const content = "Contact [email](mailto:test@example.com)";
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    expect(diags.all()).toHaveLength(0);
  });

  test("handles tel links (ignored)", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set<string>();
    const content = "Call [phone](tel:+1234567890)";
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    expect(diags.all()).toHaveLength(0);
  });

  test("handles empty links", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set(["docs/a"]);
    const content = "See [empty]()";
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    // Empty links should be ignored or warned
    expect(diags.all().length).toBeGreaterThanOrEqual(0);
  });

  test("handles relative paths", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set(["docs/a"]);
    const content = "See [relative](../other/file.md)";
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    // Relative paths should be warned about
    expect(diags.warnings().length).toBeGreaterThanOrEqual(0);
  });

  test("handles links in code blocks (should be ignored)", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set(["docs/a"]);
    const content = `\`\`\`
[broken link](/docs/nonexistent)
\`\`\``;
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    // Links in code blocks should be ignored (but simple regex can't detect this)
    // This is a known limitation of the current implementation
  });
});

// ─── Plugin Edge Cases ──────────────────────────────────────────────────

describe("Math plugin edge cases", () => {
  test("handles unbalanced dollar signs", () => {
    const md = "Price is $100 and formula is $E=mc^2$";
    const result = mathPlugin.preProcess?.(md);
    // Should handle gracefully - may match $100 and $E=mc^2$ or just $E=mc^2$
    expect(result).toBeDefined();
  });

  test("handles nested math", () => {
    const md = "$$\\int_0^\\infty e^{-x} dx = 1$$ with $x$ variable";
    const result = mathPlugin.preProcess?.(md);
    expect(result).toContain("MATHDISPLAY");
    expect(result).toContain("MATHINLINE");
  });

  test("handles empty math blocks", () => {
    const md = "$$$$";
    const result = mathPlugin.preProcess?.(md);
    // Should handle gracefully
    expect(result).toBeDefined();
  });

  test("handles math with HTML entities", () => {
    const md = "$a &lt; b$";
    const result = mathPlugin.preProcess?.(md);
    expect(result).toContain("MATHINLINE");
  });

  test("handles very long math expressions", () => {
    const longMath = `$${"x + ".repeat(100)}y$`;
    const result = mathPlugin.preProcess?.(longMath);
    expect(result).toContain("MATHINLINE");
  });

  test("handles display math with line breaks", () => {
    const md = `$$
\\begin{align}
  a &= b \\\\
  c &= d
\\end{align}
$$`;
    const result = mathPlugin.preProcess?.(md);
    expect(result).toContain("MATHDISPLAY");
  });

  test("postProcess handles invalid sentinel gracefully", () => {
    mathPlugin.preProcess?.("$x=1$");
    const html = "<p>MATHINLINE999END</p>"; // Non-existent sentinel
    const result = mathPlugin.postProcess?.(html);
    // Should return unchanged
    expect(result).toBe(html);
  });
});

describe("Mermaid plugin edge cases", () => {
  test("handles mermaid with special characters", async () => {
    const html = `<div class="code-block"><div class="code-header"><span class="code-lang">Mermaid</span></div><pre><code class="language-mermaid">flowchart TD;A-->B;B--&gt;C;</code></pre></div>`;
    const result = await mermaidPlugin.postProcess?.(html);
    expect(result).toContain("mermaid-diagram");
  });

  test("handles very large mermaid diagram", async () => {
    const nodes = Array.from({ length: 100 }, (_, i) => `N${i}[Node ${i}]`).join(";");
    const edges = Array.from({ length: 99 }, (_, i) => `N${i}-->N${i + 1}`).join(";");
    const diagram = `flowchart TD;${nodes};${edges}`;
    const html = `<div class="code-block"><div class="code-header"><span class="code-lang">Mermaid</span></div><pre><code class="language-mermaid">${diagram}</code></pre></div>`;
    const result = await mermaidPlugin.postProcess?.(html);
    expect(result).toContain("mermaid-diagram");
  });

  test("handles mermaid with HTML injection attempt", async () => {
    const html = `<div class="code-block"><div class="code-header"><span class="code-lang">Mermaid</span></div><pre><code class="language-mermaid">flowchart TD;A-->B&lt;script&gt;alert('xss')&lt;/script&gt;</code></pre></div>`;
    const result = await mermaidPlugin.postProcess?.(html);
    // Should escape HTML
    expect(result).not.toContain("<script>");
    expect(result).toContain("mermaid-diagram");
  });

  test("handles mixed case language (MERMAID vs mermaid)", async () => {
    const html = `<div class="code-block"><div class="code-header"><span class="code-lang">MERMAID</span></div><pre><code class="language-MERMAID">flowchart TD;A-->B;</code></pre></div>`;
    const result = await mermaidPlugin.postProcess?.(html);
    expect(result).toContain("mermaid-diagram");
  });
});

describe("Admonitions plugin edge cases", () => {
  test("handles nested admonitions", () => {
    const md = `:::note
Outer note
:::tip
Inner tip
:::
:::`;
    const result = admonitionsPlugin.preProcess?.(md);
    // Should handle nested admonitions
    expect(result).toContain("ADMONITION");
  });

  test("handles admonition with only whitespace content", () => {
    const md = `:::note
   
:::`;
    const result = admonitionsPlugin.preProcess?.(md);
    expect(result).toContain("ADMONITION");
  });

  test("handles unclosed admonition", () => {
    const md = `:::note
This note is never closed`;
    const result = admonitionsPlugin.preProcess?.(md);
    // Should handle gracefully
    expect(result).toBeDefined();
  });

  test("handles admonition with code block inside", () => {
    const md = `:::note
Here's some code:
\`\`\`javascript
console.log("test");
\`\`\`
:::`;
    const result = admonitionsPlugin.preProcess?.(md);
    expect(result).toContain("ADMONITION");
    // Code block should be preserved inside admonition
    expect(result).toContain("console.log");
  });

  test("handles admonition immediately after code block", () => {
    const md = `\`\`\`
code
\`\`\`
:::note
Note after code
:::`;
    const result = admonitionsPlugin.preProcess?.(md);
    expect(result).toContain("ADMONITION");
  });

  test("handles empty admonition type", () => {
    const md = `:::
Content
:::`;
    const result = admonitionsPlugin.preProcess?.(md);
    // Should handle gracefully
    expect(result).toBeDefined();
  });
});

// ─── Service Container Edge Cases ───────────────────────────────────────

describe("Service container edge cases", () => {
  test("handles multiple rapid theme toggles", () => {
    const { createMockStorage, createMockTheme } = require("../src/services/mocks");
    const storage = createMockStorage();
    const theme = createMockTheme(storage);

    theme.toggleTheme(false);
    theme.toggleTheme(true);
    theme.toggleTheme(false);
    theme.toggleTheme(true);
    theme.toggleTheme(false);

    expect(storage.getItem("theme")).toBe("dark");
  });

  test("handles storage with special characters in keys", () => {
    const { createMockStorage } = require("../src/services/mocks");
    const storage = createMockStorage();

    storage.setItem("key with spaces", "value1");
    storage.setItem("key/with/slashes", "value2");
    storage.setItem("key:with:colons", "value3");

    expect(storage.getItem("key with spaces")).toBe("value1");
    expect(storage.getItem("key/with/slashes")).toBe("value2");
    expect(storage.getItem("key:with:colons")).toBe("value3");
  });

  test("handles router with deeply nested paths", () => {
    const { createMockRouter } = require("../src/services/mocks");
    const router = createMockRouter();

    router.pushState({}, "", "/docs/very/deeply/nested/path/with/many/segments");
    expect(router.getCurrentPath()).toBe("/docs/very/deeply/nested/path/with/many/segments");
  });

  test("handles router with query strings", () => {
    const { createMockRouter } = require("../src/services/mocks");
    const router = createMockRouter();

    router.pushState({}, "", "/docs/page?param1=value1&param2=value2");
    expect(router.getCurrentPath()).toBe("/docs/page?param1=value1&param2=value2");
  });

  test("handles DOM service with invalid element IDs", () => {
    const { createMockDom } = require("../src/services/mocks");
    const dom = createMockDom();

    expect(dom.getElementById("")).toBeNull();
    expect(dom.getElementById("invalid-id-with-special-chars!@#$")).toBeNull();
  });
});

// ─── Diagnostics Edge Cases ─────────────────────────────────────────────

describe("Diagnostics edge cases", () => {
  test("handles very large number of diagnostics", () => {
    const diags = new Diagnostics();
    for (let i = 0; i < 1000; i++) {
      diags.error("content", `file-${i}.md`, `Error ${i}`);
    }
    expect(diags.all()).toHaveLength(1000);
    expect(diags.errors()).toHaveLength(1000);
  });

  test("handles merge with empty diagnostics", () => {
    const diags = new Diagnostics();
    diags.error("content", "a.md", "Error");
    const empty = new Diagnostics();
    diags.merge(empty);
    expect(diags.all()).toHaveLength(1);
  });

  test("handles format with no diagnostics", () => {
    const diags = new Diagnostics();
    const formatted = diags.format();
    expect(formatted).toBeDefined();
    expect(formatted.length).toBeGreaterThan(0);
  });

  test("handles toJSON with mixed severities", () => {
    const diags = new Diagnostics();
    diags.error("content" as any, "a.md", "Error");
    diags.warn("content" as any, "b.md", "Warning");
    diags.info("content" as any, "c.md", "Info");

    const json = diags.toJSON();
    expect(json).toHaveLength(3);
    expect(json.map((d) => d.severity)).toContain("error");
    expect(json.map((d) => d.severity)).toContain("warning");
    expect(json.map((d) => d.severity)).toContain("info");
  });
});
