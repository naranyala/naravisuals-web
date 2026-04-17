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

async function renderMermaid(container: HTMLElement | null, slug: string) {
  if (!container) return;

  const diagrams = container.querySelectorAll<HTMLElement>(".mermaid-diagram");
  if (diagrams.length === 0) return;

  window.__mermaidLoading__ = true;

  let mermaid: any;
  try {
    mermaid = (window as any).mermaid;

    if (!mermaid || typeof mermaid.render !== "function") {
      const mermaidModule = await import("mermaid");
      mermaid = mermaidModule.default || mermaidModule;
    }

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
  } catch (err) {
    console.error("Failed to load Mermaid:", err);
    window.__mermaidLoading__ = false;
    return;
  }

  const observer = new IntersectionObserver(
    async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const wrapper = entry.target as HTMLElement;

          // Extract the index from the dataset
          const index = wrapper.dataset.index || "0";

          observer.unobserve(wrapper);
          await renderSingleDiagram(wrapper, mermaid, slug, parseInt(index, 10));
        }
      }
    },
    { rootMargin: "1000px" }
  );

  diagrams.forEach((wrapper, index) => {
    wrapper.dataset.index = index.toString();
    observer.observe(wrapper);
  });

  window.__mermaidLoading__ = false;
}

async function renderSingleDiagram(
  wrapper: HTMLElement,
  mermaid: any,
  slug: string,
  index: number
) {
  if (wrapper.dataset.processed === "true") return;

  const mermaidEl = wrapper.querySelector<HTMLElement>(".mermaid");
  const errorEl = wrapper.querySelector<HTMLElement>(".mermaid-error");
  const loadingEl = wrapper.querySelector<HTMLElement>(".mermaid-loading");

  if (!mermaidEl) return;

  const diagramSource = mermaidEl.textContent?.trim();
  if (!diagramSource) return;

  try {
    const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const result = await mermaid.render(uniqueId, diagramSource);

    wrapper.dataset.processed = "true";

    if (loadingEl) loadingEl.style.display = "none";
    if (result?.svg) {
      mermaidEl.innerHTML = result.svg;
      mermaidEl.style.display = "block";
      mermaidEl.style.opacity = "1";
    }

    if (errorEl) errorEl.style.display = "none";

    console.log(`✅ [Mermaid Frontend] Rendered successfully:`, {
      slug,
      index,
      id: uniqueId,
      source: `${diagramSource.slice(0, 50)}...`,
    });
  } catch (err) {
    console.error(`❌ [Mermaid Frontend] Render failed:`, {
      slug,
      index,
      error: err instanceof Error ? err.message : String(err),
      source: diagramSource,
    });
    if (loadingEl) loadingEl.style.display = "none";
    if (errorEl) {
      const msg = err instanceof Error ? err.message : String(err);
      errorEl.style.display = "block";
      errorEl.innerHTML = `<div class="mermaid-error-title">⚠ Failed to render</div><pre>${msg}</pre><pre>${diagramSource}</pre>`;
    }
    mermaidEl.style.display = "block";
    mermaidEl.style.whiteSpace = "pre-wrap";
    mermaidEl.style.padding = "1rem";
    mermaidEl.style.background = "var(--bg-code)";
    mermaidEl.style.color = "var(--text)";
    mermaidEl.style.opacity = "1";
  }
}

async function renderMath(container: HTMLElement | null) {
  if (!container) return;

  // Find all math elements that haven't been processed yet
  const mathElements = container.querySelectorAll<HTMLElement>(".math-inline, .math-display");
  if (mathElements.length === 0) return;

  // If MathJax is already loaded, typeset immediately without loading state
  const mj = window.MathJax;
  if (mj && typeof mj.typesetPromise === "function") {
    try {
      await mj.typesetPromise([container]);
      for (const el of mathElements) {
        el.dataset.mathState = "rendered";
      }
    } catch (err) {
      console.warn("MathJax typeset failed:", err);
      for (const el of mathElements) {
        el.dataset.mathState = "error";
      }
    }
    return;
  }

  // MathJax not loaded yet — mark elements as loading
  const loadingElements: HTMLElement[] = [];
  for (const el of mathElements) {
    el.dataset.mathState = "loading";
    loadingElements.push(el);
  }

  // Wait for MathJax to load (up to 10 seconds)
  let attempts = 0;
  const maxAttempts = 20;
  while (typeof window.MathJax === "undefined" && attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 500));
    attempts++;
  }

  const mjLoaded = window.MathJax;
  if (mjLoaded && typeof mjLoaded.typesetPromise === "function") {
    try {
      await mjLoaded.typesetPromise([container]);
      for (const el of loadingElements) {
        if (el.dataset.mathState === "loading") {
          el.dataset.mathState = "rendered";
        }
      }
    } catch (err) {
      console.warn("MathJax typeset failed:", err);
      for (const el of loadingElements) {
        if (el.dataset.mathState === "loading") {
          el.dataset.mathState = "error";
        }
      }
    }
  } else {
    console.warn("MathJax not loaded after 10 seconds. Math will not be rendered.");
    for (const el of loadingElements) {
      if (el.dataset.mathState === "loading") {
        el.dataset.mathState = "error";
      }
    }
  }
}

export function DocViewer({ html, slug }: DocViewerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    // Setup zoom button click handlers
    const setupZoomHandlers = () => {
      const zoomButtons = ref.current?.querySelectorAll(".mermaid-zoom-btn");
      if (!zoomButtons) return;

      zoomButtons.forEach((btn) => {
        // Remove existing listener if any (prevent duplicates)
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);

        newBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const diagramWrapper = (newBtn as HTMLElement).closest(".mermaid-diagram");
          if (!diagramWrapper) return;

          const mermaidEl = diagramWrapper.querySelector<HTMLElement>(".mermaid");
          const svgEl = mermaidEl?.querySelector("svg");
          if (!svgEl) return;

          // Create fullscreen overlay
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

          // Add to body
          document.body.appendChild(overlay);

          // Prevent body scroll
          document.body.style.overflow = "hidden";

          // Setup zoom and pan state
          let scale = 1;
          let panning = false;
          let pointX = 0;
          let pointY = 0;
          let startX = 0;
          let startY = 0;

          const viewport = overlay.querySelector(".mermaid-fullscreen-viewport");
          const container = viewport?.querySelector(".mermaid-diagram-container");
          const zoomLevelEl = overlay.querySelector(".mermaid-zoom-level");

          if (!viewport || !container) return;

          // Center the diagram initially
          container.style.transform = `translate(0px, 0px) scale(${scale})`;

          const updateTransform = () => {
            container.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
            if (zoomLevelEl) {
              zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
            }
          };

          // Zoom controls
          const zoomInBtn = overlay.querySelector('[data-action="zoom-in"]');
          const zoomOutBtn = overlay.querySelector('[data-action="zoom-out"]');
          const zoomResetBtn = overlay.querySelector('[data-action="zoom-reset"]');

          zoomInBtn?.addEventListener("click", () => {
            scale = Math.min(scale * 1.25, 5);
            updateTransform();
          });

          zoomOutBtn?.addEventListener("click", () => {
            scale = Math.max(scale / 1.25, 0.1);
            updateTransform();
          });

          zoomResetBtn?.addEventListener("click", () => {
            scale = 1;
            pointX = 0;
            pointY = 0;
            updateTransform();
          });

          // Mouse wheel zoom
          viewport.addEventListener("wheel", (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale = Math.min(Math.max(scale * delta, 0.1), 5);
            updateTransform();
          });

          // Drag to pan
          container.style.cursor = "grab";

          container.addEventListener("mousedown", (e) => {
            // Don't pan when clicking on SVG interactive elements
            if ((e.target as HTMLElement).closest("a, button")) return;

            e.preventDefault();
            panning = true;
            startX = e.clientX - pointX;
            startY = e.clientY - pointY;
            container.style.cursor = "grabbing";
          });

          document.addEventListener("mousemove", (e) => {
            if (!panning) return;
            e.preventDefault();
            pointX = e.clientX - startX;
            pointY = e.clientY - startY;
            updateTransform();
          });

          document.addEventListener("mouseup", () => {
            if (panning) {
              panning = false;
              container.style.cursor = "grab";
            }
          });

          // Touch support for drag
          let touchStartX = 0;
          let touchStartY = 0;
          let touchPanning = false;

          container.addEventListener("touchstart", (e) => {
            if (e.touches.length === 1) {
              touchPanning = true;
              touchStartX = e.touches[0].clientX - pointX;
              touchStartY = e.touches[0].clientY - pointY;
            }
          });

          container.addEventListener("touchmove", (e) => {
            if (!touchPanning || e.touches.length !== 1) return;
            e.preventDefault();
            pointX = e.touches[0].clientX - touchStartX;
            pointY = e.touches[0].clientY - touchStartY;
            updateTransform();
          });

          container.addEventListener("touchend", () => {
            touchPanning = false;
          });

          // Pinch to zoom (touch)
          let initialPinchDistance = 0;
          let pinchScale = 1;

          container.addEventListener("touchstart", (e) => {
            if (e.touches.length === 2) {
              touchPanning = false;
              initialPinchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
              );
              pinchScale = scale;
            }
          });

          container.addEventListener("touchmove", (e) => {
            if (e.touches.length === 2) {
              e.preventDefault();
              const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
              );
              scale = Math.min(
                Math.max(pinchScale * (currentDistance / initialPinchDistance), 0.1),
                5
              );
              updateTransform();
            }
          });

          // Setup close handler
          const closeBtn = overlay.querySelector(".mermaid-fullscreen-close");
          const closeOverlay = () => {
            overlay.remove();
            document.body.style.overflow = "";
          };

          closeBtn?.addEventListener("click", closeOverlay);

          // Close on Escape key
          const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
              closeOverlay();
              document.removeEventListener("keydown", handleEscape);
            }
          };
          document.addEventListener("keydown", handleEscape);

          // Close on overlay background click (not on content)
          overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
              closeOverlay();
            }
          });
        });
      });
    };

    // Setup download button click handlers
    const setupDownloadHandlers = () => {
      const downloadButtons = ref.current?.querySelectorAll(".mermaid-download-btn");
      if (!downloadButtons) return;

      downloadButtons.forEach((btn) => {
        // Remove existing listener if any (prevent duplicates)
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);

        newBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const diagramWrapper = (newBtn as HTMLElement).closest(".mermaid-diagram");
          if (!diagramWrapper) return;

          const mermaidEl = diagramWrapper.querySelector<HTMLElement>(".mermaid");
          const svgEl = mermaidEl?.querySelector("svg");
          if (!svgEl) return;

          // Clone the SVG to clean up any Mermaid-added inline styles
          const svgClone = svgEl.cloneNode(true) as SVGElement;

          // Ensure proper XML namespace and attributes for standalone SVG
          svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          svgClone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

          // Remove any Mermaid-added inline styles that might conflict with CSS
          svgClone.style.maxWidth = "";
          svgClone.style.height = "";
          svgClone.style.display = "";
          svgClone.style.margin = "";

          // Get the SVG markup
          const serializer = new XMLSerializer();
          let svgString = serializer.serializeToString(svgClone);

          // Add XML declaration for proper encoding
          svgString = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;

          // Create blob and download link
          const blob = new Blob([svgString], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);

          // Generate a meaningful filename from diagram description or fallback
          const descEl = diagramWrapper.querySelector(".mermaid-diagram-desc");
          const descText = descEl?.textContent?.trim() || "diagram";
          const filename =
            descText
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")
              .slice(0, 50) || "diagram";

          const link = document.createElement("a");
          link.href = url;
          link.download = `${filename}.svg`;
          document.body.appendChild(link);
          link.click();

          // Cleanup
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        });
      });
    };

    // Render all content asynchronously
    const renderContent = async () => {
      // Wait for React to commit the DOM
      if (!ref.current) return;

      // Use requestAnimationFrame to ensure DOM is painted
      // Fallback to setTimeout for test environments (JSDOM)
      const raf =
        typeof requestAnimationFrame !== "undefined"
          ? requestAnimationFrame
          : (cb: () => void) => setTimeout(cb, 0);

      await new Promise<void>((resolve) => {
        raf(() => resolve());
      });

      if (!mounted || !ref.current) return;

      // Render Mermaid diagrams
      await renderMermaid(ref.current, slug);

      if (!mounted || !ref.current) return;

      // Render Math
      renderMath(ref.current);

      if (!mounted || !ref.current) return;

      // Setup zoom button click handlers
      setupZoomHandlers();

      if (!mounted || !ref.current) return;

      // Setup download button click handlers
      setupDownloadHandlers();
    };

    // Start rendering
    renderContent();
    return () => {
      mounted = false;
    };
  }, [html, slug]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) {
              const hash = `#${id}`;
              history.replaceState(null, "", hash);
            }
          }
        }
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    const headings = document.querySelectorAll(".doc-content h2, .doc-content h3");
    headings.forEach((h) => {
      observer.observe(h);
    });

    return () => observer.disconnect();
  }, [html]);

  return <div ref={ref} className="doc-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
