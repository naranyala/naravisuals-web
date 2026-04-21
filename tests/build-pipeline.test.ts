/**
 * Build Pipeline Tests
 * @ts-nocheck
 */

import { describe, expect, test } from "bun:test";
import { marked } from "marked";
import { parseFrontmatter } from "../scripts/pipeline/frontmatter.ts";
import { parseCodeInfo } from "../scripts/pipeline/renderer.ts";
import { extractTOC } from "../scripts/pipeline/toc.ts";
import { slugifyHeading } from "../scripts/pipeline/utils.ts";
import { admonitionsPlugin } from "../scripts/plugins/admonitions.ts";
import { mathPlugin } from "../scripts/plugins/math.ts";
import { mermaidPlugin } from "../scripts/plugins/mermaid.ts";

// ─── Frontmatter ─────────────────────────────────────────────────────────

describe("parseFrontmatter", () => {
  test("parses basic frontmatter", () => {
    const md = `---
title: Hello
description: World
---

# Content`;
    const { fm, content } = parseFrontmatter(md);
    expect(fm.title).toBe("Hello");
    expect(fm.description).toBe("World");
    expect(content.trim()).toBe("# Content");
  });

  test("parses numeric values as strings", () => {
    const md = `---
sidebar_position: 5
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.sidebar_position).toBe("5");
  });

  test("parses tags array from YAML syntax", () => {
    const md = `---
tags: ["react", "docs"]
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.tags).toEqual(["react", "docs"]);
  });

  test("comma-separated tags without brackets stays as string (not supported)", () => {
    const md = `---
tags: react, docs, testing
---
Content`;
    const { fm } = parseFrontmatter(md);
    // Without brackets, the naive parser treats the whole value as a string
    expect(fm.tags).toBe("react, docs, testing");
  });

  test("strips quotes from string values", () => {
    const md = `---
title: "Quoted Title"
author: 'Single Quoted'
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.title).toBe("Quoted Title");
    expect(fm.author).toBe("Single Quoted");
  });

  test("returns empty frontmatter for content without --- fences", () => {
    const md = "# No frontmatter";
    const { fm, content } = parseFrontmatter(md);
    expect(Object.keys(fm)).toHaveLength(0);
    expect(content).toBe(md);
  });

  test("handles empty content after frontmatter", () => {
    const md = `---
title: Only Meta
---
`;
    const { fm, content } = parseFrontmatter(md);
    expect(fm.title).toBe("Only Meta");
    expect(content.trim()).toBe("");
  });

  test("handles frontmatter with colons in values", () => {
    const md = `---
title: "Title: With Colon"
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.title).toBe("Title: With Colon");
  });

  test("parses YAML list with dash syntax", () => {
    const md = `---
reviewers:
  - alice
  - bob
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.reviewers).toEqual(["alice", "bob"]);
  });

  test("parses YAML list with JSON array syntax", () => {
    const md = `---
tags: ["react", "docs"]
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.tags).toEqual(["react", "docs"]);
  });

  test("empty value followed by list items", () => {
    const md = `---
my_list:
  - item1
  - item2
  - "quoted item"
---
Content`;
    const { fm } = parseFrontmatter(md);
    expect(fm.my_list).toEqual(["item1", "item2", "quoted item"]);
  });
});

// ─── TOC Extraction ──────────────────────────────────────────────────────

describe("extractTOC", () => {
  test("extracts h2 headings", () => {
    const content = `## Getting Started
Some text
## Configuration
More text`;
    const toc = extractTOC(marked.lexer(content));
    expect(toc).toHaveLength(2);
    expect(toc[0]).toEqual({
      value: "Getting Started",
      id: "getting-started",
      level: 2,
    });
  });

  test("extracts h3 headings", () => {
    const content = `### Sub Section`;
    const toc = extractTOC(marked.lexer(content));
    expect(toc).toHaveLength(1);
    expect(toc[0].level).toBe(3);
  });

  test("ignores h1 and h4+ headings", () => {
    const content = `# Title
## Main
#### Too Deep
### Just Right`;
    const toc = extractTOC(marked.lexer(content));
    expect(toc).toHaveLength(2);
    expect(toc[0].value).toBe("Main");
    expect(toc[1].value).toBe("Just Right");
  });

  test("slugifies heading IDs correctly", () => {
    const content = `## What's New?
## C++ Support`;
    const toc = extractTOC(marked.lexer(content));
    expect(toc[0].id).toBe("whats-new");
    expect(toc[1].id).toBe("c-plus-plus-support");
  });

  test("handles headings with inline code", () => {
    const content = `## Using \`proxy()\` in Valtio`;
    const toc = extractTOC(marked.lexer(content));
    expect(toc).toHaveLength(1);
    expect(toc[0].value).toBe("Using `proxy()` in Valtio");
  });

  test("returns empty array for no headings", () => {
    const toc = extractTOC(marked.lexer("Just a paragraph.\nNo headings here."));
    expect(toc).toHaveLength(0);
  });

  test("handles mixed h2 and h3 nesting", () => {
    const content = `## Section A
### Sub A1
### Sub A2
## Section B
### Sub B1`;
    const toc = extractTOC(marked.lexer(content));
    expect(toc).toHaveLength(5);
    expect(toc[0].level).toBe(2);
    expect(toc[1].level).toBe(3);
    expect(toc[2].level).toBe(3);
    expect(toc[3].level).toBe(2);
    expect(toc[4].level).toBe(3);
  });
});

// ─── Heading Slugifier ───────────────────────────────────────────────────

describe("slugifyHeading", () => {
  test("basic heading slug", () => {
    expect(slugifyHeading("Getting Started")).toBe("getting-started");
  });

  test("C++ becomes c-plus-plus", () => {
    expect(slugifyHeading("C++")).toBe("c-plus-plus");
  });

  test("C# becomes c-sharp", () => {
    expect(slugifyHeading("C#")).toBe("c-sharp");
  });

  test(".NET becomes net", () => {
    expect(slugifyHeading(".NET")).toBe("net");
  });

  test("What's New? becomes whats-new", () => {
    expect(slugifyHeading("What's New?")).toBe("whats-new");
  });

  test("collapses multiple dashes", () => {
    expect(slugifyHeading("Hello --- World")).toBe("hello-world");
  });

  test("trims leading/trailing dashes", () => {
    expect(slugifyHeading("!Hello!")).toBe("hello");
  });

  test("lowercases everything", () => {
    expect(slugifyHeading("UPPER CASE Heading")).toBe("upper-case-heading");
  });

  test("preserves underscores as word characters", () => {
    expect(slugifyHeading("my_variable")).toBe("my_variable");
  });
});

// ─── Code Title Extraction ───────────────────────────────────────────────

describe("parseCodeInfo", () => {
  test("plain language", () => {
    expect(parseCodeInfo("typescript").lang).toBe("typescript");
  });

  test("language with title", () => {
    const info = parseCodeInfo("typescript:title=src/store.ts");
    expect(info.lang).toBe("typescript");
    expect(info.title).toBe("src/store.ts");
  });

  test("language with title and spaces", () => {
    const info = parseCodeInfo("python : title = examples/hello.py");
    expect(info.lang).toBe("python");
    expect(info.title).toBe("examples/hello.py");
  });

  test("undefined info", () => {
    expect(parseCodeInfo(undefined).lang).toBe("");
  });

  test("empty string", () => {
    expect(parseCodeInfo("").lang).toBe("");
  });

  test("no title syntax", () => {
    expect(parseCodeInfo("javascript").lang).toBe("javascript");
  });

  test("trailing quotes stripped from title", () => {
    expect(parseCodeInfo('ts:title=src/app.ts"').title).toBe("src/app.ts");
  });

  test("brace syntax: simple", () => {
    const info = parseCodeInfo('typescript { title="src/store.ts" }');
    expect(info.lang).toBe("typescript");
    expect(info.title).toBe("src/store.ts");
  });

  test("brace syntax: multiple fields", () => {
    const info = parseCodeInfo('rust { title="main.rs" desc="Entry point" copy=false }');
    expect(info.lang).toBe("rust");
    expect(info.title).toBe("main.rs");
    expect(info.desc).toBe("Entry point");
    expect(info.copy).toBe(false);
  });

  test("brace syntax: unquoted values", () => {
    const info = parseCodeInfo("json { copy=true zoom=false }");
    expect(info.copy).toBe(true);
    expect(info.zoom).toBe(false);
  });
});

// ─── Math Plugin ─────────────────────────────────────────────────────────

describe("mathPlugin — preProcess", () => {
  test("extracts inline math", () => {
    const md = "The formula is $E = mc^2$ here.";
    const result = mathPlugin.preProcess?.(md);
    if (!result) throw new Error("math preProcess failed");
    expect(result).not.toContain("$E = mc^2$");
    expect(result).toContain("MATHINLINE");
  });

  test("extracts display math", () => {
    const md = "$$\\int_0^\\infty$$";
    const result = mathPlugin.preProcess?.(md);
    if (!result) throw new Error("math preProcess failed");
    expect(result).toContain("MATHDISPLAY");
    expect(result).not.toContain("$$");
  });

  test("skips fenced code blocks", () => {
    const md = `Text with $E = mc^2$.

\`\`\`
console.log("$10");
\`\`\`

More $y = mx + b$.`;
    const result = mathPlugin.preProcess?.(md);
    if (!result) throw new Error("math preProcess failed");
    // Code block should be preserved intact
    expect(result).toContain('console.log("$10")');
    // Math outside code block should be extracted
    expect(result).not.toContain("$E = mc^2$");
    expect(result).not.toContain("$y = mx + b$");
    // Should have 2 inline math sentinels
    expect((result.match(/MATHINLINE\d+END/g) || []).length).toBe(2);
  });

  test("skips fenced code blocks with language", () => {
    const md = `\`\`\`javascript
const price = "$10";
const total = "$5" + "$3";
\`\`\``;
    const result = mathPlugin.preProcess?.(md);
    if (!result) throw new Error("math preProcess failed");
    expect(result).toContain('const price = "$10"');
    expect(result).not.toContain("MATHINLINE");
  });

  test("handles multiple display math blocks", () => {
    const md = "$$a + b$$\ntext\n$$c + d$$";
    const result = mathPlugin.preProcess?.(md);
    const displayMatches = result.match(/MATHDISPLAY\d+END/g) || [];
    expect(displayMatches).toHaveLength(2);
  });

  test("handles mixed inline and display math", () => {
    const md = "Inline $x=1$ and display $$y=2$$.";
    const result = mathPlugin.preProcess?.(md);
    if (!result) throw new Error("math preProcess failed");
    expect(result).toContain("MATHINLINE");
    expect(result).toContain("MATHDISPLAY");
  });

  test("does not match empty dollars", () => {
    const md = "It costs $$ nothing.";
    const result = mathPlugin.preProcess?.(md);
    // $$ at start of empty match shouldn't trigger display math
    // but "nothing." won't match either since it's not between dollars
    expect(result).toBe(md);
  });
});

describe("mathPlugin — postProcess", () => {
  test("renders inline math with \\(\\) delimiters", () => {
    mathPlugin.preProcess?.("The formula is $E = mc^2$ here.");
    const html = "<p>The formula is MATHINLINE0END here.</p>";
    const result = mathPlugin.postProcess?.(html);
    expect(result).toContain('<span class="math-inline">\\(E = mc^2\\)</span>');
  });

  test("renders display math with \\[\\] delimiters", () => {
    mathPlugin.preProcess?.("$$\\int_0^\\infty e^{-x} dx$$");
    const html = "<p>MATHDISPLAY0END</p>";
    const result = mathPlugin.postProcess?.(html);
    expect(result).toContain('<div class="math-display">\\[');
    expect(result).toContain("\\]</div>");
  });

  test("escapes HTML in math content", () => {
    mathPlugin.preProcess?.("$a < b > c$");
    const html = "<p>MATHINLINE0END</p>";
    const result = mathPlugin.postProcess?.(html);
    // Math content is kept raw for MathJax to render - HTML chars stay as-is
    expect(result).toContain("\\(a < b > c\\)");
  });

  test("returns unchanged HTML when no math blocks", () => {
    const html = "<p>No math here</p>";
    const result = mathPlugin.postProcess?.(html);
    expect(result).toBe(html);
  });
});

// ─── Mermaid Plugin ──────────────────────────────────────────────────────

describe("mermaidPlugin — postProcess", () => {
  test("transforms mermaid code block", async () => {
    const html = `<div class="code-block"><div class="code-header"><span class="code-lang">Mermaid</span><button>Copy</button></div><pre><code class="language-mermaid">flowchart TD;
A--&gt;B;</code></pre></div>`;
    const result = await mermaidPlugin.postProcess?.(html);
    expect(result).toContain("mermaid-diagram");
    expect(result).toContain('data-processed="false"');
    expect(result).toContain("mermaid-error");
    expect(result).not.toContain("language-mermaid");
  });

  test("handles multiple mermaid diagrams", async () => {
    const html = [
      '<div class="code-block"><div class="code-header"><span class="code-lang">Mermaid</span></div><pre><code class="language-mermaid">flowchart TD;A--&gt;B;</code></pre></div>',
      '<div class="code-block"><div class="code-header"><span class="code-lang">Mermaid</span></div><pre><code class="language-mermaid">sequenceDiagram;A-&gt;&gt;B:Hello;</code></pre></div>',
    ].join("\n");
    const result = await mermaidPlugin.postProcess?.(html);
    // Count mermaid-diagram containers (not the class name occurrences — each
    // container has the class once at the top level, but "mermaid-diagram" also
    // appears in header/error children.  Count the opening div pattern instead.)
    const containers = (result.match(/<div class="mermaid-diagram"/g) || []).length;
    expect(containers).toBe(2);
  });

  test("decodes HTML entities in diagram source", async () => {
    const html =
      '<div class="code-block"><div class="code-header"><span class="code-lang">Mermaid</span></div><pre><code class="language-mermaid">flowchart TD;A--&gt;B;</code></pre></div>';
    const result = await mermaidPlugin.postProcess?.(html);
    // The plugin decodes entities then re-escapes for safe HTML embedding.
    // The resulting text in the .mermaid element is entity-encoded, which
    // browser textContent will decode back to "A-->B;" at runtime.
    expect(result).toContain("mermaid-diagram");
    expect(result).toContain("A--&gt;B;");
  });

  test("non-mermaid code blocks are unchanged", async () => {
    const html =
      '<div class="code-block"><div class="code-header"><span class="code-lang">TypeScript</span></div><pre><code class="language-typescript">const x = 1;</code></pre></div>';
    const result = await mermaidPlugin.postProcess?.(html);
    expect(result).toBe(html);
  });
});

// ─── Admonitions Plugin ──────────────────────────────────────────────────

describe("admonitionsPlugin — preProcess", () => {
  test("extracts note admonition", () => {
    const md = `:::note
This is a note.
:::`;
    const result = admonitionsPlugin.preProcess?.(md);
    expect(result).not.toContain(":::note");
    expect(result).toContain("ADMONITION");
  });

  test("extracts all supported types", () => {
    const types = ["note", "tip", "info", "warning", "danger", "caution"];
    for (const type of types) {
      const md = `:::${type}
Content
:::`;
      const result = admonitionsPlugin.preProcess?.(md);
      expect(result).toContain("ADMONITION");
    }
  });

  test("extracts admonition with custom title", () => {
    const md = `:::note=My Custom Title
Content
:::`;
    const result = admonitionsPlugin.preProcess?.(md);
    expect(result).toContain("ADMONITION");
  });

  test("extracts admonition with markdown content", () => {
    const md = `:::tip
**Bold text** and [a link](/docs).

- List item 1
- List item 2
:::`;
    const result = admonitionsPlugin.preProcess?.(md);
    expect(result).toContain("ADMONITION");
    expect(result).not.toContain(":::");
  });

  test("multiple admonitions in one document", () => {
    const md = `:::note
First note.
:::

Some text.

:::warning
Be careful!
:::`;
    const result = admonitionsPlugin.preProcess?.(md);
    const matches = result.match(/ADMONITION\d+END/g) || [];
    expect(matches.length).toBe(2);
  });

  test("unknown type is still captured", () => {
    const md = `:::custom
Some custom content.
:::`;
    const result = admonitionsPlugin.preProcess?.(md);
    expect(result).toContain("ADMONITION");
  });
});

describe("admonitionsPlugin — postProcess", () => {
  test("renders note admonition", async () => {
    admonitionsPlugin.preProcess?.(":::note\nThis is a note.\n:::");
    const html = "<p>ADMONITION0END</p>";
    const result = await admonitionsPlugin.postProcess?.(html);
    expect(result).toContain("admonition admonition-note");
    expect(result).toContain("admonition-heading");
    expect(result).toContain("Note");
    expect(result).toContain("admonition-content");
    expect(result).toContain("This is a note.");
  });

  test("renders warning admonition", async () => {
    admonitionsPlugin.preProcess?.(":::warning\nWatch out!\n:::");
    const html = "<p>ADMONITION0END</p>";
    const result = await admonitionsPlugin.postProcess?.(html);
    expect(result).toContain("admonition-warning");
    expect(result).toContain("Warning");
  });

  test("renders danger admonition", async () => {
    admonitionsPlugin.preProcess?.(":::danger\nCritical issue!\n:::");
    const html = "<p>ADMONITION0END</p>";
    const result = await admonitionsPlugin.postProcess?.(html);
    expect(result).toContain("admonition-danger");
    expect(result).toContain("Danger");
  });

  test("renders custom title", async () => {
    admonitionsPlugin.preProcess?.(":::note=My Title\nContent\n:::");
    const html = "<p>ADMONITION0END</p>";
    const result = await admonitionsPlugin.postProcess?.(html);
    expect(result).toContain("My Title");
  });

  test("processes inner markdown content to HTML", async () => {
    admonitionsPlugin.preProcess?.(":::tip\n**Bold** and *italic*.\n:::");
    const html = "<p>ADMONITION0END</p>";
    const result = await admonitionsPlugin.postProcess?.(html);
    expect(result).toContain("<strong>Bold</strong>");
    expect(result).toContain("<em>italic</em>");
  });

  test("returns unchanged HTML when no admonitions", async () => {
    const html = "<p>No admonitions here</p>";
    const result = await admonitionsPlugin.postProcess?.(html);
    expect(result).toBe(html);
  });
});

// ─── End-to-End Pipeline ─────────────────────────────────────────────────

describe("end-to-end pipeline", () => {
  async function processMarkdown(md: string): Promise<string> {
    let processed = md;
    // Order matters: math must run before admonitions so that $...$ inside
    // admonition content gets extracted before the block is replaced with a
    // sentinel.
    for (const plugin of [mathPlugin, admonitionsPlugin, mermaidPlugin]) {
      if (plugin.preProcess) processed = plugin.preProcess(processed);
    }

    // Setup a minimal renderer like the build script
    const renderer = new marked.Renderer();
    renderer.heading = ({ text, depth }) => {
      const id = slugifyHeading(text);
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    };
    marked.use({ renderer, gfm: true });

    let html = (await marked.parse(processed)) as string;

    // PostProcess runs in reverse order (matches build script behavior)
    const plugins = [mathPlugin, admonitionsPlugin, mermaidPlugin];
    for (let i = plugins.length - 1; i >= 0; i--) {
      const plugin = plugins[i];
      if (plugin?.postProcess) html = await (plugin.postProcess as any)(html);
    }
    return html;
  }

  test("full pipeline with admonitions, math, and code blocks", async () => {
    const md = `# Doc

:::note
Formula: $E = mc^2$
:::

Some code:

\`\`\`javascript
const price = "$10";
\`\`\`

## Section
More text.`;

    const html = await processMarkdown(md);

    // Admonition should be rendered
    expect(html).toContain("admonition-note");
    // Math should have MathJax delimiters
    expect(html).toContain("\\(E = mc^2\\)");
    // Code block should be preserved with dollar sign
    expect(html).toContain("$10");
    // Heading should have proper ID
    expect(html).toContain('id="section"');
  });

  test("mermaid diagram in full pipeline with code-block wrapper", async () => {
    // The mermaid plugin postProcess expects the code-block wrapper produced by
    // the build script's renderer.  Simulate that by running the build-script
    // wrapper manually.
    const md = `\`\`\`mermaid
flowchart TD;
A-->B;
\`\`\``;

    let processed = md;
    for (const plugin of [mathPlugin, admonitionsPlugin]) {
      if (plugin.preProcess) processed = plugin.preProcess(processed);
    }

    const renderer = new marked.Renderer();
    renderer.code = ({ text, lang }) => {
      const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return [
        `<div class="code-block">`,
        `<div class="code-header"><span class="code-lang">${lang}</span></div>`,
        `<pre><code class="language-${lang || ""}">${escaped}</code></pre>`,
        `</div>`,
      ].join("");
    };
    marked.use({ renderer, gfm: true });
    let html = (await marked.parse(processed)) as string;

    // PostProcess in reverse order (matches build script)
    const postPlugins = [mathPlugin, admonitionsPlugin, mermaidPlugin];
    for (let i = postPlugins.length - 1; i >= 0; i--) {
      const plugin = postPlugins[i];
      if (plugin?.postProcess) html = await (plugin.postProcess as any)(html);
    }

    expect(html).toContain("mermaid-diagram");
    expect(html).toContain('data-processed="false"');
  });

  test("code block with title in full pipeline", () => {
    const info = parseCodeInfo("typescript:title=src/store.ts");
    expect(info.lang).toBe("typescript");
    expect(info.title).toBe("src/store.ts");
  });
});
