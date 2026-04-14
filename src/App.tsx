import { useEffect, useState } from "react";
import { ASTViewer } from "./ASTViewer";
import { DocFooter } from "./DocFooter";
import { DocViewer } from "./DocViewer";
import { allDocs, type DocEntry, type SidebarItem, sidebarData } from "./generated";
import { useKeyboardShortcut, useTitle } from "./hooks";
import { useDocsTheme } from "./hooks/useDocsTheme";
import { useSeo } from "./hooks/useSeo";
import { MetadataPanel } from "./MetadataPanel";
import { Sidebar } from "./Sidebar";
import { useServices } from "./services";
import { TableOfContents } from "./TableOfContents";
import "./styles/index.css";

const THEMES = [
  { id: "paperlike-white", label: "Paper White", bg: "#ffffff", accent: "#2563eb" },
  { id: "paperlike-gray", label: "Paper Gray", bg: "#e8e8e8", accent: "#5b8db8" },
  { id: "paperlike-sepia", label: "Paper Sepia", bg: "#f4ecd8", accent: "#8b6914" },
  { id: "paperlike-dark-gray", label: "Paper Dark", bg: "#2a2a2a", accent: "#7ba3cc" },
  { id: "navy", label: "Navy", bg: "#f0f4f8", accent: "#3b82f6" },
  { id: "dark-navy", label: "Dark Navy", bg: "#0f172a", accent: "#60a5fa" },
] as const;

const FONTS = [
  { id: "system", label: "System", css: "system-ui, -apple-system, sans-serif" },
  { id: "serif", label: "Serif", css: 'Georgia, "Times New Roman", serif' },
  { id: "mono", label: "Mono", css: '"SFMono-Regular", Consolas, monospace' },
  { id: "inter", label: "Inter", css: '"Inter", system-ui, sans-serif' },
  { id: "source-sans", label: "Source Sans", css: '"Source Sans 3", system-ui, sans-serif' },
] as const;

export function App() {
  const services = useServices();

  // ─── State ─────────────────────────────────────────────────────────
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [tocVisible, setTocVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => services.dom.getViewportWidth() <= services.config.mobileBreakpoint
  );
  const [isTocMobileBreakpoint, setIsTocMobileBreakpoint] = useState(
    () => services.dom.getViewportWidth() <= services.config.tocBreakpoint
  );
  const printAllDocs = () => {
    const docsHtml = allDocs
      .sort((a, b) => a.sidebar_position - b.sidebar_position)
      .map(
        (doc) => `
        <article class="doc-section">
          <div class="doc-content">${doc.content}</div>
        </article>
      `
      )
      .join("");

    const siteTitle = services.config.siteTitle;
    const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${siteTitle}</title>
  
  <style>
    @page { margin: 1.5cm; }
    @media print { 
      .print-header { display: none !important; }
      .doc-section { page-break-after: always; }
      .doc-section:last-child { page-break-after: avoid; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #1a1a1a; background: white; }
    .print-header { position: sticky; top: 0; background: #f8f9fa; padding: 1rem 2rem; border-bottom: 1px solid #ddd; display: flex; justify-content: flex-end; gap: 0.75rem; }
    .print-header button { padding: 0.6rem 1.2rem; cursor: pointer; font-size: 0.95rem; font-weight: 500; border: none; border-radius: 6px; background: #2563eb; color: white; }
    .print-header button:hover { background: #1d4ed8; }
    
    .doc-section { padding: 2rem; max-width: 100%; margin: 0 auto; }
    .doc-section h1:first-child { font-size: 1.75rem; margin-bottom: 1.5rem; color: #111; border-bottom: 2px solid #2563eb; padding-bottom: 0.5rem; }
    
    .doc-content .math-inline, .doc-content .math-display { font-family: "Times New Roman", serif; background: #f5f5f5; padding: 0.25rem 0.5rem; border-radius: 3px; font-style: italic; font-size: 1.1em; display: inline-block; visibility: visible; }
    .doc-content .math-display { display: block; text-align: center; padding: 0.75rem; margin: 0.75rem 0; }
    .doc-content .math-inline[style*="display:none"], .doc-content .math-display[style*="display:none"] { display: inline !important; visibility: visible !important; }
    
    .doc-content .mermaid-diagram { margin: 1rem 0; padding: 0.75rem; background: #fafafa; border: 1px solid #ddd; border-radius: 4px; }
    .doc-content .mermaid-diagram-header { display: none; }
    .doc-content .mermaid { display: block; font-family: monospace; font-size: 0.8rem; background: #f0f0f0; padding: 0.75rem; white-space: pre-wrap; overflow-x: auto; border-radius: 3px; color: #333; }
    .doc-content .mermaid-loading, .doc-content .mermaid-error { display: none; }
    
    .doc-content { font-size: 0.95rem; }
    .doc-content > *:first-child { margin-top: 0; }
    .doc-content p { margin: 0.75rem 0; }
    .doc-content h2 { font-size: 1.3rem; margin: 2rem 0 0.75rem; color: #1a1a1a; }
    .doc-content h3 { font-size: 1.1rem; margin: 1.5rem 0 0.5rem; color: #333; }
    
    .doc-content code { background: #f3f4f6; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; font-family: "SF Mono", Monaco, Consolas, monospace; }
    .doc-content pre { background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1rem; margin: 1rem 0; overflow-x: auto; }
    .doc-content pre code { background: none; padding: 0; display: block; font-size: 0.85rem; line-height: 1.5; }
    
    .doc-content ul, .doc-content ol { margin: 0.5rem 0 0.75rem 1.5rem; }
    .doc-content li { margin: 0.35rem 0; }
    .doc-content table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.9rem; }
    .doc-content th, .doc-content td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; }
    .doc-content th { background: #f8f9fa; font-weight: 600; }
    .doc-content tr:nth-child(even) td { background: #fafafa; }
    
    .doc-content .hash-link { display: none; }
    .doc-content .code-block { margin: 1rem 0; }
    .doc-content .code-header { display: none; }
    .doc-content .code-title { display: none; }
    .doc-content .code-copy-btn { display: none; }
    
    .doc-content .admonition { margin: 1rem 0; padding: 0.75rem 1rem; border-left: 4px solid; background: #fafafa; border-radius: 4px; }
    .doc-content .admonition-note { border-color: #3b82f6; }
    .doc-content .admonition-tip { border-color: #22c55e; }
    .doc-content .admonition-warning { border-color: #f59e0b; }
    .doc-content .admonition-danger { border-color: #ef4444; }
    .doc-content .admonition-heading { font-weight: 700; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.35rem; }
    .doc-content .admonition-content { margin-top: 0.5rem; }
    .doc-content .admonition-content p { margin: 0.35rem 0; }
    
    .doc-content .mermaid-diagram { margin: 1rem 0; padding: 0.5rem; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 4px; }
    .doc-content .mermaid-diagram-header { display: none !important; }
    .doc-content .mermaid { display: block !important; text-align: center; margin: 0.5rem 0; visibility: visible !important; }
    .doc-content .mermaid[style*="display:none"] { display: block !important; visibility: visible !important; }
    .doc-content .mermaid svg { max-width: 100%; height: auto; display: inline-block !important; }
    .doc-content .mermaid-loading, .doc-content .mermaid-error { display: none !important; }
    
    .doc-content .math-inline { background: #f3f4f6; padding: 0.15rem 0.35rem; border-radius: 3px; font-family: "Times New Roman", serif; font-style: italic; }
    .doc-content .math-display { display: block; background: #f3f4f6; padding: 0.75rem 1rem; margin: 1rem 0; border-radius: 4px; text-align: center; font-family: "Times New Roman", serif; font-style: italic; }
    
    .doc-content hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
    .doc-content blockquote { border-left: 4px solid #d1d5db; padding-left: 1rem; margin: 1rem 0; color: #4b5563; font-style: italic; }
    .doc-content img { max-width: 100%; height: auto; margin: 1rem 0; }
    .doc-content .shiki { background: #f8f9fa !important; }
  </style>
</head>
<body>
  <div class="print-header">
    <button onclick="window.print()">🖨️ Print</button>
  </div>
  ${docsHtml}
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

  const navigate = (slug: string) => {
    setCurrentSlug(slug);
    services.router.pushState({}, "", services.router.buildUrl(services.config.routes.docs, slug));
    setSidebarVisible(!isMobile);
    setTocVisible(false);
    // scrollTo is handled by the useEffect watching currentSlug
    // (scrolling here would fire before React updates the DOM)
  };

  // Scroll to top AFTER every navigation commit (DOM has updated)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
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
    items.push({ label: "Docs", href: services.router.buildUrl(services.config.routes.docs, "welcome") });

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
                {THEMES.map((t) => (
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
                {FONTS.map((f) => (
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
          {/* h1 title hidden — breadcrumbs already shows current page as title */}
          <h1 className="sr-only">{currentDoc.title}</h1>

          {/* Mobile inline TOC — collapsible section after title */}
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

          <MetadataPanel metadata={currentDoc.metadata} />
          <DocViewer html={currentDoc.content} />
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
            editUrl={`${services.config.repoEditUrl}/docs/${currentDoc.slug}.md`}
            onNavigate={navigate}
          />
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

        {/* Desktop TOC */}
        {currentDoc.toc.length > 0 && (
          <div className="toc-container">
            <TableOfContents items={currentDoc.toc} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
