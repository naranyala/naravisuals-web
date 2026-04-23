/**
 * Stateful Markdown Renderer
 */

import { marked } from "marked";
import type { Highlighter } from "shiki";
import { match, P } from "ts-pattern";
import { codeBlockWrapper, parseCodeInfo } from "../pipeline/renderer.ts";
import { slugifyHeading } from "../pipeline/utils.ts";

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

    const defaultTable = renderer.table.bind(renderer);
    renderer.table = (args: any) => {
      const html = defaultTable(args);
      return `<div class="table-container">${html}</div>`;
    };

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
      const lowerLang = (meta.lang || "").toLowerCase();

      // Dispatch rendering logic using ts-pattern
      return (
        match(lowerLang)
          // 1. Technical diagrams (Mermaid, etc)
          .with(
            P.union(
              "mermaid",
              "graph",
              "flowchart",
              "sequenceDiagram",
              "classDiagram",
              "stateDiagram",
              "erDiagram",
              "gantt",
              "pie",
              "quadrantChart",
              "xyChart",
              "mindmap",
              "timeline",
              "journey",
              "requirementDiagram",
              "gitGraph",
              "sankey",
              "block",
              "packet"
            ),
            () => {
              const escaped = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
              return codeBlockWrapper(
                `<pre><code class="language-${meta.lang || ""}">${escaped}</code></pre>`,
                meta
              );
            }
          )
          // 2. Standard code blocks with Shiki
          .when(
            (lang) =>
              !!(
                this.highlighter &&
                lang &&
                this.highlighter.getLoadedLanguages().includes(lang as any)
              ),
            () => {
              try {
                const highlighted = this.highlighter?.codeToHtml(text, {
                  lang: meta.lang,
                  theme: "github-dark",
                });
                return codeBlockWrapper(highlighted || "", meta);
              } catch (e) {
                console.warn(`Shiki failed to highlight ${meta.lang}`, e);
                return this.fallbackRenderer(text, meta);
              }
            }
          )
          // 3. Fallback for everything else
          .otherwise(() => this.fallbackRenderer(text, meta))
      );
    };

    return renderer;
  }

  private fallbackRenderer(text: string, meta: any) {
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return codeBlockWrapper(
      `<pre><code class="language-${meta.lang || ""}">${escaped}</code></pre>`,
      meta
    );
  }
}
