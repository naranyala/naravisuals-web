import type { DocEntry, TocItem } from "../../generated";
import type { IAppConfig, IDomService } from "../../services/container";

export async function printAllDocs(allDocs: DocEntry[], config: IAppConfig, _dom: IDomService) {
  // 1. Sort all docs by their sidebar position
  const sortedDocs = [...allDocs].sort((a, b) => a.sidebar_position - b.sidebar_position);

  // 2. Create a temporary off-screen container in CURRENT window to render EVERYTHING
  const printContainer = document.createElement("div");
  printContainer.style.position = "fixed";
  printContainer.style.left = "-9999px";
  printContainer.style.top = "-9999px";
  printContainer.style.width = "1000px";
  document.body.appendChild(printContainer);

  // 3. Render all docs into the container
  for (const doc of sortedDocs) {
    const article = document.createElement("article");
    article.className = "doc-section";
    article.id = `section-${doc.slug.replace(/\//g, "-")}`;
    article.innerHTML = `
      <div class="doc-content">
        ${doc.content}
      </div>
    `;

    article
      .querySelectorAll(
        ".code-copy-btn, .mermaid-zoom-btn, .mermaid-download-btn, .mermaid-code-btn, .mermaid-diagram-header, .mermaid-source-container, .mermaid-loading"
      )
      .forEach((el) => {
        el.remove();
      });

    printContainer.appendChild(article);
  }

  // 4. Initialize/Use Mermaid to render all diagrams in place
  try {
    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: {
        primaryColor: "#ffffff",
        primaryTextColor: "#000000",
        primaryBorderColor: "#000000",
        lineColor: "#000000",
        secondaryColor: "#ffffff",
        tertiaryColor: "#ffffff",
        background: "#ffffff",
        mainBkg: "#ffffff",
        nodeBorder: "#000000",
        clusterBkg: "#ffffff",
        clusterBorder: "#000000",
        titleColor: "#000000",
        edgeLabelBackground: "#ffffff",
        fontFamily: '"Source Serif 4", serif',
      },
      securityLevel: "loose",
      fontFamily: '"Source Serif 4", serif',
    });

    const diagrams = printContainer.querySelectorAll<HTMLElement>(".mermaid");
    for (const el of Array.from(diagrams)) {
      try {
        let source = el.getAttribute("data-source") || el.textContent?.trim() || "";
        if (source.includes("&")) {
          const d = document.createElement("div");
          d.innerHTML = source;
          source = d.textContent || source;
        }

        if (!source) continue;

        const id = `m${Math.random().toString(36).substring(2, 11)}`;
        const { svg } = await mermaid.render(id, source, el);
        el.innerHTML = svg;
        el.style.visibility = "visible";
        el.style.display = "block";

        const svgEl = el.querySelector("svg");
        if (svgEl) {
          svgEl.removeAttribute("height");
          svgEl.style.maxWidth = "100%";
          svgEl.style.height = "auto";
          svgEl.style.display = "block";
          svgEl.style.margin = "1.5rem auto";
          svgEl.querySelectorAll("text").forEach((t) => {
            t.style.fill = "#000";
          });
        }
      } catch (e) {
        console.error("Failed to render diagram for print", e);
      }
    }
  } catch (err) {
    console.error("Mermaid print initialization failed", err);
  }

  const siteTitle = config.siteTitle;

  // 6. Generate Table of Contents HTML
  const tocEntries = sortedDocs
    .map((doc) => {
      const mainEntry = `
      <li class="toc-item toc-level-1">
        <a href="#section-${doc.slug.replace(/\//g, "-")}">${doc.sidebar_label || doc.title}</a>
        <span class="toc-filler"></span>
      </li>
    `;

      const subEntries = (doc.toc || [])
        .filter((item: TocItem) => item.level > 1 && item.level <= 3)
        .map(
          (item: TocItem) => `
      <li class="toc-item toc-level-${item.level}">
        <a href="#section-${doc.slug.replace(/\//g, "-")}#${item.id}">${item.value}</a>
        <span class="toc-filler"></span>
      </li>
    `
        )
        .join("");

      return mainEntry + subEntries;
    })
    .join("");

  const renderedContent = printContainer.innerHTML;
  document.body.removeChild(printContainer);

  const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${siteTitle} - Technical Paper</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    @page { 
      margin: 2.5cm 2cm; 
      size: A4;
      @bottom-right {
        content: counter(page);
        font-family: "Inter", sans-serif;
        font-size: 9pt;
      }
    }
    
    * { box-sizing: border-box; }
    
    body { 
      font-family: "Source Serif 4", serif; 
      font-size: 10pt; 
      line-height: 1.5; 
      color: #000; 
      background: white;
      margin: 0;
      padding: 0;
      text-align: justify;
      hyphens: auto;
      counter-reset: section;
    }

    .print-ui {
      position: fixed;
      top: 0; left: 0; right: 0;
      background: #343a40;
      color: white;
      padding: 0.75rem 2rem;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 1000;
    }

    @media print {
      .print-ui { display: none !important; }
      .doc-section { break-after: page; }
      .doc-section:last-of-type { break-after: auto; }
      .title-page { break-after: page; }
      .toc-page { break-after: page; }

      .code-block, .admonition, .mermaid-diagram, table, img, pre, blockquote { 
        break-inside: avoid; 
      }
      
      h1, h2, h3 { page-break-after: avoid; break-after: avoid; }

      .doc-section h1 { break-before: page; margin-top: 0; }
      .doc-section:first-of-type h1 { break-before: avoid; }
    }

    .container {
      max-width: 100%;
      margin: 0 auto;
      padding: 3rem 1.5cm;
    }
    
    @media print { .container { padding: 0; } }

    .title-page {
      text-align: center;
      padding: 6rem 0 10rem 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 80vh;
    }

    .title-page h1 { font-size: 32pt; margin: 0 0 2rem 0; font-weight: 700; line-height: 1.1; }
    .authors { font-size: 14pt; margin-bottom: 3rem; font-family: "Inter", sans-serif; font-weight: 600; }
    .metadata { font-size: 11pt; color: #333; font-family: "Inter", sans-serif; margin-bottom: 4rem; }

    .abstract-box {
      margin: 4rem auto;
      max-width: 90%;
      padding: 2rem;
      border-top: 0.5pt solid #ccc;
      border-bottom: 0.5pt solid #ccc;
      font-size: 10pt;
      background: #fafafa;
    }
    .abstract-box h2 { font-size: 10pt; text-align: center; text-transform: uppercase; margin-bottom: 1rem; }

    .toc-page { padding: 2rem 0; counter-reset: toc-section; }
    .toc-page h2 { font-size: 16pt; text-transform: uppercase; letter-spacing: 1pt; border-bottom: 1.5pt solid #000; padding-bottom: 0.5rem; margin-bottom: 2rem; }
    .toc-list { list-style: none; padding: 0; margin: 0; }
    .toc-item { display: flex; align-items: baseline; margin-bottom: 0.5rem; font-size: 9.5pt; }
    .toc-level-1 { margin-top: 1rem; font-weight: 700; counter-increment: toc-section; counter-reset: toc-subsection; }
    .toc-level-1 a::before { content: counter(toc-section) ". "; margin-right: 0.5rem; }
    .toc-level-2 { margin-left: 1.5rem; color: #333; counter-increment: toc-subsection; counter-reset: toc-subsubsection; }
    .toc-level-2 a::before { content: counter(toc-section) "." counter(toc-subsection) " "; margin-right: 0.5rem; font-weight: 600; }
    .toc-level-3 { margin-left: 3rem; color: #666; font-size: 8.5pt; counter-increment: toc-subsubsection; }
    .toc-level-3 a::before { content: counter(toc-section) "." counter(toc-subsection) "." counter(toc-subsubsection) " "; margin-right: 0.5rem; }
    .toc-item a { color: inherit; text-decoration: none; }
    .toc-filler { flex: 1; border-bottom: 1pt dotted #aaa; margin: 0 0.5rem; height: 1px; align-self: center; }

    /* Academic Numbering (Content) */
    .doc-section { counter-increment: section; counter-reset: subsection; }
    .doc-content h1::before { content: counter(section) ". "; }
    .doc-content h2 { counter-increment: subsection; counter-reset: subsubsection; }
    .doc-content h2::before { content: counter(section) "." counter(subsection) " "; }
    .doc-content h3 { counter-increment: subsubsection; }
    .doc-content h3::before { content: counter(section) "." counter(subsection) "." counter(subsubsection) " "; }

    .doc-content h1 { font-size: 20pt; margin: 3rem 0 1.5rem 0; font-weight: 700; border-bottom: 2.5pt solid #000; padding-bottom: 0.5rem; }
    .doc-content h2 { font-size: 15pt; margin: 2.5rem 0 1rem 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5pt; border-bottom: 0.5pt solid #eee; padding-bottom: 0.3rem; }
    .doc-content h3 { font-size: 12pt; margin: 2rem 0 0.8rem 0; font-weight: 700; font-style: italic; }
    
    table { width: 100%; border-collapse: collapse; margin: 2rem 0; font-size: 9pt; border: 1pt solid #000; }
    th { border: 1pt solid #000; font-weight: 700; text-align: left; padding: 0.75rem; background: #fff; }
    td { padding: 0.6rem 0.75rem; border: 1pt solid #000; background: #fff; }

    .doc-content .code-block { border: 1pt solid #000; margin: 2rem 0; background: #fff !important; overflow: hidden; page-break-inside: avoid; }
    .doc-content .code-header {
      display: flex; justify-content: space-between; background: #fff !important; padding: 0.4rem 1rem;
      font-size: 8pt; font-weight: 700; font-family: "Inter", sans-serif; border-bottom: 1pt solid #000; color: #000; text-transform: uppercase;
    }
    .doc-content .code-desc, .mermaid-diagram-desc {
      padding: 0.75rem 1.5rem; font-size: 10pt; font-style: italic; color: #000; background: #fff !important; border-top: 1pt solid #000; line-height: 1.4;
    }
    .doc-content pre, .doc-content pre.shiki { 
      margin: 0 !important; padding: 1.25rem !important; font-size: 8.5pt !important; line-height: 1.45 !important; 
      font-family: "JetBrains Mono", monospace !important; white-space: pre-wrap !important; word-break: break-all !important;
      background: #fff !important; color: #000 !important; border: none !important;
    }
    .doc-content code { font-family: "JetBrains Mono", monospace; font-size: 0.9em; background: #fff !important; color: #000 !important; padding: 0.1rem 0.3rem; border: 0.5pt solid #ccc; border-radius: 2px; }
    .shiki span { color: #000 !important; background: transparent !important; }

    .admonition { margin: 2rem 0; padding: 1.5rem; border: 0.5pt solid #ccc; border-left: 4pt solid #333; font-size: 9.5pt; background: #fff; }
    .mermaid-diagram { border: 1pt solid #000; margin: 2.5rem 0; padding: 0; background: #fff; break-inside: avoid; }
    .mermaid { padding: 2rem; width: 100%; display: flex; align-items: center; justify-content: center; overflow: visible; }
    .mermaid svg { max-width: 100% !important; height: auto !important; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="print-ui">
    <div style="font-weight: 600;">Technical Paper Preview</div>
    <button onclick="window.print()" style="padding: 0.5rem 1.2rem; background: #fff; color: #000; border: 1px solid #000; font-weight: 600; cursor: pointer;">
      Print as Academic Paper
    </button>
  </div>
  
  <div class="container">
    <div class="title-page">
      <h1>${siteTitle}</h1>
      <div class="authors">Technical Documentation Team</div>
      <div class="metadata">Generated: ${new Date().toLocaleDateString()} &bull; Source: ${config.siteUrl}</div>
      <div class="abstract-box">
        <h2>Executive Summary</h2>
        <p>This document presents a comprehensive technical overview and reference manual for ${siteTitle}. It aggregates all core architectural concepts, implementation guides, and API specifications into a unified format optimized for technical review and archival.</p>
      </div>
    </div>

    <div class="toc-page">
      <h2>Table of Contents</h2>
      <ul class="toc-list">${tocEntries}</ul>
    </div>

    ${renderedContent}
  </div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow popups to print");
    return;
  }
  win.document.write(printHtml);
  win.document.close();
}
