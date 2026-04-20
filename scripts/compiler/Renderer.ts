/**
 * Stateful Markdown Renderer
 */

import { marked } from "marked";
import { slugifyHeading } from "../pipeline/utils.ts";
import { parseCodeInfo, codeBlockWrapper } from "../pipeline/renderer.ts";
import type { Highlighter } from "shiki";

export class MarkdownRenderer {
  private seenIds = new Set<string>();
  private highlighter: Highlighter | null = null;

  constructor(highlighter?: Highlighter) {
    if (highlighter) this.highlighter = highlighter;
  }

  /**
   * Reset the internal state (IDs) for a new file.
   */
  public reset() {
    this.seenIds.clear();
  }

  public getRenderer(): any {
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

      // 1. Mermaid/Technical diagrams - keep raw, let browser handle it
      const mermaidTypes = [
        "mermaid", "graph", "flowchart", "sequenceDiagram", "classDiagram", "stateDiagram", 
        "erDiagram", "gantt", "pie", "quadrantChart", "xyChart", "mindmap", 
        "timeline", "journey", "requirementDiagram", "gitGraph", "sankey", "block", "packet"
      ];
      
      const lowerLang = (meta.lang || "").toLowerCase();
      if (mermaidTypes.includes(lowerLang)) {
        const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return codeBlockWrapper(
          `<pre><code class="language-${meta.lang || ""}">${escaped}</code></pre>`,
          meta
        );
      }

      // 2. Standard code blocks - use build-time Shiki highlighting
      if (this.highlighter && meta.lang) {
        const loadedLangs = this.highlighter.getLoadedLanguages();
        if (loadedLangs.includes(meta.lang as any)) {
          try {
            const highlighted = this.highlighter.codeToHtml(text, { 
              lang: meta.lang, 
              theme: "github-dark" 
            });
            return codeBlockWrapper(highlighted, meta);
          } catch (e) {
            console.warn(`Shiki failed to highlight ${meta.lang}`, e);
          }
        }
      }

      // 3. Fallback/Plaintext
      const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return codeBlockWrapper(
        `<pre><code class="language-${meta.lang || ""}">${escaped}</code></pre>`,
        meta
      );
    };

    return renderer;
  }
}
