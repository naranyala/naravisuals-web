/**
 * Mermaid Plugin
 *
 * Strategy: Process mermaid code blocks in postProcess (after marked converts
 * markdown to HTML). This way we can find the HTML output of ```mermaid blocks
 * and replace them with proper mermaid containers.
 */

import type { MarkdownPlugin } from "./types.ts";
import { validateMermaidContent } from "./validators/mermaid-content.ts";

interface MermaidBlock {
  id: string;
  diagram: string;
  desc?: string;
  zoom: boolean;
}

const blocks: MermaidBlock[] = [];

export const mermaidPlugin: MarkdownPlugin = {
  name: "mermaid",

  preProcess(md: string): string {
    // Don't process in preProcess - let marked handle the markdown normally
    return md;
  },

  async postProcess(html: string): Promise<string> {
    blocks.length = 0;
    let index = 0;

    // Match mermaid code blocks by finding the "Mermaid" label in the header.
    const mermaidRegex =
      /<div class="code-block"[^>]*>([\s\S]*?)<div class="code-header">([\s\S]*?)<span class="code-lang">Mermaid<\/span>([\s\S]*?)<\/div>([\s\S]*?)<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>([\s\S]*?)(?:<div class="code-desc">([\s\S]*?)<\/div>)?([\s\S]*?)<\/div>/gi;

    let result = html;
    const matches = Array.from(html.matchAll(mermaidRegex));

    for (const match of matches) {
      const [fullMatch, _pre, _hdrPre, _hdrPost, _prePre, diagram, _postPre, desc, _postPost] =
        match;
      const id = `MERMAIDBLOCK${index++}END`;

      // Extract data-zoom if present on the outer div
      const zoomMatch = fullMatch.match(/data-zoom="([^"]*)"/i);
      const zoomEnabled = zoomMatch ? zoomMatch[1] === "true" : true;

      // Decode HTML entities back to original diagram text
      let decoded = diagram
        .replace(/&amp;/g, "&")
        .replace(/&#x26;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&#x3c;/gi, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#x3e;/gi, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;#39;/g, "'")
        .replace(/<\/?span[^>]*>/g, "")
        .trim();

      // Replace newlines inside labels
      decoded = decoded.replace(/([[({])([\s\S]*?)([\])}])/g, (_match, open, content, close) => {
        return `${open}${content.replace(/\n/g, "<br/>")}${close}`;
      });

      // Validate diagram content (STRICT validation using real Mermaid parser)
      const validationErrors = await validateMermaidContent(decoded);
      if (validationErrors.length > 0) {
        const errorDetails = validationErrors
          .map((err) => `  - ${err.message}: ${err.detail}`)
          .join("\n");

        // Render the diagram anyway, but keep the error details available in the UI
        const errorContainer = [
          `<div class="mermaid-diagram" data-processed="false" data-zoom="${zoomEnabled}" data-validation-error="true">`,
          `  <div class="mermaid-diagram-header">`,
          `    <span class="mermaid-diagram-label">Diagram</span>`,
          `    <div class="mermaid-diagram-actions">`,
          `      <span class="mermaid-loading"><span class="mermaid-spinner"></span></span>`,
          `    </div>`,
          `  </div>`,
          `  <div class="mermaid">${escapeHtml(decoded)}</div>`,
          `  <div class="mermaid-error" style="display:block;">`,
          `    <div class="mermaid-error-title">⚠ Validation Warning</div>`,
          `    <details>`,
          `      <summary>${validationErrors[0].message}</summary>`,
          `      <pre>${escapeHtml(errorDetails)}</pre>`,
          `    </details>`,
          `  </div>`,
          `</div>`,
        ].join("\n");
        result = result.replace(fullMatch, errorContainer);
        continue;
      }

      // Decode description HTML entities
      const decodedDesc = desc
        ? desc
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim()
        : undefined;

      blocks.push({ id, diagram: decoded, desc: decodedDesc, zoom: zoomEnabled });
      result = result.replace(fullMatch, id);
    }

    // Replace sentinels with mermaid containers
    for (const block of blocks) {
      const descHtml = block.desc
        ? `\n  <div class="mermaid-diagram-desc">${block.desc}</div>`
        : "";
      const zoomBtnHtml = block.zoom
        ? `      <button class="mermaid-zoom-btn" title="Zoom" aria-label="Zoom diagram">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
          <path d="M11 8v6"/>
          <path d="M8 11h6"/>
        </svg>
      </button>
`
        : "";
      const downloadBtnHtml = `      <button class="mermaid-download-btn" title="Download SVG" aria-label="Download diagram SVG">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>
`;
      const container = [
        `<div class="mermaid-diagram" data-processed="false" data-zoom="${block.zoom}">`,
        `  <div class="mermaid-diagram-header">`,
        `    <span class="mermaid-diagram-label">Diagram</span>`,
        `    <div class="mermaid-diagram-actions">`,
        zoomBtnHtml,
        downloadBtnHtml,
        `      <span class="mermaid-loading"><span class="mermaid-spinner"></span></span>`,
        `    </div>`,
        `  </div>`,
        `  <div class="mermaid" style="display:none;">${escapeHtml(block.diagram)}</div>`,
        descHtml,
        `  <div class="mermaid-error" style="display:none;"></div>`,
        `</div>`,
      ].join("\n");
      result = result.split(block.id).join(container);
    }

    return result;
  },
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
