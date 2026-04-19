import type { DocEntry } from "../../generated";
import type { IAppConfig, IDomService } from "../../services/container";

export async function printAllDocs(allDocs: DocEntry[], config: IAppConfig, _dom: IDomService) {
  // First, render all mermaid diagrams in the current view
  const mermaidDiagrams = document.querySelectorAll(".mermaid-diagram[data-processed='false']");
  if (mermaidDiagrams.length > 0) {
    mermaidDiagrams.forEach((d) => {
      (d as HTMLElement).dataset.processed = "false";
    });
  }

  // Import and render mermaid
  try {
    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: {
        primaryColor: "#e8f5e9",
        primaryTextColor: "#1a1a2e",
        primaryBorderColor: "#2e7d32",
        lineColor: "#374151",
        secondaryColor: "#e3f2fd",
        tertiaryColor: "#fff3e0",
        background: "#ffffff",
        mainBkg: "#ffffff",
        nodeBorder: "#6b7280",
        clusterBkg: "#f3f4f6",
        clusterBorder: "#d1d5db",
        titleColor: "#1a1a2e",
        edgeLabelBackground: "#ffffff",
      },
      securityLevel: "loose",
      fontFamily: "system-ui, -apple-system, sans-serif",
    });

    const allMermaidBlocks = document.querySelectorAll(".mermaid-diagram");
    for (const wrapper of Array.from(allMermaidBlocks) as HTMLElement[]) {
      const mermaidEl = wrapper.querySelector<HTMLElement>(".mermaid");
      if (!mermaidEl || wrapper.dataset.processed === "true") continue;

      const diagramSource = mermaidEl.getAttribute("data-source") || mermaidEl.textContent?.trim();
      if (!diagramSource) continue;

      try {
        await mermaid.parse(diagramSource);
        const uniqueId = `mermaid-print-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, diagramSource);
        wrapper.dataset.processed = "true";
        mermaidEl.innerHTML = svg;
        mermaidEl.style.display = "block";
        mermaidEl.style.opacity = "1";

        const svgEl = mermaidEl.querySelector("svg");
        if (svgEl) {
          svgEl.style.maxWidth = "100%";
          svgEl.style.height = "auto";
          svgEl.style.display = "block";
          svgEl.style.margin = "0 auto";

          svgEl.querySelectorAll("text").forEach((textEl) => {
            textEl.style.fill = "#1a1a1a";
            textEl.style.color = "#1a1a1a";
          });
          svgEl.querySelectorAll("path, line").forEach((shapeEl) => {
            const stroke = shapeEl.getAttribute("stroke");
            if (!stroke || stroke === "none" || stroke === "transparent") {
              (shapeEl as HTMLElement).style.stroke = "#374151";
            }
          });
          svgEl.querySelectorAll("rect, circle, ellipse, polygon").forEach((shapeEl) => {
            const fill = shapeEl.getAttribute("fill");
            if (
              fill &&
              fill !== "#fff" &&
              fill !== "#ffffff" &&
              fill !== "white" &&
              fill !== "none"
            ) {
              (shapeEl as HTMLElement).style.fill = "#ffffff";
            }
            (shapeEl as HTMLElement).style.stroke = "#6b7280";
          });
        }
      } catch (err) {
        console.warn("Failed to render mermaid diagram for print:", err);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  } catch (err) {
    console.warn("Failed to load mermaid for print:", err);
  }

  const docContentEl = document.querySelector(".doc-content");
  let renderedContent = "";

  if (docContentEl) {
    const clone = docContentEl.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll(".code-copy-btn, .mermaid-zoom-btn, .mermaid-download-btn")
      .forEach((el) => {
        el.remove();
      });
    clone.querySelectorAll(".code-header").forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });

    renderedContent = `
      <article class="doc-section">
        <div class="doc-content">${clone.innerHTML}</div>
      </article>
    `;
  } else {
    renderedContent = allDocs
      .sort((a, b) => a.sidebar_position - b.sidebar_position)
      .map(
        (doc) =>
          `<article class="doc-section"><div class="doc-content">${doc.content}</div></article>`
      )
      .join("");
  }

  const siteTitle = config.siteTitle;
  const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${siteTitle}</title>
  <style>
    @page { margin: 2cm 1.8cm; size: A4; }
    @media print {
      .print-header { display: none !important; }
      .doc-section { page-break-after: always; }
      .doc-section:last-child { page-break-after: avoid; }
      .code-block, .admonition, .mermaid-diagram, table, img { page-break-inside: avoid; }
      h1, h2, h3 { page-break-after: avoid; }
    }
    body { font-family: serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; background: white; }
    .print-header { position: sticky; top: 0; background: white; padding: 0.8rem 1.5rem; border-bottom: 2px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .doc-section { padding: 1.5rem 0; max-width: 100%; margin: 0 auto; }
    .doc-content code { background: #f8f9fa; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; color: #d63384; border: 1px solid #e9ecef; }
    .doc-content pre { background: #fafafa; border: 1px solid #e5e7eb; border-left: 3px solid #3b82f6; border-radius: 6px; padding: 1rem 1.25rem; margin: 1.25rem 0; overflow-x: auto; font-size: 9.5pt; }
    .doc-content table { border-collapse: collapse; width: 100%; margin: 1.25rem 0; font-size: 10pt; border-top: 2px solid #374151; border-bottom: 2px solid #374151; }
    .doc-content th { background: #f3f4f6; padding: 0.6rem 0.75rem; text-align: left; }
    .doc-content td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb; }
    .doc-content .admonition { margin: 1.25rem 0; padding: 0.875rem 1rem; border-left: 4px solid; background: #fafafa; }
    .doc-content .mermaid-diagram { margin: 1.5rem 0; padding: 1rem; border: 1px solid #e5e7eb; text-align: center; }
  </style>
</head>
<body>
  <div class="print-header">
    <div class="print-header-title">${siteTitle}</div>
    <button onclick="window.print()">🖨️ Print This Document</button>
  </div>
  ${renderedContent}
</body>
</html>`;

  const blob = new Blob([printHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) alert("Please allow popups to print");
}
