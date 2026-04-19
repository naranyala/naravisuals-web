/**
 * Stateful Markdown Renderer
 */

import { marked } from "marked";
import { slugifyHeading } from "../pipeline/utils.ts";
import { parseCodeInfo, codeBlockWrapper } from "../pipeline/renderer.ts";

export class MarkdownRenderer {
  private seenIds = new Set<string>();

  constructor() {}

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
      const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      
      return codeBlockWrapper(
        `<pre><code class="language-${meta.lang || ""}">${escaped}</code></pre>`,
        meta
      );
    };

    return renderer;
  }
}
