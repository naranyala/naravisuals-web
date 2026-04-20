import { useEffect, type RefObject } from "react";
import { useServices } from "../../../services";

/**
 * useDocumentEnhancer
 * 
 * Handles late-binding enhancements like Mermaid and MathJax
 * on the rendered HTML content.
 */
export function useDocumentEnhancer(
  ref: RefObject<HTMLDivElement | null>,
  slug: string,
  html: string
) {
  const { events } = useServices();

  useEffect(() => {
    let mounted = true;

    const renderMermaid = async () => {
      const diagrams = ref.current?.querySelectorAll<HTMLElement>(".mermaid-diagram");
      if (!diagrams || diagrams.length === 0) return;

      // Only emit loading if there are unprocessed diagrams
      const hasUnprocessed = Array.from(diagrams).some(w => w.dataset.processed !== "true");
      if (!hasUnprocessed) return;

      events.emit("mermaid:loading", true);

      try {
        let mermaid: any;
        if ((window as any).mermaid) {
          mermaid = (window as any).mermaid;
        } else {
          const m = await import("mermaid");
          mermaid = m.default;
        }
        
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";

        mermaid.initialize({
          startOnLoad: false,
          theme: "default", // Always use default theme for white background
          securityLevel: "loose",
          fontFamily: "var(--font-family, sans-serif)",
          flowchart: {
            htmlLabels: true,
            useMaxWidth: false,
            curve: "basis",
          },
          sequence: {
            useMaxWidth: false,
            htmlLabels: true,
          },
        });

        for (const w of Array.from(diagrams)) {
          if (w.dataset.processed === "true") continue;
          
          const mermaidEl = w.querySelector<HTMLElement>(".mermaid");
          if (!mermaidEl) continue;

          // Ensure the element is visible and has some space before rendering
          // This can help with layout calculation errors
          mermaidEl.style.visibility = "hidden";
          mermaidEl.style.display = "block";

          const source = w.dataset.mermaidSource || mermaidEl.getAttribute("data-source") || mermaidEl.textContent?.trim() || "";
          if (!source) continue;

          try {
            // Use a safer ID prefix
            const id = `d${Math.random().toString(36).slice(2, 9)}`;
            
            // Pass mermaidEl as the third argument for measurement
            // This often fixes the "Could not find a suitable point" error
            const { svg } = await mermaid.render(id, source, mermaidEl);
            
            if (mounted) {
              mermaidEl.innerHTML = svg;
              mermaidEl.style.visibility = "visible";
              w.dataset.processed = "true";
              
              // Attach action handlers
              attachMermaidActions(w, id, source);
              
              events.emit("mermaid:rendered", { slug, count: 1 });
            }
          } catch (e) {
            console.error("Mermaid render failed", e);
            if (mounted) {
              mermaidEl.innerHTML = `<div class="mermaid-error">
                <div class="mermaid-error-title">Mermaid Render Error</div>
                <pre class="mermaid-error-msg">${e instanceof Error ? e.message : String(e)}</pre>
              </div>`;
              mermaidEl.style.visibility = "visible";
            }
          }
        }
      } finally {
        events.emit("mermaid:loading", false);
      }
    };

    const attachMermaidActions = (container: HTMLElement, id: string, source: string) => {
      const zoomBtn = container.querySelector(".mermaid-zoom-btn");
      const downloadBtn = container.querySelector(".mermaid-download-btn");
      const codeBtn = container.querySelector(".mermaid-code-btn");
      const sourceContainer = container.querySelector<HTMLElement>(".mermaid-source-container");
      const copyBtn = container.querySelector(".mermaid-source-copy-btn");

      zoomBtn?.addEventListener("click", () => {
        const diagramEl = container.querySelector(".mermaid");
        const svgEl = diagramEl?.querySelector("svg");
        if (svgEl) handleZoom(svgEl.outerHTML);
      });

      downloadBtn?.addEventListener("click", () => {
        const diagramEl = container.querySelector(".mermaid");
        const svgEl = diagramEl?.querySelector("svg");
        if (svgEl instanceof SVGSVGElement) handleDownload(svgEl, `diagram-${id}`);
      });

      codeBtn?.addEventListener("click", () => {
        if (sourceContainer) {
          const isHidden = sourceContainer.style.display === "none";
          sourceContainer.style.display = isHidden ? "block" : "none";
          codeBtn.classList.toggle("active", isHidden);
        }
      });

      copyBtn?.addEventListener("click", () => {
        navigator.clipboard.writeText(source).then(() => {
          copyBtn.textContent = "Copied!";
          copyBtn.classList.add("copied");
          setTimeout(() => {
            copyBtn.textContent = "Copy";
            copyBtn.classList.remove("copied");
          }, 2000);
        });
      });
    };

    const handleZoom = (svgHtml: string) => {
      const overlay = document.createElement("div");
      overlay.className = "mermaid-fullscreen-overlay";
      overlay.innerHTML = `
        <div class="mermaid-fullscreen-header">
          <span class="mermaid-fullscreen-title">Diagram Preview</span>
          <div class="mermaid-fullscreen-controls">
            <button class="mermaid-fullscreen-zoom-btn" data-action="zoom-out" title="Zoom Out">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
            <span class="mermaid-zoom-level">100%</span>
            <button class="mermaid-fullscreen-zoom-btn" data-action="zoom-in" title="Zoom In">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
          </div>
          <button class="mermaid-fullscreen-close">
            <span>Close Preview</span>
          </button>
        </div>
        <div class="mermaid-fullscreen-content">
          <div class="mermaid-fullscreen-viewport">
            <div class="mermaid-diagram-container">${svgHtml}</div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";

      const container = overlay.querySelector<HTMLElement>(".mermaid-diagram-container")!;
      const content = overlay.querySelector<HTMLElement>(".mermaid-fullscreen-content")!;
      
      let scale = 1;
      let pointX = 0;
      let pointY = 0;
      let startX = 0;
      let startY = 0;
      let isDragging = false;

      const updateTransform = () => {
        container.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
        const zoomLevelEl = overlay.querySelector(".mermaid-zoom-level");
        if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
      };

      overlay.querySelector('[data-action="zoom-in"]')?.addEventListener("click", (e) => {
        e.stopPropagation();
        scale = Math.min(scale * 1.2, 8);
        updateTransform();
      });

      overlay.querySelector('[data-action="zoom-out"]')?.addEventListener("click", (e) => {
        e.stopPropagation();
        scale = Math.max(scale / 1.2, 0.1);
        updateTransform();
      });

      overlay.querySelector(".mermaid-fullscreen-close")?.addEventListener("click", () => {
        document.body.removeChild(overlay);
        document.body.style.overflow = "";
      });

      // Dragging logic on the content area
      content.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX - pointX;
        startY = e.clientY - pointY;
      });

      window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        pointX = e.clientX - startX;
        pointY = e.clientY - startY;
        updateTransform();
      });

      window.addEventListener("mouseup", () => {
        isDragging = false;
      });

      // Mouse wheel zoom
      content.addEventListener("wheel", (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.min(Math.max(scale * delta, 0.1), 10);
        updateTransform();
      }, { passive: false });

      // Close on escape
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          document.body.removeChild(overlay);
          document.body.style.overflow = "";
          window.removeEventListener("keydown", handleEsc);
        }
      };
      window.addEventListener("keydown", handleEsc);
    };

    const handleDownload = (svgEl: SVGSVGElement, filename: string) => {
      const clone = svgEl.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      
      const svgData = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([`<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${svgData}`], {
        type: "image/svg+xml;charset=utf-8"
      });
      const url = URL.createObjectURL(svgBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const renderMath = async () => {
      if (typeof window === "undefined" || !(window as any).MathJax) return;
      try {
        await (window as any).MathJax.typesetPromise([ref.current]);
        events.emit("mathjax:rendered", { slug });
      } catch (e) {
        console.warn("MathJax typeset failed", e);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        if (mounted) {
          renderMermaid();
          renderMath();
        }
      });
    }, 500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [html, slug, ref, events]);
}
