/**
 * Stateful Markdown Renderer
 */

import { marked } from "marked";
import type { Highlighter, Language } from "shiki";
import { slugifyHeading } from "../pipeline/utils.ts";
import { parseCodeInfo, codeBlockWrapper } from "../pipeline/renderer.ts";

export class MarkdownRenderer {
  private readonly highlighter: Highlighter;
  private seenIds = new Set<string>();

  constructor(highlighter: Highlighter) {
    this.highlighter = highlighter;
  }

  /**
   * Reset the internal state (IDs) for a new file.
   */
  public reset() {
    this.seenIds.clear();
  }

  public getRenderer(): marked.Renderer {
    const renderer = new marked.Renderer();

    renderer.heading = ({ text, depth }) => {
      let id = slugifyHeading(text);
      let suffix = 1;
      const originalId = id;
      while (this.seenIds.has(id)) {
        id = `${originalId}-${suffix++}`;
      }
      this.seenIds.add(id);

      return `<h${depth} id="${id}">${text}<a class="hash-link" href="#${id}" aria-label="${text} permalink">#</a></h${depth}>`;
    };

    renderer.code = ({ text, lang: rawLang }) => {
      const meta = parseCodeInfo(rawLang);

      // Skip Shiki for all mermaid types and technical diagrams
      const mermaidTypes = [
        "mermaid", "flowchart", "sequenceDiagram", "classDiagram", "stateDiagram", 
        "erDiagram", "gantt", "pie", "quadrantChart", "xyChart", "mindmap", 
        "timeline", "journey", "requirementDiagram", "gitGraph", "sankey"
      ];
      
      const lowerLang = meta.lang.toLowerCase();
      if (mermaidTypes.includes(lowerLang) || ["timeline", "text (timeline)"].includes(lowerLang)) {
        const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return codeBlockWrapper(
          `<pre><code class="language-${meta.lang || ""}">${escaped}</code></pre>`,
          meta
        );
      }

      if (meta.lang && this.highlighter.getLoadedLanguages().includes(meta.lang as Language)) {
        const highlighted = this.highlighter.codeToHtml(text, { lang: meta.lang, theme: "github-dark" });
        return codeBlockWrapper(highlighted, meta);
      }

      const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return codeBlockWrapper(
        `<pre><code class="language-${meta.lang || ""}">${escaped}</code></pre>`,
        meta
      );
    };

    return renderer;
  }
}
