import { type RefObject, useEffect } from "react";
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
  _html: string
) {
  const { events } = useServices();

  useEffect(() => {
    let mounted = true;

    const renderMermaid = async () => {
      const diagrams = ref.current?.querySelectorAll<HTMLElement>(".mermaid-diagram");
      if (!diagrams || diagrams.length === 0) return;

      // Only emit loading if there are unprocessed diagrams
      const hasUnprocessed = Array.from(diagrams).some((w) => w.dataset.processed !== "true");
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

          let source =
            w.dataset.mermaidSource ||
            mermaidEl.getAttribute("data-source") ||
            mermaidEl.textContent?.trim() ||
            "";

          // Always decode entities to ensure Mermaid gets raw text
          if (source.includes("&")) {
            const decoder = document.createElement("div");
            decoder.innerHTML = source;
            source = decoder.textContent || source;
          }

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
      const downloadSvgBtn = container.querySelector(".mermaid-download-svg-btn");
      const downloadJpgBtn = container.querySelector(".mermaid-download-jpg-btn");
      const codeBtn = container.querySelector(".mermaid-code-btn");
      const sourceContainer = container.querySelector<HTMLElement>(".mermaid-source-container");
      const copyBtn = container.querySelector(".mermaid-source-copy-btn");

      zoomBtn?.addEventListener("click", () => {
        const diagramEl = container.querySelector(".mermaid");
        const svgEl = diagramEl?.querySelector("svg");
        if (svgEl) {
          handleZoom(svgEl.outerHTML);
          container.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      downloadSvgBtn?.addEventListener("click", () => {
        const diagramEl = container.querySelector(".mermaid");
        const svgEl = diagramEl?.querySelector("svg");
        if (svgEl instanceof SVGSVGElement) {
          handleDownload(svgEl, `diagram-${id}`, "svg");
          container.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      downloadJpgBtn?.addEventListener("click", () => {
        const diagramEl = container.querySelector(".mermaid");
        if (diagramEl) {
          handleDownload(diagramEl as HTMLElement, `diagram-${id}`, "jpg");
          container.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      codeBtn?.addEventListener("click", () => {
        if (sourceContainer) {
          const isHidden = sourceContainer.style.display === "none";
          sourceContainer.style.display = isHidden ? "block" : "none";
          codeBtn.classList.toggle("active", isHidden);
          if (isHidden) {
            setTimeout(() => {
              const mermaidEl = container.querySelector(".mermaid");
              const diagramHeight = mermaidEl ? (mermaidEl as HTMLElement).offsetHeight : 0;
              const elementPosition = sourceContainer.getBoundingClientRect().top;

              // Scroll so that roughly half the diagram remains visible above the raw code
              const offsetPosition = elementPosition + window.pageYOffset - diagramHeight / 2;

              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
              });
            }, 50);
          }
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

    const handleDownload = async (
      target: SVGSVGElement | HTMLElement,
      filename: string,
      format: "svg" | "jpg"
    ) => {
      if (format === "svg") {
        const svgEl = target as SVGSVGElement;
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = `${filename}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
      } else {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(target as HTMLElement, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
        });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/jpeg", 0.9);
        link.download = `${filename}.jpg`;
        link.click();
      }
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

      const container = overlay.querySelector<HTMLElement>(".mermaid-diagram-container");
      const content = overlay.querySelector<HTMLElement>(".mermaid-fullscreen-content");

      if (!container || !content) {
        document.body.removeChild(overlay);
        document.body.style.overflow = "";
        return;
      }

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
      content.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          const delta = e.deltaY > 0 ? 0.9 : 1.1;
          scale = Math.min(Math.max(scale * delta, 0.1), 10);
          updateTransform();
        },
        { passive: false }
      );

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

    const renderTables = () => {
      const containers = ref.current?.querySelectorAll<HTMLElement>(".table-container");
      if (!containers || containers.length === 0) return;

      for (const container of Array.from(containers)) {
        if (container.dataset.enhanced === "true") continue;

        // Find the preceding heading to use as title
        let title = "Table";
        let prev = container.previousElementSibling;
        while (prev) {
          if (/^H[1-6]$/.test(prev.tagName)) {
            title = (prev.textContent?.trim() || "Table").replace(/#\s*$/, "");
            break;
          }
          prev = prev.previousElementSibling;
        }

        // Create the wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "table-enhanced-wrapper";

        // Create the titlebar
        const titlebar = document.createElement("div");
        titlebar.className = "table-enhanced-titlebar";

        const actions = document.createElement("div");
        actions.className = "table-enhanced-actions";

        const zoomBtn = document.createElement("button");
        zoomBtn.className = "table-enhanced-btn";
        zoomBtn.title = "Fullscreen";
        zoomBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;
        zoomBtn.onclick = () => handleTableZoom(container);

        const downloadBtn = document.createElement("button");
        downloadBtn.className = "table-enhanced-btn";
        downloadBtn.title = "Download as Image";
        downloadBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`;
        downloadBtn.onclick = (e) => handleTableDownload(container, e.currentTarget as HTMLElement);

        actions.appendChild(zoomBtn);
        actions.appendChild(downloadBtn);

        const titleEl = document.createElement("span");
        titleEl.className = "table-enhanced-title";
        titleEl.textContent = title;

        titlebar.appendChild(titleEl);
        titlebar.appendChild(actions);

        // Wrap the original container
        const contentDiv = document.createElement("div");
        contentDiv.className = "table-enhanced-container";

        wrapper.appendChild(titlebar);
        wrapper.appendChild(contentDiv);

        // Insert wrapper before container first, then move container into it
        if (container.parentNode) {
          container.parentNode.insertBefore(wrapper, container);
          contentDiv.appendChild(container);
        }

        container.dataset.enhanced = "true";
      }
    };

    const handleTableZoom = (container: HTMLElement) => {
      const overlay = document.createElement("div");
      overlay.className = "mermaid-fullscreen-overlay table-zoom-overlay";
      overlay.innerHTML = `
        <div class="mermaid-fullscreen-header">
          <span class="mermaid-fullscreen-title">Table Preview</span>
          <div class="mermaid-fullscreen-controls"></div>
          <button class="mermaid-fullscreen-close">
            <span>Close Preview</span>
          </button>
        </div>
        <div class="mermaid-fullscreen-content table-zoom-content">
          <div class="mermaid-fullscreen-viewport table-zoom-viewport">
            <div class="mermaid-diagram-container table-zoom-container"></div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";

      const targetContainer = overlay.querySelector<HTMLElement>(".mermaid-diagram-container");
      if (targetContainer) {
        const clone = container.cloneNode(true) as HTMLElement;
        // Remove constraints that cause cropping or scrolling inside the zoom view
        clone.style.width = "max-content";
        clone.style.overflow = "visible";
        clone.style.margin = "0";

        // Also ensure the table inside the clone is not forced to 100% width of a smaller container
        const table = clone.querySelector("table");
        if (table) {
          table.style.width = "max-content";
        }

        targetContainer.appendChild(clone);
      }

      overlay.querySelector(".mermaid-fullscreen-close")?.addEventListener("click", () => {
        document.body.removeChild(overlay);
        document.body.style.overflow = "";
      });

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          document.body.removeChild(overlay);
          document.body.style.overflow = "";
          window.removeEventListener("keydown", handleEsc);
        }
      };
      window.addEventListener("keydown", handleEsc);
    };

    const handleTableDownload = async (container: HTMLElement, btn: HTMLElement) => {
      const originalContent = btn.innerHTML;
      try {
        (btn as HTMLButtonElement).disabled = true;
        btn.innerHTML = `<div class="mermaid-spinner"></div>`;

        // Create a temporary wrapper to ensure we capture the full table without cropping
        const tempWrapper = document.createElement("div");
        tempWrapper.style.position = "absolute";
        tempWrapper.style.left = "-9999px";
        tempWrapper.style.top = "0";
        tempWrapper.style.width = "auto";

        const clone = container.cloneNode(true) as HTMLElement;
        clone.style.width = "max-content";
        clone.style.overflow = "visible";

        const table = clone.querySelector("table");
        if (table) {
          table.style.width = "max-content";
        }

        tempWrapper.appendChild(clone);
        document.body.appendChild(tempWrapper);

        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(clone, {
          backgroundColor: "#ffffff",
          logging: false,
          scale: 2,
          useCORS: true,
        });

        document.body.removeChild(tempWrapper);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `table-${Math.random().toString(36).slice(2, 9)}.png`;
        link.click();
      } catch (e) {
        console.error("Table download failed", e);
      } finally {
        (btn as HTMLButtonElement).disabled = false;
        btn.innerHTML = originalContent;
      }
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
          renderTables();
          renderMath();
        }
      });
    }, 500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [slug, ref, events]);
}
