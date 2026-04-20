import type { DocEntry } from "../../generated";
import type { IAppConfig, IDomService } from "../../services/container";

export async function printAllDocs(allDocs: DocEntry[], config: IAppConfig, _dom: IDomService) {
  // 1. Sort all docs by their sidebar position for a logical book order
  const sortedDocs = [...allDocs].sort((a, b) => a.sidebar_position - b.sidebar_position);
  
  // 2. Create a temporary off-screen container to render EVERYTHING
  const printContainer = document.createElement("div");
  printContainer.style.position = "fixed";
  printContainer.style.left = "-9999px";
  printContainer.style.top = "-9999px";
  printContainer.style.width = "800px"; // Fixed width for consistent layout
  document.body.appendChild(printContainer);

  // 3. Render all docs into the container
  for (const doc of sortedDocs) {
    const article = document.createElement("article");
    article.className = "doc-section";
    article.id = `section-${doc.slug.replace(/\//g, "-")}`;
    article.innerHTML = `<div class="doc-content">${doc.content}</div>`;
    
    // Clean up UI elements that shouldn't be in print
    article.querySelectorAll(".code-copy-btn, .mermaid-zoom-btn, .mermaid-download-btn, .mermaid-code-btn, .code-header").forEach(el => el.remove());
    
    printContainer.appendChild(article);
  }

  // 4. Initialize Mermaid for high-end print rendering
  try {
    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({
      startOnLoad: false,
      theme: "default", // Changed from neutral to default
      themeVariables: {
        primaryColor: "#ffffff",
        primaryTextColor: "#000000",
        primaryBorderColor: "#333333",
        lineColor: "#666666",
        secondaryColor: "#ffffff",
        tertiaryColor: "#ffffff",
        background: "#ffffff",
        mainBkg: "#ffffff",
        nodeBorder: "#333333",
        clusterBkg: "#ffffff",
        clusterBorder: "#666666",
        titleColor: "#000000",
        edgeLabelBackground: "#ffffff",
      },
      securityLevel: "loose",
      fontFamily: '"Source Serif 4", serif',
      flowchart: { htmlLabels: true, useMaxWidth: true },
      sequence: { useMaxWidth: true, showSequenceNumbers: true },
    });

    // 5. Process all Mermaid diagrams in the print container
    const allMermaidBlocks = printContainer.querySelectorAll(".mermaid-diagram");
    for (const wrapper of Array.from(allMermaidBlocks) as HTMLElement[]) {
      const mermaidEl = wrapper.querySelector<HTMLElement>(".mermaid");
      if (!mermaidEl) continue;

      const diagramSource = mermaidEl.getAttribute("data-source") || mermaidEl.textContent?.trim();
      if (!diagramSource) continue;

      let currentId = "unknown";
      try {
        // Ensure element is briefly visible for measurement
        mermaidEl.style.display = "block";
        mermaidEl.style.opacity = "0";
        mermaidEl.style.minHeight = "100px";

        const uniqueId = `mermaid-print-${Math.random().toString(36).slice(2, 11)}`;
        currentId = uniqueId;
        const result = await mermaid.render(uniqueId, diagramSource, mermaidEl);
        const svgContent = typeof result === "string" ? result : result?.svg;
        
        mermaidEl.innerHTML = svgContent || "";
        mermaidEl.style.opacity = "1";
        mermaidEl.style.minHeight = "";
        
        const svgEl = mermaidEl.querySelector("svg");
        if (svgEl) {
          svgEl.style.maxWidth = "100%";
          svgEl.style.height = "auto";
          svgEl.style.display = "block";
          svgEl.style.margin = "0 auto";
          
          // Force black text for print
          svgEl.querySelectorAll("text").forEach(t => { t.style.fill = "#000"; t.style.color = "#000"; });
        }
      } catch (err) {
        console.warn(`Failed to render diagram for ${currentId}:`, err);
      }
    }
  } catch (err) {
    console.error("Failed to load Mermaid for print:", err);
  }

  // 6. Generate a Table of Contents for the book
  const tocHtml = sortedDocs
    .map(doc => `<li><a href="#section-${doc.slug.replace(/\//g, "-")}">${doc.sidebar_label || doc.title}</a></li>`)
    .join("");

  const siteTitle = config.siteTitle;
  const renderedContent = printContainer.innerHTML;
  
  // Clean up
  document.body.removeChild(printContainer);

  const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${siteTitle} - Complete Guide</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page { 
      margin: 2.5cm 2cm; 
      size: A4;
    }
    
    * { box-sizing: border-box; }
    
    body { 
      font-family: "Source Serif 4", serif; 
      font-size: 11.5pt; 
      line-height: 1.6; 
      color: #1a1a1a; 
      background: white;
      margin: 0;
      padding: 0;
    }

    .print-ui {
      position: fixed;
      top: 0; left: 0; right: 0;
      background: #f8f9fa;
      padding: 1rem 2rem;
      border-bottom: 1px solid #dee2e6;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    @media print {
      .print-ui { display: none !important; }
      .doc-section { page-break-after: always; break-after: page; }
      .title-page { page-break-after: always; break-after: page; height: 90vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
      .print-toc-page { page-break-after: always; break-after: page; }
      
      .code-block, .admonition, .mermaid-diagram, table, img { 
        page-break-inside: avoid; 
        break-inside: avoid; 
      }
      h1, h2, h3 { 
        page-break-after: avoid; 
        break-after: avoid; 
      }
    }

    .container {
      max-width: 100%;
      margin: 0 auto;
      padding: 4rem 2cm;
    }
    
    @media print {
      .container { padding-top: 0; }
    }

    .title-page {
      padding: 4rem 0;
      margin-bottom: 4rem;
      text-align: center;
      border-bottom: 2pt solid #000;
    }

    .title-page h1 { font-size: 48pt; margin: 0; font-weight: 700; }
    .title-page p { font-size: 16pt; color: #666; margin-top: 1rem; }

    .print-toc-page {
      padding: 2rem 0;
      margin-bottom: 3rem;
    }

    .print-toc-page h2 { font-size: 24pt; border-bottom: 1pt solid #ccc; padding-bottom: 1rem; }
    .print-toc-page ul { list-style: none; padding: 0; margin-top: 2rem; }
    .print-toc-page li { 
      padding: 0.5rem 0; 
      border-bottom: 1pt dotted #eee; 
    }
    .print-toc-page a { color: #000; text-decoration: none; font-weight: 600; }

    .doc-section { padding: 3rem 0; }

    .doc-content h1 { font-size: 28pt; margin-bottom: 1.5rem; font-weight: 700; color: #000; }
    .doc-content h2 { font-size: 20pt; margin-top: 2.5rem; margin-bottom: 1rem; font-weight: 600; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
    .doc-content h3 { font-size: 15pt; margin-top: 2rem; margin-bottom: 0.75rem; font-weight: 600; }
    
    .doc-content p { margin-bottom: 1rem; }
    
    .doc-content code { 
      font-family: "JetBrains Mono", monospace;
      background: #f1f3f5; padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.9em; color: #c92a2a; 
    }
    
    .doc-content pre { 
      font-family: "JetBrains Mono", monospace;
      background: #f8f9fa; border: 1px solid #e9ecef; border-left: 4px solid #495057; padding: 1.25rem; margin: 1.5rem 0; font-size: 9.5pt;
      white-space: pre-wrap; word-break: break-all;
    }

    .admonition {
      margin: 1.5rem 0; padding: 1.25rem; border: 1px solid #dee2e6; border-left: 5px solid #495057; background: #f8f9fa;
    }

    .mermaid-diagram { 
      margin: 2rem 0; 
      padding: 1.5rem; 
      border: 1px solid #dee2e6; 
      text-align: center; 
      background: white !important;
      page-break-inside: avoid;
    }
    
    .mermaid svg {
      max-width: 100% !important;
      height: auto !important;
      display: block;
      margin: 0 auto;
    }

    /* Force visibility of Mermaid elements in the new window */
    .mermaid { display: block !important; opacity: 1 !important; }
    
    /* Grayscale enforcement for all diagram types */
    .mermaid svg text { fill: #000 !important; color: #000 !important; }
    .mermaid svg rect, .mermaid svg circle, .mermaid svg ellipse, .mermaid svg polygon, .mermaid svg path {
      stroke: #333 !important;
    }
    .mermaid svg .edgePath path { stroke: #333 !important; stroke-width: 1.5px !important; }
    .mermaid svg .node rect, .mermaid svg .node circle, .mermaid svg .node ellipse {
      fill: #fff !important;
    }

    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 10.5pt; }
    th { background: #f1f3f5; font-weight: 600; text-align: left; }
    th, td { padding: 0.75rem; border: 1px solid #dee2e6; }

    .print-footer {
      margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #eee; text-align: center; font-size: 9pt; color: #868e96;
    }
  </style>
</head>
<body>
  <div class="print-ui">
    <div style="font-weight: 600; font-size: 1.1rem;">Full Documentation Export</div>
    <button onclick="window.print()" style="padding: 0.6rem 1.5rem; background: #228be6; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">
      🖨️ Generate Full Book PDF
    </button>
  </div>
  
  <div class="container">
    <div class="title-page">
      <h1>${siteTitle}</h1>
      <p>Complete Documentation & Reference Guide</p>
      <div style="margin-top: 10rem; font-style: italic;">
        Generated on ${new Date().toLocaleDateString()}
      </div>
    </div>

    <div class="print-toc-page">
      <h2>Table of Contents</h2>
      <ul>${tocHtml}</ul>
    </div>

    ${renderedContent}
    
    <div class="print-footer">
      End of Documentation &bull; ${siteTitle} &bull; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([printHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) alert("Please allow popups to print");
}
