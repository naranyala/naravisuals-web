import { JSDOM } from "jsdom";
import type { MarkdownPlugin } from "./types.ts";
import { validateMermaidContent } from "./validators/mermaid-content.ts";

export const mermaidPlugin: MarkdownPlugin = {
  name: "mermaid",

  preProcess(md: string): string {
    return md;
  },

  async postProcess(html: string): Promise<string> {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const codeBlocks = Array.from(document.querySelectorAll(".code-block"));

    const mermaidTypes = [
      "mermaid", "graph", "flowchart", "sequenceDiagram", "classDiagram", "stateDiagram", 
      "erDiagram", "gantt", "pie", "quadrantChart", "xyChart", "mindmap", 
      "timeline", "journey", "requirementDiagram", "gitGraph", "sankey"
    ];

    for (const block of codeBlocks) {
      const lang = block.getAttribute("data-lang")?.toLowerCase() || "";
      
      if (!mermaidTypes.includes(lang)) continue;

      const codeElement = block.querySelector("pre code");
      if (!codeElement) continue;

      let diagram = codeElement.textContent || "";
      const trimmedDiagram = diagram.trim();
      const firstLine = trimmedDiagram.split("\n")[0].trim().toLowerCase();

      // Determine the target diagram type
      let targetType = lang;
      if (lang === "mermaid") {
        // Auto-detect from content if lang is just "mermaid"
        const firstWord = trimmedDiagram.split(/\s+/)[0].toLowerCase();
        if (mermaidTypes.includes(firstWord) && firstWord !== "mermaid") {
          targetType = firstWord;
        } else if (firstWord === "graph") {
          targetType = "flowchart"; // Normalize graph to flowchart
        }
      }

      // Ensure diagram has the correct prefix and direction
      if (targetType !== "mermaid") {
        const isPrefixed = firstLine.startsWith(targetType.toLowerCase()) || 
                          (targetType === "graph" && firstLine.startsWith("flowchart")) ||
                          (targetType === "flowchart" && firstLine.startsWith("graph"));
        
        if (!isPrefixed) {
          const directions = ["LR", "RL", "TD", "TB", "BT"];
          const firstWord = firstLine.split(/\s+/)[0].toUpperCase();
          
          if (directions.includes(firstWord)) {
            // Already has a direction, just prefix with type
            const restOfDiagram = trimmedDiagram.split("\n").slice(1).join("\n");
            diagram = `${targetType} ${firstWord}\n${restOfDiagram}`;
          } else if (targetType === "flowchart" || targetType === "graph") {
            // Flowcharts need a direction
            diagram = `${targetType} TD\n${trimmedDiagram}`;
          } else {
            // Others just need the type prefix
            diagram = `${targetType}\n${trimmedDiagram}`;
          }
        }
      }
      const descElement = block.querySelector(".code-desc");
      const desc = descElement?.textContent || undefined;
      const zoomEnabled = block.getAttribute("data-zoom") === "true";

      // Validate diagram content
      const validationErrors = await validateMermaidContent(diagram);

      const mermaidContainer = document.createElement("div");
      mermaidContainer.className = "mermaid-diagram";
      mermaidContainer.setAttribute("data-processed", "false");
      mermaidContainer.setAttribute("data-zoom", zoomEnabled.toString());

      const zoomBtnHtml = zoomEnabled
        ? `      <button class="mermaid-zoom-btn" title="Zoom" aria-label="Zoom diagram">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
            <path d="M11 8v6"/>
            <path d="M8 11h6"/>
          </svg>
        </button>`
        : "";

      const downloadBtnHtml = `      <button class="mermaid-download-btn" title="Download SVG" aria-label="Download diagram SVG">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>`;

      const codeBtnHtml = `      <button class="mermaid-code-btn" title="Show/Hide Mermaid Source" aria-label="Toggle diagram source code">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      </button>`;

      // Generate validation error HTML if any issues were found at build time
      let validationErrorHtml = "";
      if (validationErrors.length > 0) {
        const errorDetails = validationErrors
          .map((err) => `  - [${err.severity || "error"}] ${err.message}: ${err.detail}`)
          .join("\n");
        
        validationErrorHtml = `
          <div class="mermaid-error-title">⚠ Build-Time Validation Warning</div>
          <p style="font-size: 0.85em; margin: 0.5rem 0; opacity: 0.8;">
            The following issues were detected during the documentation build:
          </p>
          <pre class="mermaid-error-msg">${escapeHtml(errorDetails)}</pre>
        `;
      }

      // Always generate the same structure, let the frontend handle the rendering attempt
      mermaidContainer.innerHTML = `
        <div class="mermaid-diagram-header">
          <span class="mermaid-diagram-label">Diagram</span>
          <div class="mermaid-diagram-actions">
            ${zoomBtnHtml}
            ${downloadBtnHtml}
            ${codeBtnHtml}
            <span class="mermaid-loading"><span class="mermaid-spinner"></span></span>
          </div>
        </div>
        <div class="mermaid" style="display:none;" data-source="${escapeHtml(diagram)}">${escapeHtml(diagram)}</div>
        ${desc ? `<div class="mermaid-diagram-desc">${escapeHtml(desc)}</div>` : ""}
        <div class="mermaid-source-container" style="display:none;">
          <div class="mermaid-source-header">
            <span>Mermaid Notation</span>
            <button class="mermaid-source-copy-btn">Copy</button>
          </div>
          <pre class="mermaid-source-code"><code>${escapeHtml(diagram)}</code></pre>
        </div>
        <div class="mermaid-error" style="${validationErrorHtml ? "display:block;" : "display:none;"}">${validationErrorHtml}</div>
      `;

      block.replaceWith(mermaidContainer);
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
