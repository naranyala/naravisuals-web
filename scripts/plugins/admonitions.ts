/**
 * Admonitions Plugin
 *
 * Docusaurus-style callout blocks using :::type syntax.
 *
 * Input:
 *   :::note
 *   This is a note with **markdown** support.
 *
 *   - Even lists
 *   - And more
 *   :::
 *
 * Output:
 *   <div class="admonition admonition-note">
 *     <div class="admonition-heading">
 *       <span class="admonition-icon">ℹ️</span> Note
 *     </div>
 *     <div class="admonition-content">
 *       <p>This is a note with <strong>markdown</strong> support.</p>
 *       <ul><li>Even lists</li><li>And more</li></ul>
 *     </div>
 *   </div>
 *
 * Supported types: note, tip, info, warning, danger, caution
 *
 * Strategy:
 *   preProcess — extract ::: blocks, replace with sentinel, store parsed data
 *   postProcess — render sentinels as styled admonition HTML
 *
 * Note: postProcess runs in REVERSE plugin order, so math runs after
 * admonitions and resolves $...$ sentinels inside admonition content.
 */

import { marked } from "marked";
import type { MarkdownPlugin } from "./types.ts";

interface AdmonitionBlock {
  id: string;
  type: string;
  content: string;
  customTitle?: string;
}

const blocks: AdmonitionBlock[] = [];

const ADMONITION_META: Record<string, { label: string; icon: string }> = {
  note: { label: "Note", icon: "ℹ️" },
  tip: { label: "Tip", icon: "💡" },
  info: { label: "Info", icon: "ℹ️" },
  warning: { label: "Warning", icon: "⚠️" },
  danger: { label: "Danger", icon: "🚫" },
  caution: { label: "Caution", icon: "⚠️" },
};

export const admonitionsPlugin: MarkdownPlugin = {
  name: "admonitions",

  preProcess(md: string): string {
    blocks.length = 0;
    let index = 0;

    // Walk line-by-line, tracking fenced code block state.
    // Only process admonitions outside code blocks.
    const lines = md.split("\n");
    let inCodeBlock = false;
    const resultLines: string[] = [];
    let currentAdmonition: { startLine: number; type: string; title: string } | null = null;
    let admonitionContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;

      // Toggle code block state on triple-backtick lines
      if (line.trimStart().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        // If we were inside an admonition, close it
        if (currentAdmonition && !inCodeBlock) {
          const id = `ADMONITION${index++}END`;
          const normalizedType = currentAdmonition.type.toLowerCase();
          const customTitle = currentAdmonition.title.trim() || undefined;
          blocks.push({
            id,
            type: normalizedType,
            content: admonitionContent.join("\n").trimEnd(),
            customTitle: customTitle ? customTitle.replace(/^=\s*/, "") : undefined,
          });
          resultLines.push(`\n${id}\n`);
          currentAdmonition = null;
          admonitionContent = [];
        }
        resultLines.push(line);
        continue;
      }

      if (inCodeBlock) {
        resultLines.push(line);
        continue;
      }

      // Check for admonition start
      const admonitionMatch = line.match(/^(:::|!!!)\s*(\w+)([^\n]*)$/);
      if (admonitionMatch && admonitionMatch[2] !== undefined && admonitionMatch[3] !== undefined) {
        // If we're already in an admonition, this might be a nested one or content
        // For simplicity, treat it as content
        if (currentAdmonition) {
          admonitionContent.push(line);
        } else {
          currentAdmonition = {
            startLine: i,
            type: admonitionMatch[2],
            title: admonitionMatch[3],
          };
          admonitionContent = [];
        }
        continue;
      }

      // Check for admonition end
      if ((line.trim() === ":::" || line.trim() === "!!!") && currentAdmonition) {
        const id = `ADMONITION${index++}END`;
        const normalizedType = currentAdmonition.type.toLowerCase();
        const customTitle = currentAdmonition.title.trim() || undefined;
        blocks.push({
          id,
          type: normalizedType,
          content: admonitionContent.join("\n").trimEnd(),
          customTitle: customTitle ? customTitle.replace(/^=\s*/, "") : undefined,
        });
        resultLines.push(`\n${id}\n`);
        currentAdmonition = null;
        admonitionContent = [];
        continue;
      }

      // If we're inside an admonition, collect content
      if (currentAdmonition) {
        admonitionContent.push(line);
      } else {
        resultLines.push(line);
      }
    }

    // Handle unclosed admonition
    if (currentAdmonition) {
      const id = `ADMONITION${index++}END`;
      blocks.push({
        id,
        type: currentAdmonition.type.toLowerCase(),
        content: admonitionContent.join("\n").trimEnd(),
      });
      resultLines.push(`\n${id}\n`);
    }

    return resultLines.join("\n");
  },

  async postProcess(html: string): Promise<string> {
    if (blocks.length === 0) return html;

    let result = html;

    for (const block of blocks) {
      const meta = ADMONITION_META[block.type] || {
        label: block.type.charAt(0).toUpperCase() + block.type.slice(1),
        icon: "📝",
      };

      const label = block.customTitle || meta.label;

      // Process the inner content through marked to get HTML
      const innerHtml = (await marked.parse(block.content)) as string;

      const admonitionHtml = [
        `<div class="admonition admonition-${block.type}">`,
        `<div class="admonition-heading">`,
        `<span class="admonition-icon">${meta.icon}</span> ${label}`,
        `</div>`,
        `<div class="admonition-content">`,
        innerHtml,
        `</div>`,
        `</div>`,
      ].join("\n");

      // marked wraps block-level replacements in <p> tags.
      // Replace <p>SENTINEL</p> or just SENTINEL to avoid invalid <p><div> nesting.
      const wrappedRegex = new RegExp(`<p>\\s*${block.id}\\s*<\\/p>`, "g");
      if (wrappedRegex.test(result)) {
        result = result.replace(wrappedRegex, admonitionHtml);
      } else {
        // Try matching with potential whitespace/newlines around the sentinel
        const looseRegex = new RegExp(`\\s*${block.id}\\s*`, "g");
        result = result.replace(looseRegex, admonitionHtml);
      }
    }

    return result;
  },
};
