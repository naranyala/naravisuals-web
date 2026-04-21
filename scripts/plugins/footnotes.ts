import { marked } from "marked";
import type { MarkdownPlugin } from "./types.ts";

/**
 * Custom Footnotes Plugin
 *
 * Supports Wikipedia-style footnotes: [^1] and [^1]: content.
 * Avoids issues with broken external plugins.
 */
export const footnotesPlugin: MarkdownPlugin = {
  name: "footnotes",

  preProcess(content: string) {
    const footnotes = new Map<string, string>();

    // 1. Extract footnote definitions: [^1]: Content
    // We match lines starting with [^ID]:
    const definitionRegex = /^\[\^([^\]]+)\]:\s*(.*)$/gm;
    let processed = content.replace(definitionRegex, (_, id, text) => {
      footnotes.set(id, text.trim());
      return ""; // Remove definition from main content
    });

    // If no footnotes found, just return content
    if (footnotes.size === 0) return content;

    // 2. Replace footnote references: [^1]
    // We avoid matching the definition syntax by ensuring it's not followed by a colon
    const refRegex = /\[\^([^\]]+)\](?!:)/g;
    processed = processed.replace(refRegex, (_, id) => {
      if (footnotes.has(id)) {
        return `<sup id="fnref:${id}" class="footnote-ref"><a href="#fn:${id}">${id}</a></sup>`;
      }
      return `[^${id}]`; // Keep as is if no definition found
    });

    // Store footnotes for postProcess
    // We use a global-ish state or attach it to the content if possible.
    // Since MarkdownPlugin is stateless across files in the current architecture,
    // we can use a trick: append a hidden JSON or just use a WeakMap if we had the unit object.
    // But here we only have the string.

    // Alternative: append the footnotes HTML directly in preProcess but marked might mangle it?
    // Actually, marked will leave HTML alone.
    // But we want it at the VERY end, and marked might add closing tags after it.

    // Let's use a delimiter and handle it in postProcess.
    const footnotesData = JSON.stringify(Array.from(footnotes.entries()));
    return `${processed}\n\n<!-- FOOTNOTES_DATA:${footnotesData} -->`;
  },

  postProcess(html: string) {
    const match = html.match(/<!-- FOOTNOTES_DATA:(.*) -->/);
    if (!match) return html;

    const footnotes = JSON.parse(match[1] || "[]") as [string, string][];
    let content = html.replace(/<p><!-- FOOTNOTES_DATA:.* --><\/p>/, ""); // Remove the placeholder
    content = content.replace(/<!-- FOOTNOTES_DATA:.* -->/, ""); // In case it's not in a <p>

    if (footnotes.length === 0) return content;

    let footnotesHtml = `<section class="footnotes">\n<ol>\n`;
    for (const [id, text] of footnotes) {
      // Parse the footnote text as markdown (inline usually sufficient)
      const parsedText = marked.parseInline(text);

      // Wikipedia style: backlink is usually at the end of the note or an arrow
      footnotesHtml += `  <li id="fn:${id}">\n`;
      footnotesHtml += `    ${parsedText}\n`;
      footnotesHtml += `    <a href="#fnref:${id}" class="footnote-backref" aria-label="Back to content">↩</a>\n`;
      footnotesHtml += `  </li>\n`;
    }
    footnotesHtml += `</ol>\n</section>`;

    return `${content.trim()}\n${footnotesHtml}`;
  },
};
