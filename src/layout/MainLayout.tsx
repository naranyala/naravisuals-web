import { useEffect, useState } from "react";
import { AVAILABLE_FONTS, AVAILABLE_THEMES } from "../core/constants";
import { ASTViewer } from "../features/ast-viewer";
import { DocFooter, DocViewer } from "../features/docs";
import { ArticleRefsPanel, MetadataPanel } from "../features/metadata";
import { Sidebar, TableOfContents } from "../features/navigation";
import { useSeo } from "../features/seo";
import { useDocsTheme } from "../features/theme";
import { allDocs, type DocEntry, type SidebarItem, sidebarData } from "../generated";
import { useServices } from "../services";
import { useKeyboardShortcut, useTitle } from "../shared/hooks";
import "../shared/styles/index.css";

export function MainLayout() {
  const services = useServices();

  // ─── State ─────────────────────────────────────────────────────────
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [tocVisible, setTocVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "raw">("view");
  const [mermaidLoading, setMermaidLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => services.dom.getViewportWidth() <= services.config.mobileBreakpoint
  );

  const [isTocMobileBreakpoint, setIsTocMobileBreakpoint] = useState(
    () => services.dom.getViewportWidth() <= services.config.tocBreakpoint
  );

  const printAllDocs = async () => {
    // First, render all mermaid diagrams in the current view
    const mermaidDiagrams = document.querySelectorAll(".mermaid-diagram[data-processed='false']");
    if (mermaidDiagrams.length > 0) {
      mermaidDiagrams.forEach((d) => {
        d.dataset.processed = "false";
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
      for (const wrapper of allMermaidBlocks) {
        const mermaidEl = wrapper.querySelector<HTMLElement>(".mermaid");
        if (!mermaidEl || wrapper.dataset.processed === "true") continue;

        const diagramSource = mermaidEl.textContent?.trim();
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

            // Force dark text and shapes for print readability
            svgEl.querySelectorAll("text").forEach((textEl) => {
              textEl.style.fill = "#1a1a1a";
              textEl.style.color = "#1a1a1a";
            });
            svgEl.querySelectorAll("path, line").forEach((shapeEl) => {
              const stroke = shapeEl.getAttribute("stroke");
              if (!stroke || stroke === "none" || stroke === "transparent") {
                shapeEl.style.stroke = "#374151";
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
                shapeEl.style.fill = "#ffffff";
              }
              shapeEl.style.stroke = "#6b7280";
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

    // Clone the rendered DOM content from DocViewer to capture rendered mermaid SVGs
    // We need to get the current doc's rendered content with mermaid SVGs
    const docContentEl = document.querySelector(".doc-content");
    let renderedContent = "";

    if (docContentEl) {
      // Clone to avoid modifying the original
      const clone = docContentEl.cloneNode(true) as HTMLElement;

      // Clean up interactive elements
      clone
        .querySelectorAll(".code-copy-btn, .mermaid-zoom-btn, .mermaid-download-btn")
        .forEach((el) => {
          el.remove();
        });
      clone.querySelectorAll(".code-header").forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });

      // Wrap in article structure
      renderedContent = `
        <article class="doc-section">
          <div class="doc-content">${clone.innerHTML}</div>
        </article>
      `;
    } else {
      // Fallback to raw content if DOM not available
      renderedContent = allDocs
        .sort((a, b) => a.sidebar_position - b.sidebar_position)
        .map(
          (doc) => `
          <article class="doc-section">
            <div class="doc-content">${doc.content}</div>
          </article>
        `
        )
        .join("");
    }

    const siteTitle = services.config.siteTitle;
    const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${siteTitle}</title>

  <style>
    /* ============================================
       PAPER-LIKE WHITE THEME FOR PRINT
       ============================================ */
    
    @page { 
      margin: 2cm 1.8cm; 
      size: A4;
    }
    
    @media print {
      .print-header { display: none !important; }
      .doc-section { page-break-after: always; }
      .doc-section:last-child { page-break-after: avoid; }
      .doc-section h1:first-child { page-break-before: auto; }
      .doc-section:first-child h1:first-child { page-break-before: avoid; }
      
      /* Avoid page breaks inside important elements */
      .code-block, .admonition, .mermaid-diagram, table, img {
        page-break-inside: avoid;
      }
      
      h1, h2, h3 { page-break-after: avoid; }
    }
    
    /* Reset and base styles */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body { 
      font-family: "Georgia", "Times New Roman", "Palatino Linotype", serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    /* Print header with action buttons */
    .print-header { 
      position: sticky; 
      top: 0; 
      background: white;
      padding: 0.8rem 1.5rem; 
      border-bottom: 2px solid #e5e7eb; 
      display: flex; 
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    
    .print-header-title {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    
    .print-header button { 
      padding: 0.5rem 1rem; 
      cursor: pointer; 
      font-size: 0.9rem; 
      font-weight: 500; 
      border: 1px solid #d1d5db;
      border-radius: 6px; 
      background: white;
      color: #374151;
      transition: all 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    
    .print-header button:hover { 
      background: #f9fafb;
      border-color: #9ca3af;
    }
    
    /* Document sections */
    .doc-section { 
      padding: 1.5rem 0; 
      max-width: 100%; 
      margin: 0 auto;
    }
    
    .doc-section h1:first-child { 
      font-size: 2rem; 
      margin-bottom: 1.5rem; 
      color: #111; 
      border-bottom: 2px solid #374151; 
      padding-bottom: 0.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    /* Typography */
    .doc-content { 
      font-size: 11pt;
      color: #1a1a1a;
    }
    
    .doc-content > *:first-child { margin-top: 0; }
    .doc-content p { margin: 1rem 0; text-align: justify; }
    
    .doc-content h2 { 
      font-size: 1.5rem; 
      margin: 2.5rem 0 1rem; 
      color: #111;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    
    .doc-content h3 { 
      font-size: 1.25rem; 
      margin: 2rem 0 0.75rem; 
      color: #374151;
      font-weight: 600;
    }
    
    .doc-content h4 {
      font-size: 1.1rem;
      margin: 1.5rem 0 0.5rem;
      color: #4b5563;
      font-weight: 600;
    }

    /* Links */
    .doc-content a {
      color: #2563eb;
      text-decoration: none;
      border-bottom: 1px solid #bfdbfe;
    }
    
    .doc-content a:hover {
      border-bottom-color: #2563eb;
    }
    
    .doc-content a[href^="http"]::after {
      content: " ↗";
      font-size: 0.75em;
      color: #6b7280;
    }

    /* Code - Paper-like light background */
    .doc-content code { 
      background: #f8f9fa; 
      padding: 0.15rem 0.4rem; 
      border-radius: 4px; 
      font-size: 0.9em; 
      font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
      color: #d63384;
      border: 1px solid #e9ecef;
    }
    
    .doc-content pre { 
      background: #fafafa; 
      border: 1px solid #e5e7eb; 
      border-left: 3px solid #3b82f6;
      border-radius: 6px; 
      padding: 1rem 1.25rem; 
      margin: 1.25rem 0; 
      overflow-x: auto;
      font-size: 9.5pt;
      line-height: 1.6;
    }
    
    .doc-content pre code { 
      background: none; 
      padding: 0; 
      display: block; 
      font-size: 9.5pt; 
      line-height: 1.6;
      border: none;
      color: #1a1a1a;
    }
    
    .doc-content .code-block { 
      margin: 1.25rem 0; 
    }
    
    .doc-content .code-header { 
      display: none; 
    }
    
    .doc-content .code-title { 
      display: none; 
    }
    
    .doc-content .code-copy-btn { 
      display: none; 
    }

    /* Lists */
    .doc-content ul, .doc-content ol { 
      margin: 0.75rem 0 1rem 1.75rem; 
    }
    
    .doc-content li { 
      margin: 0.4rem 0; 
      line-height: 1.7;
    }
    
    .doc-content li > ul,
    .doc-content li > ol {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }

    /* Tables - Clean paper style */
    .doc-content table { 
      border-collapse: collapse; 
      width: 100%; 
      margin: 1.25rem 0; 
      font-size: 10pt;
      border-top: 2px solid #374151;
      border-bottom: 2px solid #374151;
    }
    
    .doc-content th { 
      background: #f3f4f6; 
      font-weight: 600;
      padding: 0.6rem 0.75rem;
      text-align: left;
      border-bottom: 1px solid #d1d5db;
    }
    
    .doc-content td { 
      padding: 0.5rem 0.75rem; 
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .doc-content tr:last-child td {
      border-bottom: none;
    }

    /* Horizontal rules */
    .doc-content hr { 
      border: none; 
      border-top: 1px solid #d1d5db; 
      margin: 2rem 0; 
    }

    /* Blockquotes */
    .doc-content blockquote { 
      border-left: 4px solid #9ca3af; 
      padding-left: 1.25rem; 
      margin: 1.25rem 0; 
      color: #4b5563; 
      font-style: italic;
      background: #fafafa;
      padding: 0.75rem 1rem 0.75rem 1.25rem;
      border-radius: 0 4px 4px 0;
    }

    /* Images */
    .doc-content img { 
      max-width: 100%; 
      height: auto; 
      margin: 1.5rem 0;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
    }

    /* Math - Clean paper style */
    .doc-content .math-inline, 
    .doc-content .math-display { 
      font-family: "Times New Roman", "Georgia", serif; 
      background: #f8f9fa; 
      padding: 0.2rem 0.4rem; 
      border-radius: 3px; 
      font-style: italic; 
      font-size: 1.05em; 
      display: inline-block; 
      visibility: visible;
      border: 1px solid #e9ecef;
    }
    
    .doc-content .math-display { 
      display: block; 
      text-align: center; 
      padding: 1rem; 
      margin: 1rem 0;
      border: none;
      background: transparent;
    }
    
    .doc-content .math-inline[style*="display:none"], 
    .doc-content .math-display[style*="display:none"] { 
      display: inline !important; 
      visibility: visible !important; 
    }

    /* Admonitions - Paper-friendly borders */
    .doc-content .admonition { 
      margin: 1.25rem 0; 
      padding: 0.875rem 1rem; 
      border-left: 4px solid; 
      background: #fafafa; 
      border-radius: 4px;
      border-top: 1px solid #e5e7eb;
      border-right: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .doc-content .admonition-note { 
      border-left-color: #3b82f6; 
    }
    
    .doc-content .admonition-tip { 
      border-left-color: #10b981; 
    }
    
    .doc-content .admonition-warning { 
      border-left-color: #f59e0b;
      background: #fffbeb;
    }
    
    .doc-content .admonition-danger { 
      border-left-color: #ef4444;
      background: #fef2f2;
    }
    
    .doc-content .admonition-heading { 
      font-weight: 700; 
      margin-bottom: 0.35rem; 
      display: flex; 
      align-items: center; 
      gap: 0.35rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 0.95rem;
    }
    
    .doc-content .admonition-content { 
      margin-top: 0.5rem; 
    }
    
    .doc-content .admonition-content p { 
      margin: 0.5rem 0; 
    }

    /* Mermaid diagrams - Paper-like */
    .doc-content .mermaid-diagram { 
      margin: 1.5rem 0; 
      padding: 1rem; 
      background: white; 
      border: 1px solid #e5e7eb; 
      border-radius: 6px;
      text-align: center;
    }
    
    .doc-content .mermaid-diagram-header { 
      display: none !important; 
    }
    
    .doc-content .mermaid { 
      display: block !important; 
      text-align: center; 
      margin: 0.5rem 0; 
      visibility: visible !important;
      background: white;
    }
    
    .doc-content .mermaid[style*="display:none"] { 
      display: block !important; 
      visibility: visible !important; 
    }
    
    .doc-content .mermaid svg { 
      max-width: 100%; 
      height: auto; 
      display: inline-block !important;
      background: white;
    }
    
    /* Force dark text on mermaid SVGs for print readability */
    .doc-content .mermaid svg text { 
      fill: #1a1a1a !important; 
      color: #1a1a1a !important; 
    }
    
    .doc-content .mermaid svg path, 
    .doc-content .mermaid svg line, 
    .doc-content .mermaid svg rect, 
    .doc-content .mermaid svg circle {
      stroke: #374151 !important;
    }
    
    .doc-content .mermaid svg .edgePath path { 
      stroke: #374151 !important; 
      stroke-width: 1.5px !important; 
    }
    
    .doc-content .mermaid svg .nodeRect { 
      fill: white !important; 
      stroke: #6b7280 !important; 
    }
    
    .doc-content .mermaid svg .label { 
      fill: #1a1a1a !important; 
    }
    
    .doc-content .mermaid-loading, 
    .doc-content .mermaid-error { 
      display: none !important; 
    }

    /* Hide interactive elements */
    .doc-content .hash-link { 
      display: none; 
    }
    
    /* Shiki code theme - Light paper style */
    .doc-content .shiki { 
      background: #fafafa !important;
      border: 1px solid #e5e7eb;
    }

    /* Doc stats footer - Hide in print */
    .doc-stats-footer {
      display: none !important;
    }
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
  };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [astOpen, setAstOpen] = useState(false);

  // Unified theme hook (UI theme + code theme + font)
  const docsTheme = useDocsTheme();

  // ─── Hooks ─────────────────────────────────────────────────────────
  // Use the docs theme for everything (not dark/light)
  const isDark = docsTheme.codeTheme.includes("dark") || docsTheme.codeTheme === "dracula";

  // Resolve slug from URL
  const resolveSlug = (): string => {
    const path = services.router.getCurrentPath();
    if (path === "/" || path === "") return "welcome";
    if (path === `/${services.config.routes.docs}` || path === `/${services.config.routes.docs}/`) {
      return "welcome";
    }
    if (path.startsWith(`/${services.config.routes.docs}/`)) {
      return path.replace(`/${services.config.routes.docs}/`, "");
    }
    return allDocs[0]?.slug || "welcome";
  };

  const [currentSlug, setCurrentSlug] = useState(resolveSlug);
  const currentDoc = allDocs.find((d) => d.slug === currentSlug || d.id === currentSlug) ?? null;

  // ─── Custom hooks after state ──────────────────────────────────────
  // Document title
  useTitle(currentDoc?.title || "", services.config.siteTitle);

  // SEO: Update meta tags, structured data, canonical URLs dynamically
  useSeo({
    title: currentDoc?.title,
    description: currentDoc?.description,
    slug: currentDoc?.slug,
    siteUrl: "https://your-docs-site.com", // Replace with your actual domain
    siteName: services.config.siteTitle,
    author: currentDoc?.author,
    date: currentDoc?.date,
    tags: currentDoc?.tags,
    toc: currentDoc?.toc,
  });

  // Keyboard shortcuts
  useKeyboardShortcut(() => setSidebarVisible((v) => !v), { key: "b", meta: true });
  useKeyboardShortcut(
    () => {
      if (currentDoc?.toc.length) setTocVisible((v) => !v);
    },
    { key: "t", meta: true }
  );

  // Track viewport size reactively
  useEffect(() => {
    const update = () => {
      const w = services.dom.getViewportWidth();
      setIsMobile(w <= services.config.mobileBreakpoint);
      setIsTocMobileBreakpoint(w <= services.config.tocBreakpoint);
    };
    const unsub = services.dom.onResize(update);
    update();
    return unsub;
  }, [services]);

  // Handle browser back/forward
  useEffect(() => {
    const unsubscribe = services.router.onPopState(() => {
      setCurrentSlug(resolveSlug());
      setSidebarVisible(false);
    });
    return unsubscribe;
  }, [services]);

  // Poll for mermaid loading state
  useEffect(() => {
    let rafId: number;
    const checkLoading = () => {
      setMermaidLoading(window.__mermaidLoading__ || false);
      rafId = requestAnimationFrame(checkLoading);
    };
    rafId = requestAnimationFrame(checkLoading);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Close sidebar/TOC on Escape
  useEffect(() => {
    const unsubscribe = services.dom.onKeydown((e) => {
      if (e.key === "Escape") {
        if (tocVisible) {
          setTocVisible(false);
        } else if (sidebarVisible) {
          setSidebarVisible(false);
        }
      }
    });
    return unsubscribe;
  }, [services, tocVisible, sidebarVisible]);

  // Lock body scroll when mobile sidebar overlay is open
  useEffect(() => {
    const isOverlayOpen = isMobile && sidebarVisible;
    services.dom.setBodyOverflow(isOverlayOpen ? "hidden" : "");
    return () => {
      services.dom.setBodyOverflow("");
    };
  }, [isMobile, sidebarVisible, services]);

  const sidebar: SidebarItem[] = sidebarData;

  const navigate = (target: string) => {
    const [slug, hash] = target.split("#");
    setCurrentSlug(slug);
    services.router.pushState(
      {},
      "",
      services.router.buildUrl(services.config.routes.docs, target)
    );
    setSidebarVisible(!isMobile);
    setTocVisible(false);
  };

  // Scroll to top or to anchor AFTER every navigation commit (DOM has updated)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Delay slightly to allow React to render the content
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [currentSlug]);

  // Default to welcome page if on root or no current slug
  useEffect(() => {
    if (!currentSlug) {
      const welcomeDoc = allDocs.find((d) => d.slug === "welcome");
      if (welcomeDoc) {
        navigate(welcomeDoc.slug);
      } else if (allDocs.length > 0) {
        navigate(allDocs[0].slug);
      }
    }
  }, []);

  // Breadcrumbs
  const _breadcrumbs = (): { label: string; href?: string }[] => {
    if (!currentDoc) return [];
    const items: { label: string; href?: string }[] = [];

    // Add "Docs" link that goes to welcome page
    items.push({
      label: "Docs",
      href: services.router.buildUrl(services.config.routes.docs, "welcome"),
    });

    if (currentDoc.slug !== "welcome") {
      const parts = currentDoc.slug.split("/");
      if (parts.length > 1) {
        const category = parts[0]
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        items.push({ label: category });
      }
      items.push({ label: currentDoc.sidebar_label || currentDoc.title });
    } else {
      items.push({ label: "Welcome" });
    }
    return items;
  };

  // Build ordered list of docs following the exact sidebar structure
  const getDocsInSidebarOrder = (): DocEntry[] => {
    const ordered: DocEntry[] = [];
    for (const item of sidebar) {
      if (item.type === "doc") {
        const doc = allDocs.find((d) => d.slug === item.slug || d.id === item.id);
        if (doc) ordered.push(doc);
      } else if (item.type === "category") {
        // Add category link doc first if it exists
        if (item.link) {
          const linkDoc = allDocs.find((d) => d.slug === item.link?.id || d.id === item.link?.id);
          if (linkDoc && !ordered.find((d) => d.slug === linkDoc.slug)) {
            ordered.push(linkDoc);
          }
        }
        for (const child of item.items) {
          if (child.type === "doc") {
            const doc = allDocs.find((d) => d.slug === child.slug || d.id === child.id);
            if (doc && !ordered.find((d) => d.slug === doc.slug)) {
              ordered.push(doc);
            }
          }
        }
      }
    }
    return ordered;
  };

  const sorted = getDocsInSidebarOrder();
  const idx = sorted.findIndex((d) => d.slug === currentSlug || d.id === currentSlug);
  const prevDoc = idx > 0 ? sorted[idx - 1] : null;
  const nextDoc = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  if (!currentDoc) {
    return (
      <div className="site-wrapper">
        <div className="top-bar">
          <h1 className="site-title">Docs</h1>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
        <div className="empty-state">
          <p>No documentation found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="site-wrapper">
      {/* Top bar: hamburger (mobile only) + title + font switcher + theme toggle */}
      <div className="top-bar">
        <div className="top-bar-left">
          {/* Hamburger — only visible on mobile */}
          <button
            className="menu-btn show-on-mobile"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            aria-label="Toggle sidebar"
          >
            <span className="menu-btn-icon">☰</span>
          </button>
          <h1
            className="site-title"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("welcome")}
            title="Go to Welcome page"
          >
            Docs
          </h1>
          {/* Mermaid loading indicator */}
          {mermaidLoading && (
            <span className="mermaid-loading-indicator" title="Loading diagrams...">
              <span className="mermaid-spinner" />
            </span>
          )}
          <span className="top-bar-sep">/</span>
          <span className="top-bar-current">{currentDoc.sidebar_label || currentDoc.title}</span>
        </div>
        <div className="top-bar-right">
          <button
            className="top-bar-icon-btn"
            onClick={printAllDocs}
            aria-label="Print all docs"
            title="Open all docs in new tab for printing"
          >
            🖨️
          </button>
          {/* AST viewer toggle */}
          <button
            className={`top-bar-icon-btn ${astOpen ? "active" : ""}`}
            onClick={() => setAstOpen(!astOpen)}
            aria-label="Toggle AST viewer"
          >
            🌳
          </button>
          {/* Settings toggle */}
          <button
            className={`top-bar-icon-btn ${settingsOpen ? "active" : ""}`}
            onClick={() => setSettingsOpen(!settingsOpen)}
            aria-label="Toggle settings"
          >
            🎨
          </button>
        </div>
      </div>

      {/* Settings panel overlay */}
      {settingsOpen && (
        <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h3>Settings</h3>
              <button className="settings-close-btn" onClick={() => setSettingsOpen(false)}>
                ✕
              </button>
            </div>

            {/* Theme */}
            <div className="settings-section">
              <div className="settings-label">Theme</div>
              <div className="theme-grid">
                {AVAILABLE_THEMES.map((t) => (
                  <button
                    key={t.id}
                    className={`theme-chip ${docsTheme.codeTheme === t.id ? "active" : ""}`}
                    onClick={() => docsTheme.setCodeTheme(t.id)}
                  >
                    <span className="theme-chip-preview" data-theme={t.id}>
                      <span className="theme-chip-colors">
                        <span className="chip-bg" style={{ background: t.bg }} />
                        <span className="chip-accent" style={{ background: t.accent }} />
                      </span>
                    </span>
                    <span className="theme-chip-label">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div className="settings-section">
              <div className="settings-label">Font</div>
              <div className="font-grid">
                {AVAILABLE_FONTS.map((f) => (
                  <button
                    key={f.id}
                    className={`font-chip ${docsTheme.font === f.id ? "active" : ""}`}
                    onClick={() => docsTheme.setFont(f.id)}
                    style={{ fontFamily: f.css }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile overlay for sidebar */}
      {isMobile && sidebarVisible && (
        <div className="overlay" onClick={() => setSidebarVisible(false)}>
          <div className="overlay-sidebar" onClick={(e) => e.stopPropagation()}>
            <Sidebar sidebar={sidebar} currentSlug={currentSlug} onNavigate={navigate} />
          </div>
        </div>
      )}

      <div className="doc-page-layout">
        {/* Desktop sidebar — hidden on mobile via CSS */}
        <nav className="sidebar">
          <Sidebar sidebar={sidebar} currentSlug={currentSlug} onNavigate={navigate} />
        </nav>

        {/* Main content */}
        <main className="main-content">
          {/* View Mode Switcher */}
          <div className="view-mode-container">
            <div className={`view-mode-switcher ${viewMode}`}>
              <div className="view-mode-slider" />
              <button className="view-mode-btn" onClick={() => setViewMode("view")}>
                View
              </button>
              <button className="view-mode-btn" onClick={() => setViewMode("raw")}>
                Raw
              </button>
            </div>
          </div>

          {/* h1 title hidden — breadcrumbs already shows current page as title */}
          <h1 className="sr-only">{currentDoc.title}</h1>

          {/* Mobile inline TOC — collapsible section (mobile only) */}
          {isTocMobileBreakpoint && currentDoc.toc.length > 0 && (
            <div className="toc-mobile-collapsible">
              <button
                className="toc-mobile-header"
                onClick={() => setTocVisible(!tocVisible)}
                aria-expanded={tocVisible}
              >
                <span>Table of Contents</span>
                <span className={`toc-chevron ${tocVisible ? "open" : ""}`}>▾</span>
              </button>
              {tocVisible && <TableOfContents items={currentDoc.toc} />}
            </div>
          )}

          {viewMode === "view" ? (
            <>
              <MetadataPanel metadata={currentDoc.metadata} />
              <DocViewer html={currentDoc.content} slug={currentDoc.slug} />
              <DocFooter
                prevDoc={
                  prevDoc
                    ? { title: prevDoc.sidebar_label || prevDoc.title, slug: prevDoc.slug }
                    : undefined
                }
                nextDoc={
                  nextDoc
                    ? { title: nextDoc.sidebar_label || nextDoc.title, slug: nextDoc.slug }
                    : undefined
                }
                onNavigate={navigate}
              />
            </>
          ) : (
            <div className="raw-content-viewer">
              <pre className="raw-markdown">{currentDoc.rawContent}</pre>
            </div>
          )}
          {/* ArticleRefsPanel disabled as requested */}
          {/* <ArticleRefsPanel contentHtml={currentDoc.content} markdownAst={currentDoc.ast} /> */}
        </main>

        {/* AST Viewer Panel */}
        {astOpen && (
          <div className="ast-panel">
            <div className="ast-panel-header">
              <h3>AST Viewer</h3>
              <button className="ast-panel-close" onClick={() => setAstOpen(false)}>
                ✕
              </button>
            </div>
            <ASTViewer ast={currentDoc.ast} />
          </div>
        )}

        {/* Right-side panel (TOC) — visible on desktop/large screens */}
        {currentDoc.toc.length > 0 && (
          <div className="toc-container">
            <TableOfContents items={currentDoc.toc} />
          </div>
        )}
      </div>
    </div>
  );
}

export default MainLayout;
