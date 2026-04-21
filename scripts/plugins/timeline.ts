import { JSDOM } from "jsdom";
import type { MarkdownPlugin } from "./types.ts";

export const timelinePlugin: MarkdownPlugin = {
  name: "timeline",

  preProcess(md: string): string {
    return md;
  },

  async postProcess(html: string): Promise<string> {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const codeBlocks = Array.from(document.querySelectorAll(".code-block"));

    for (const block of codeBlocks) {
      const lang = block.getAttribute("data-lang")?.toLowerCase() || "";

      // Support both "timeline" and "text (timeline)"
      if (lang !== "timeline" && lang !== "text (timeline)") continue;

      const codeElement = block.querySelector("pre code");
      if (!codeElement) continue;

      const content = codeElement.textContent || "";
      const descElement = block.querySelector(".code-desc");
      const desc = descElement?.textContent || undefined;

      const timelineContainer = document.createElement("div");
      timelineContainer.className = "code-block code-block-timeline";
      timelineContainer.setAttribute("data-lang", lang);
      timelineContainer.setAttribute("data-copy", "true");

      const copyBtnHtml = `<button class="code-copy-btn" aria-label="Copy code" onclick="copyCode(this)">Copy</button>`;

      timelineContainer.innerHTML = `
        <div class="code-header">
          <span class="code-lang">Timeline</span>
          ${copyBtnHtml}
        </div>
        <div class="timeline-content">
          <pre><code>${escapeHtml(content)}</code></pre>
        </div>
        ${desc ? `<div class="code-desc">${escapeHtml(desc)}</div>` : ""}
      `;

      block.replaceWith(timelineContainer);
    }

    return document.body.innerHTML;
  },
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
