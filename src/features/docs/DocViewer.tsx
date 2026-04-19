import { useEffect, useRef } from "react";

declare global {
  interface Window {
    MathJax?: {
      typesetPromise: (elements: HTMLElement[]) => Promise<void>;
    };
    __mermaidUnbind__?: () => void;
    __mermaidLoading__?: boolean;
  }
}

interface DocViewerProps {
  html: string;
  slug: string;
}

export function DocViewer({ html, slug }: DocViewerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    const observerRef = { current: null as IntersectionObserver | null };

    // Setup zoom button click handlers
    const setupZoomHandlers = () => {
      const zoomButtons = ref.current?.querySelectorAll(".mermaid-zoom-btn");
      if (!zoomButtons) return;

      zoomButtons.forEach((btn) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);

        newBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const diagramWrapper = (newBtn as HTMLElement).closest(".mermaid-diagram");
          if (!diagramWrapper) return;

          const mermaidEl = diagramWrapper.querySelector<HTMLElement>(".mermaid");
          const svgEl = mermaidEl?.querySelector("svg");
          if (!svgEl) return;

          const overlay = document.createElement("div");
          overlay.className = "mermaid-fullscreen-overlay";
          overlay.innerHTML = `
            <div class="mermaid-fullscreen-header">
              <span class="mermaid-fullscreen-title">Diagram</span>
              <div class="mermaid-fullscreen-controls">
                <button class="mermaid-fullscreen-zoom-btn" data-action="zoom-in" title="Zoom In" aria-label="Zoom in">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                    <path d="M11 8v6"/>
                    <path d="M8 11h6"/>
                  </svg>
                </button>
                <button class="mermaid-fullscreen-zoom-btn" data-action="zoom-out" title="Zoom Out" aria-label="Zoom out">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                    <path d="M11 8v6"/>
                    <path d="M8 11h6"/>
                  </svg>
                </button>
                <button class="mermaid-fullscreen-zoom-btn" data-action="zoom-reset" title="Reset Zoom" aria-label="Reset zoom">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                </button>
                <span class="mermaid-zoom-level">100%</span>
              </div>
              <button class="mermaid-fullscreen-close" aria-label="Close fullscreen diagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
                Close
              </button>
            </div>
            <div class="mermaid-fullscreen-content">
              <div class="mermaid-fullscreen-viewport">
                <div class="mermaid-diagram-container">
                  ${svgEl.outerHTML}
                </div>
              </div>
            </div>
          `;

          document.body.appendChild(overlay);
          document.body.style.overflow = "hidden";

          let scale = 1;
          let panning = false;
          let pointX = 0;
          let pointY = 0;
          let startX = 0;
          let startY = 0;

          const viewport = overlay.querySelector(".mermaid-fullscreen-viewport");
          const container = viewport?.querySelector(".mermaid-diagram-container") as HTMLElement;
          const zoomLevelEl = overlay.querySelector(".mermaid-zoom-level");

          if (!viewport || !container) return;
          container.style.transform = `translate(0px, 0px) scale(${scale})`;

          const updateTransform = () => {
            container.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
            if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
          };

          overlay.querySelector('[data-action="zoom-in"]')?.addEventListener("click", () => {
            scale = Math.min(scale * 1.25, 5);
            updateTransform();
          });

          overlay.querySelector('[data-action="zoom-out"]')?.addEventListener("click", () => {
            scale = Math.max(scale / 1.25, 0.1);
            updateTransform();
          });

          overlay.querySelector('[data-action="zoom-reset"]')?.addEventListener("click", () => {
            scale = 1; pointX = 0; pointY = 0;
            updateTransform();
          });

          viewport.addEventListener("wheel", (e: any) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale = Math.min(Math.max(scale * delta, 0.1), 5);
            updateTransform();
          });

          container.addEventListener("mousedown", (e: any) => {
            if (e.target.closest("a, button")) return;
            e.preventDefault();
            panning = true;
            startX = e.clientX - pointX;
            startY = e.clientY - pointY;
            container.style.cursor = "grabbing";
          });

          const handleMouseMove = (e: any) => {
            if (!panning) return;
            e.preventDefault();
            pointX = e.clientX - startX;
            pointY = e.clientY - startY;
            updateTransform();
          };

          const handleMouseUp = () => {
            if (panning) {
              panning = false;
              container.style.cursor = "grab";
            }
          };

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);

          const closeOverlay = () => {
            overlay.remove();
            document.body.style.overflow = "";
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
          };

          overlay.querySelector(".mermaid-fullscreen-close")?.addEventListener("click", closeOverlay);
          document.addEventListener("keydown", function esc(e) {
            if (e.key === "Escape") {
              closeOverlay();
              document.removeEventListener("keydown", esc);
            }
          });
        });
      });
    };

    const setupDownloadHandlers = () => {
      ref.current?.querySelectorAll(".mermaid-download-btn").forEach((btn) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const wrapper = (newBtn as HTMLElement).closest(".mermaid-diagram");
          const svgEl = wrapper?.querySelector(".mermaid svg") as SVGElement;
          if (!svgEl) return;

          const svgClone = svgEl.cloneNode(true) as SVGElement;
          svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          svgClone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
          svgClone.style.maxWidth = ""; svgClone.style.height = "";

          const svgString = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(svgClone)}`;
          const url = URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml" }));
          const filename = wrapper?.querySelector(".mermaid-diagram-desc")?.textContent?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50) || "diagram";

          const link = document.createElement("a");
          link.href = url; link.download = `${filename}.svg`;
          document.body.appendChild(link); link.click();
          document.body.removeChild(link); URL.revokeObjectURL(url);
        });
      });
    };

    const setupSourceHandlers = () => {
      ref.current?.querySelectorAll(".mermaid-code-btn").forEach((btn) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const container = (newBtn as HTMLElement).closest(".mermaid-diagram")?.querySelector<HTMLElement>(".mermaid-source-container");
          if (!container) return;
          const isHidden = container.style.display === "none";
          container.style.display = isHidden ? "block" : "none";
          (newBtn as HTMLElement).classList.toggle("active", isHidden);
        });
      });

      ref.current?.querySelectorAll(".mermaid-source-copy-btn").forEach((btn) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const text = (newBtn as HTMLElement).closest(".mermaid-source-container")?.querySelector("code")?.textContent || "";
          navigator.clipboard.writeText(text).then(() => {
            const original = (newBtn as HTMLElement).textContent;
            (newBtn as HTMLElement).textContent = "Copied!";
            setTimeout(() => { (newBtn as HTMLElement).textContent = original; }, 2000);
          });
        });
      });
    };

    const renderSingleDiagram = async (wrapper: HTMLElement, mermaid: any, slug: string, index: number) => {
      if (wrapper.dataset.processed === "true" || !mounted) return;

      const mermaidEl = wrapper.querySelector<HTMLElement>(".mermaid");
      const loadingEl = wrapper.querySelector<HTMLElement>(".mermaid-loading");
      const errorEl = wrapper.querySelector<HTMLElement>(".mermaid-error");
      if (!mermaidEl) return;

      // CRITICAL: Get source from data-source attribute set during build
      if (!wrapper.dataset.mermaidSource) {
        wrapper.dataset.mermaidSource = mermaidEl.getAttribute("data-source") || mermaidEl.textContent?.trim() || "";
      }
      const diagramSource = wrapper.dataset.mermaidSource;
      if (!diagramSource) return;

      // Mark as processed early to prevent re-entrancy
      wrapper.dataset.processed = "true";

      try {
        const uniqueId = `mermaid-chart-${slug.replace(/\//g, "-")}-${index}-${Math.random().toString(36).slice(2, 7)}`;
        
        // Ensure the element is clean and briefly visible for measurement (hidden via opacity)
        mermaidEl.innerHTML = "";
        mermaidEl.style.display = "block";
        mermaidEl.style.opacity = "0";
        
        // Pass mermaidEl as the container to improve measurement accuracy in Mermaid v11
        const result = await mermaid.render(uniqueId, diagramSource, mermaidEl);
        const svgContent = typeof result === "string" ? result : result?.svg;

        if (mounted && svgContent) {
          mermaidEl.innerHTML = svgContent;
          mermaidEl.style.opacity = "1";
          if (errorEl) errorEl.style.display = "none";
        }
      } catch (err) {
        console.error(`Mermaid render failed for ${slug} [${index}]:`, err);
        if (mounted) {
          mermaidEl.style.display = "block";
          mermaidEl.style.opacity = "1";
          
          if (errorEl) {
            const msg = err instanceof Error ? err.message : String(err);
            errorEl.style.display = "block";
            errorEl.innerHTML = `
              <div class="mermaid-error-title">⚠ Rendering Failed</div>
              <p style=\"font-size: 0.85em; margin: 0.5rem 0; opacity: 0.8;\">
                Mermaid failed to render this diagram in the browser.
              </p>
              <pre class="mermaid-error-msg">${msg}</pre>
              <details>
                <summary>View Diagram Source</summary>
                <pre class="mermaid-error-source">${diagramSource}</pre>
              </details>
            `;
          }
        }
      } finally {
        if (mounted && loadingEl) loadingEl.style.display = "none";
      }
    };

    const renderMermaid = async () => {
      if (!ref.current || !mounted) return;
      const diagrams = ref.current.querySelectorAll<HTMLElement>(".mermaid-diagram");
      if (diagrams.length === 0) return;

      window.__mermaidLoading__ = true;
      let mermaid: any;
      try {
        mermaid = (window as any).mermaid;
        if (!mermaid || typeof mermaid.render !== "function") {
          mermaid = (await import("mermaid")).default;
        }
        
        // Ensure we only initialize once per session or when theme-relevant settings change
        if (!(window as any).__mermaidInitialized__) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "neutral", // Switch to neutral for better compatibility in v11
            securityLevel: "loose",
            fontFamily: "system-ui, -apple-system, sans-serif",
          });
          (window as any).__mermaidInitialized__ = true;
        }
      } catch (err) {
        console.error("Failed to load Mermaid:", err);
        window.__mermaidLoading__ = false; return;
      }

      const observer = new IntersectionObserver(async (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && mounted) {
            const w = entry.target as HTMLElement;
            observer.unobserve(w);
            await renderSingleDiagram(w, mermaid, slug, parseInt(w.dataset.index || "0", 10));
          }
        }
      }, { rootMargin: "1000px" });
      observerRef.current = observer;

      diagrams.forEach((w, i) => {
        if (w.dataset.processed !== "true") {
          w.dataset.index = i.toString();
          observer.observe(w);
        }
      });
      window.__mermaidLoading__ = false;
    };

    const renderMath = async () => {
      if (!ref.current) return;
      const mathElements = ref.current.querySelectorAll<HTMLElement>(".math-inline, .math-display");
      if (mathElements.length === 0) return;
      let attempts = 0;
      while (typeof window.MathJax === "undefined" && attempts < 20) {
        await new Promise(r => setTimeout(r, 500)); attempts++;
      }
      if (window.MathJax?.typesetPromise) {
        try { await window.MathJax.typesetPromise([ref.current!]); } catch (e) { console.warn(e); }
      }
    };

    const enhanceCodeBlocks = () => {
      if (!ref.current) return;
      ref.current.querySelectorAll("pre code[class^='language-']").forEach(code => {
        const pre = code.parentElement;
        if (!pre || pre.parentElement?.classList.contains("code-block")) return;
        const match = code.className.match(/language-([^ ]+)/);
        if (!match) return;
        const info = match[1];
        const colonIndex = info.indexOf(":");
        let lang = colonIndex >= 0 ? info.slice(0, colonIndex) : info;
        lang = ["txt", "text", "plain", ""].includes(lang.toLowerCase()) ? "Text" : lang.charAt(0).toUpperCase() + lang.slice(1);
        const container = document.createElement("div");
        container.className = "code-block";
        container.innerHTML = `<div class="code-header"><span class="code-lang">${lang}</span><button class="code-copy-btn" onclick="copyCode(this)">Copy</button></div>`;
        const newPre = pre.cloneNode(true);
        container.appendChild(newPre);
        pre.replaceWith(container);
      });
    };

    const run = async () => {
      const raf = typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : (cb: any) => setTimeout(cb, 0);
      await new Promise<void>(resolve => raf(() => resolve()));
      if (!mounted) return;
      await renderMermaid();
      if (!mounted) return;
      renderMath();
      enhanceCodeBlocks();
      setupZoomHandlers();
      setupDownloadHandlers();
      setupSourceHandlers();
    };

    run();
    return () => {
      mounted = false;
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [html, slug]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          if (id) history.replaceState(null, "", `#${id}`);
        }
      }
    }, { rootMargin: "0px 0px -80% 0px" });
    document.querySelectorAll(".doc-content h2, .doc-content h3").forEach(h => observer.observe(h));
    return () => observer.disconnect();
  }, [html]);

  return <div ref={ref} className="doc-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
