/**
 * Math Plugin (Build-Time Processing)
 *
 * Protects LaTeX math notation ($...$ and $$...$$) from being
 * processed by the markdown parser, then restores them as
 * MathJax-compatible delimiters in postProcess.
 *
 * Input:  $E = mc^2$
 * Output: <span class="math-inline">\(E = mc^2\)</span>
 *
 * Input:  $$\int_0^\infty e^{-x} dx = 1$$
 * Output: <div class="math-display">\[\int_0^\infty e^{-x} dx = 1\]</div>
 */

import type { MarkdownPlugin } from "./types.ts";

interface MathBlock {
  id: string;
  tex: string;
  display: boolean;
}

const blocks: MathBlock[] = [];

export const mathPlugin: MarkdownPlugin = {
  name: "math",

  preProcess(md: string): string {
    blocks.length = 0;
    let index = 0;

    // Walk line-by-line, tracking fenced code block state.
    // Only process math outside code blocks.
    const lines = md.split("\n");
    let inCodeBlock = false;
    const resultLines: string[] = [];
    let inDisplayMath = false;
    let displayMathLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;

      // Toggle code block state on triple-backtick lines
      if (line.trimStart().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        resultLines.push(line);
        continue;
      }

      if (inCodeBlock) {
        resultLines.push(line);
        continue;
      }

      // Track multi-line display math: $$ on its own line
      if (line.trim() === "$$" && !inDisplayMath) {
        // Opening $$
        inDisplayMath = true;
        displayMathLines = [];
        continue;
      }

      if (inDisplayMath) {
        if (line.trim() === "$$") {
          // Closing $$
          inDisplayMath = false;
          const id = `MATHDISPLAY${index++}END`;
          const tex = displayMathLines.join("\n").trim();
          blocks.push({ id, tex, display: true });
          resultLines.push(id);
          continue;
        }
        displayMathLines.push(line);
        continue;
      }

      // Outside code blocks and display math: process math
      let processed = line;

      // Display math: $$...$$ on a single line
      processed = processed.replace(/\$\$([^$]+)\$\$/g, (_match, tex: string) => {
        const id = `MATHDISPLAY${index++}END`;
        blocks.push({ id, tex: tex.trim(), display: true });
        return id;
      });

      // Inline math: $...$ (where ... doesn't contain $)
      processed = processed.replace(/\$([^$\n]+)\$/g, (_match, tex: string) => {
        // Skip if it looks like it was escaped
        if (tex.includes("\\")) return _match;
        const id = `MATHINLINE${index++}END`;
        blocks.push({ id, tex: tex.trim(), display: false });
        return id;
      });

      resultLines.push(processed);
    }

    return resultLines.join("\n");
  },

  postProcess(html: string): string {
    if (blocks.length === 0) return html;

    let result = html;

    for (const block of blocks) {
      // Keep raw TeX as-is (MathJax will render it client-side)
      const rawTex = block.tex;

      if (block.display) {
        result = result.split(block.id).join(`<div class="math-display">\\[${rawTex}\\]</div>`);
      } else {
        result = result.split(block.id).join(`<span class="math-inline">\\(${rawTex}\\)</span>`);
      }
    }
    return result;
  },
};
