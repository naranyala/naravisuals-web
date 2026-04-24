import { clsx } from "clsx";
import { useCallback, useEffect, useState } from "react";
import { match } from "ts-pattern";
import { useUIState } from "../core/store";
import { stripTitlePrefix } from "../core/utils";
import { Sidebar, TableOfContents } from "../features/navigation";
import { GlobalSearch } from "../features/search/GlobalSearch";
import { useSeo } from "../features/seo";
import { useDocsTheme } from "../features/theme";
import { allDocs, sidebarData } from "../generated";
import { useServices } from "../services";
import { useKeyboardShortcut, useTitle } from "../shared/hooks";
import "../shared/styles/index.css";

import { TypeCompiler } from "@sinclair/typebox/compiler";
import { ASTViewer } from "../features/ast-viewer/ASTViewer";
import { DocViewer } from "../features/docs";
import { ArticleFooter } from "../features/docs/ArticleFooter";
import { FrontmatterGraph, WordStatsPanel } from "../features/metadata";
import { DocEntrySchema } from "../shared/schemas";
import { AppShell } from "./components/AppShell";
import { SettingsPanel } from "./components/SettingsPanel";
import { ThreeColumnLayout } from "./components/ThreeColumnLayout";
import { TopBar } from "./components/TopBar";
import { useNavigation } from "./hooks/useNavigation";
import { printAllDocs } from "./utils/print-engine";

const docValidator = TypeCompiler.Compile(DocEntrySchema);

export function MainLayout() {
  const services = useServices();
  const docsTheme = useDocsTheme();

  const [mermaidLoading, setMermaidLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    return services.events.on("mermaid:loading", (loading) => {
      setMermaidLoading(loading);
    });
  }, [services.events]);

  // ─── Local Navigation Logic ───────────────────────────────────────
  // We use the hook to get the initial doc based on the URL
  const { currentDoc, currentSlug, navigate, getDocsInSidebarOrder, setCurrentSlug, resolveSlug } =
    useNavigation(services);

  // Runtime validation of current document
  useEffect(() => {
    if (currentDoc) {
      const doc = currentDoc as any;
      if (!docValidator.Check(doc)) {
        const errors = [...docValidator.Errors(doc)];
        console.warn(`Document validation failed for ${doc.slug}:`, errors);
      }
    }
  }, [currentDoc]);

  // ─── Reactive State ───────────────────────────────────────────────
  // We consume the reactive state for UI flags
  const {
    isMobile,
    isTocMobile,
    tocVisible,
    settingsOpen,
    wordStatsOpen,
    viewMode,
    updateResponsive,
    toggleSidebar,
    toggleToc,
    setSearch,
    setWordStatsOpen,
    setSidebar,
    setToc,
    setViewMode,
    setSettingsOpen,
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
  useKeyboardShortcut(() => setWordStatsOpen(!wordStatsOpen), { key: "g", meta: true });

  useEffect(() => {
    const unsubscribe = services.router.onPopState(() => {
      setCurrentSlug(resolveSlug());
      setSidebar(false);
    });
    return unsubscribe;
  }, [services, resolveSlug, setCurrentSlug, setSidebar]);

  // ─── Scroll to Top on Navigation ──────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to force scroll to top on every slug change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [currentDoc?.slug]);

  const handleNavigate = useCallback(
    (target: string) => {
      navigate(
        target,
        isMobile,
        (v) => setSidebar(v),
        (v) => setToc(v)
      );
    },
    [navigate, isMobile, setSidebar, setToc]
  );

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printAllDocs(allDocs as any, services.config, services.dom);
    } finally {
      setIsPrinting(false);
    }
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
          isPrinting={isPrinting}
          onNavigate={handleNavigate}
          onPrint={handlePrint}
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
            codeFontSize={docsTheme.codeFontSize}
            setCodeFontSize={docsTheme.setCodeFontSize}
          />
        )
      }
    >
      <WordStatsPanel />
      <FrontmatterGraph />
      <ThreeColumnLayout
        sidebar={
          <Sidebar 
          sidebar={sidebarData} 
          currentSlug={currentSlug} 
          onNavigate={handleNavigate} 
          isMobile={isMobile} 
        />
        }
        content={
          <>
            <div className="view-mode-container">
              <div className={clsx("view-mode-switcher", viewMode)}>
                <div className="view-mode-slider" />
                <button type="button" className="view-mode-btn" onClick={() => setViewMode("view")}>
                  View
                </button>
                <button type="button" className="view-mode-btn" onClick={() => setViewMode("ast")}>
                  AST
                </button>
                <button type="button" className="view-mode-btn" onClick={() => setViewMode("raw")}>
                  Raw
                </button>
              </div>
            </div>

            <h1 className="sr-only">{currentDoc.title}</h1>

            {isTocMobile && currentDoc.toc.length > 0 && (
              <div className="toc-mobile-collapsible">
                <button type="button" className="toc-mobile-header" onClick={() => toggleToc()}>
                  <span>Table of Contents</span>
                  <span className={clsx("toc-chevron", { open: tocVisible })}>▾</span>
                </button>
                {tocVisible && <TableOfContents items={currentDoc.toc} />}
              </div>
            )}

            {match(viewMode)
              .with("view", () => (
                <>
                  <DocViewer html={currentDoc.content} slug={currentDoc.slug} />
                  <ArticleFooter
                    contentHtml={currentDoc.content}
                    markdownAst={currentDoc.ast}
                    onNavigate={handleNavigate}
                    prevDoc={
                      prevDoc
                        ? {
                            title: stripTitlePrefix(prevDoc.sidebar_label || prevDoc.title),
                            slug: prevDoc.slug,
                          }
                        : undefined
                    }
                    nextDoc={
                      nextDoc
                        ? {
                            title: stripTitlePrefix(nextDoc.sidebar_label || nextDoc.title),
                            slug: nextDoc.slug,
                          }
                        : undefined
                    }
                  />
                </>
              ))
              .with("ast", () => (
                <div className="ast-content-viewer">
                  <ASTViewer ast={currentDoc.ast as any} />
                </div>
              ))
              .with("raw", () => (
                <div className="raw-content-viewer">
                  <pre className="raw-markdown">{currentDoc.rawContent}</pre>
                </div>
              ))
              .exhaustive()}
          </>
        }
        reference={<TableOfContents items={currentDoc.toc} />}
      />
    </AppShell>
  );
}

export default MainLayout;
