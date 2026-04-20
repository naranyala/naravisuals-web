import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { useSignals } from "@preact/signals-react/runtime";
import { ReferencePanel } from "../features/metadata";
import { Sidebar, TableOfContents } from "../features/navigation";
import { GlobalSearch } from "../features/search/GlobalSearch";
import { useSeo } from "../features/seo";
import { useDocsTheme } from "../features/theme";
import { allDocs, sidebarData } from "../generated";
import { useServices } from "../services";
import { useKeyboardShortcut, useTitle } from "../shared/hooks";
import { useUIState } from "../core/store";
import "../shared/styles/index.css";

import { AppShell } from "./components/AppShell";
import { SettingsPanel } from "./components/SettingsPanel";
import { ThreeColumnLayout } from "./components/ThreeColumnLayout";
import { TopBar } from "./components/TopBar";
import { ArticleFooter } from "../features/docs/ArticleFooter";
import { DocViewer } from "../features/docs";
import { useNavigation } from "./hooks/useNavigation";

export function MainLayout() {
  const services = useServices();
  const docsTheme = useDocsTheme();
  
  const [mermaidLoading, setMermaidLoading] = useState(false);

  useEffect(() => {
    return services.events.on("mermaid:loading", (loading) => {
      setMermaidLoading(loading);
    });
  }, [services.events]);

  // ─── Local Navigation Logic ───────────────────────────────────────
  // We use the hook to get the initial doc based on the URL
  const { currentDoc, currentSlug, navigate, getDocsInSidebarOrder, setCurrentSlug, resolveSlug } =
    useNavigation(services);

  // ─── Reactive State ───────────────────────────────────────────────
  // We consume the reactive state for UI flags
  const { 
    isMobile, 
    isTocMobile, 
    sidebarVisible, 
    tocVisible, 
    settingsOpen, 
    viewMode,
    updateResponsive,
    toggleSidebar,
    toggleToc,
    setSearch,
    setSidebar,
    setToc,
    setViewMode,
    setSettingsOpen
  } = useUIState();

  // ─── Responsive Handling ──────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      updateResponsive(
        services.dom.getViewportWidth(),
        services.config.mobileBreakpoint,
        services.config.tocBreakpoint
      );
    };
    update();
    return services.dom.onResize(update);
  }, [services, updateResponsive]);

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
    tags: currentDoc?.tags as any,
    toc: currentDoc?.toc as any,
  });

  useKeyboardShortcut(() => toggleSidebar(), { key: "b", meta: true });
  useKeyboardShortcut(() => setSearch(true), { key: "k", meta: true });

  useEffect(() => {
    const unsubscribe = services.router.onPopState(() => {
      setCurrentSlug(resolveSlug());
      setSidebar(false);
    });
    return unsubscribe;
  }, [services, resolveSlug, setCurrentSlug, setSidebar]);

  // ─── Scroll to Top on Navigation ──────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [currentSlug]);

  const handleNavigate = (target: string) => {
    navigate(target, isMobile, 
      (v) => setSidebar(v), 
      (v) => setToc(v)
    );
  };

  if (!currentDoc) {
    return (
      <div className="site-wrapper">
        <div className="top-bar">
          <h1 className="site-title">{services.config.siteTitle}</h1>
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
    <AppShell
      topBar={
        <TopBar
          mermaidLoading={mermaidLoading}
          currentDoc={currentDoc as any}
          onNavigate={handleNavigate}
          onPrint={() => {}}
        />
      }
      search={<GlobalSearch onNavigate={handleNavigate} />}
      settings={
        settingsOpen && (
          <SettingsPanel
            onClose={() => setSettingsOpen(false)}
            codeTheme={docsTheme.codeTheme}
            setCodeTheme={docsTheme.setCodeTheme as any}
            font={docsTheme.font}
            setFont={docsTheme.setFont}
          />
        )
      }
    >
      <ThreeColumnLayout
        sidebar={
          <Sidebar
            sidebar={sidebarData}
            currentSlug={currentSlug}
            onNavigate={handleNavigate}
          />
        }
        content={
          <>
            <div className="view-mode-container">
              <div className={clsx("view-mode-switcher", viewMode)}>
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
                <button
                  className="toc-mobile-header"
                  onClick={() => toggleToc()}
                >
                  <span>Table of Contents</span>
                  <span className={clsx("toc-chevron", { open: tocVisible })}>▾</span>
                </button>
                {tocVisible && <TableOfContents items={currentDoc.toc} />}
              </div>
            )}

            {viewMode === "view" ? (
              <>
                <DocViewer html={currentDoc.content} slug={currentDoc.slug} />
                <ArticleFooter
                  contentHtml={currentDoc.content}
                  onNavigate={handleNavigate}
                  prevDoc={prevDoc ? { title: prevDoc.sidebar_label || prevDoc.title, slug: prevDoc.slug } : undefined}
                  nextDoc={nextDoc ? { title: nextDoc.sidebar_label || nextDoc.title, slug: nextDoc.slug } : undefined}
                />
              </>
            ) : (
              <div className="raw-content-viewer">
                <pre className="raw-markdown">{currentDoc.rawContent}</pre>
              </div>
            )}
          </>
        }
        reference={
          <>
            <TableOfContents items={currentDoc.toc} />
            <ReferencePanel 
              metadata={currentDoc.metadata || {}} 
              markdownAst={currentDoc.ast} 
            />
          </>
        }
      />
    </AppShell>
  );
}

export default MainLayout;
