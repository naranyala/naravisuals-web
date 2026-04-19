import { useEffect, useState } from "react";
import { ASTViewer } from "../features/ast-viewer";
import { DocFooter, DocViewer } from "../features/docs";
import { MetadataPanel } from "../features/metadata";
import { Sidebar, TableOfContents } from "../features/navigation";
import { useSeo } from "../features/seo";
import { useDocsTheme } from "../features/theme";
import { allDocs, sidebarData } from "../generated";
import { useServices } from "../services";
import { useKeyboardShortcut, useTitle } from "../shared/hooks";
import "../shared/styles/index.css";
import { SettingsPanel } from "./components/SettingsPanel";
import { TopBar } from "./components/TopBar";
import { useNavigation } from "./hooks/useNavigation";
import { printAllDocs } from "./utils/print-engine";

export function MainLayout() {
  const services = useServices();
  const docsTheme = useDocsTheme();
  const { currentDoc, currentSlug, navigate, getDocsInSidebarOrder, setCurrentSlug, resolveSlug } =
    useNavigation(services);

  // ─── UI State ──────────────────────────────────────────────────────
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [tocVisible, setTocVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "raw">("view");
  const [mermaidLoading, setMermaidLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [astOpen, _setAstOpen] = useState(false);

  // ─── Responsive State ──────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(
    () => services.dom.getViewportWidth() <= services.config.mobileBreakpoint
  );
  const [isTocMobile, setIsTocMobile] = useState(
    () => services.dom.getViewportWidth() <= services.config.tocBreakpoint
  );

  // ─── Side Effects ──────────────────────────────────────────────────
  useTitle(currentDoc?.title || "", services.config.siteTitle);

  useSeo({
    title: currentDoc?.title,
    description: currentDoc?.description,
    slug: currentDoc?.slug,
    siteUrl: "https://your-docs-site.com",
    siteName: services.config.siteTitle,
    author: currentDoc?.author,
    date: currentDoc?.date,
    tags: currentDoc?.tags,
    toc: currentDoc?.toc,
  });

  useKeyboardShortcut(() => setSidebarVisible((v) => !v), { key: "b", meta: true });
  useKeyboardShortcut(
    () => {
      if (currentDoc?.toc.length) setTocVisible((v) => !v);
    },
    { key: "t", meta: true }
  );

  useEffect(() => {
    const update = () => {
      const w = services.dom.getViewportWidth();
      setIsMobile(w <= services.config.mobileBreakpoint);
      setIsTocMobile(w <= services.config.tocBreakpoint);
    };
    return services.dom.onResize(update);
  }, [services]);

  useEffect(() => {
    const unsubscribe = services.router.onPopState(() => {
      setCurrentSlug(resolveSlug());
      setSidebarVisible(false);
    });
    return unsubscribe;
  }, [services, resolveSlug, setCurrentSlug]);

  useEffect(() => {
    let rafId: number;
    const checkLoading = () => {
      setMermaidLoading((window as any).__mermaidLoading__ || false);
      rafId = requestAnimationFrame(checkLoading);
    };
    rafId = requestAnimationFrame(checkLoading);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    return services.dom.onKeydown((e) => {
      if (e.key === "Escape") {
        if (tocVisible) setTocVisible(false);
        else if (sidebarVisible) setSidebarVisible(false);
      }
    });
  }, [services, tocVisible, sidebarVisible]);

  useEffect(() => {
    services.dom.setBodyOverflow(isMobile && sidebarVisible ? "hidden" : "");
    return () => services.dom.setBodyOverflow("");
  }, [isMobile, sidebarVisible, services]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }, 100);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [currentSlug]);

  const handleNavigate = (target: string) => {
    navigate(target, isMobile, setSidebarVisible, setTocVisible);
  };

  const handlePrint = () => {
    printAllDocs(allDocs, services.config, services.dom);
  };

  if (!currentDoc) {
    return (
      <div className="site-wrapper">
        <div className="top-bar">
          <h1 className="site-title">Docs</h1>
        </div>
        <div className="empty-state">
          <p>No documentation found.</p>
        </div>
      </div>
    );
  }

  const sorted = getDocsInSidebarOrder();
  const idx = sorted.findIndex((d) => d.slug === currentSlug || d.id === currentSlug);
  const prevDoc = idx > 0 ? sorted[idx - 1] : null;
  const nextDoc = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <div className="site-wrapper">
      <TopBar
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
        mermaidLoading={mermaidLoading}
        currentDoc={currentDoc}
        onNavigate={handleNavigate}
        onPrint={handlePrint}
        onToggleSettings={() => setSettingsOpen(!settingsOpen)}
        settingsOpen={settingsOpen}
      />

      {settingsOpen && (
        <SettingsPanel
          onClose={() => setSettingsOpen(false)}
          codeTheme={docsTheme.codeTheme}
          setCodeTheme={docsTheme.setCodeTheme}
          font={docsTheme.font}
          setFont={docsTheme.setFont}
        />
      )}

      {isMobile && sidebarVisible && (
        <div className="overlay" onClick={() => setSidebarVisible(false)}>
          <div className="overlay-sidebar" onClick={(e) => e.stopPropagation()}>
            <Sidebar sidebar={sidebarData} currentSlug={currentSlug} onNavigate={handleNavigate} />
          </div>
        </div>
      )}

      <div className="doc-page-layout">
        <nav className="sidebar">
          <Sidebar sidebar={sidebarData} currentSlug={currentSlug} onNavigate={handleNavigate} />
        </nav>

        <main className="main-content">
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

          <h1 className="sr-only">{currentDoc.title}</h1>

          {isTocMobile && currentDoc.toc.length > 0 && (
            <div className="toc-mobile-collapsible">
              <button className="toc-mobile-header" onClick={() => setTocVisible(!tocVisible)}>
                <span>Table of Contents</span>
                <span className={`toc-chevron ${tocVisible ? "open" : ""}`}>▾</span>
              </button>
              {tocVisible && <TableOfContents items={currentDoc.toc} />}
            </div>
          )}

          {viewMode === "view" ? (
            <>
              <MetadataPanel metadata={currentDoc.metadata || {}} />
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
                onNavigate={handleNavigate}
              />
            </>
          ) : (
            <div className="raw-content-viewer">
              <pre className="raw-markdown">{currentDoc.rawContent}</pre>
            </div>
          )}
        </main>

        {astOpen && (
          <div className="ast-panel">
            <div className="ast-panel-header">
              <h3>AST Viewer</h3>
              <button className="ast-panel-close" onClick={() => _setAstOpen(false)}>
                ✕
              </button>
            </div>
            <ASTViewer ast={currentDoc.ast} />
          </div>
        )}

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
