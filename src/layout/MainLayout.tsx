import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";

import { match } from "ts-pattern";
import { useUIState } from "../core/store";
import { deslugify, stripTitlePrefix } from "../core/utils";
import { useMetadata } from "../features/metadata/MetadataProvider";
import { Sidebar, TableOfContents } from "../features/navigation";
import { GlobalSearch } from "../features/search/GlobalSearch";
import { useSearch } from "../features/search/SearchProvider";
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
import { MockupMenuPanel } from "./components/MockupMenuPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { ThreeColumnLayout } from "./components/ThreeColumnLayout";
import { TopBar } from "./components/TopBar";
import { useNavigation } from "./hooks/useNavigation";
import { printAllDocs } from "./utils/print-engine";

const docValidator = TypeCompiler.Compile(DocEntrySchema);

export function MainLayout() {
  const services = useServices();
  const { sidebar: sidebarService } = services;
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

  // Track sidebar navigation path for breadcrumbs
  const [sidebarPath, setSidebarPath] = useState(sidebarService.getCurrentPath());

  useEffect(() => {
    const unsubscribe = sidebarService.onPathChange((path) => {
      setSidebarPath(path);
    });
    return unsubscribe;
  }, [sidebarService]);

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
    sidebarVisible,
    isTocMobile,
    tocVisible,
    settingsOpen,
    menuOpen,
    viewMode,
    updateResponsive,
    toggleSidebar,
    toggleToc,
    setSidebar,
    setToc,
    setViewMode,
    setSettingsOpen,
    setMenuOpen,
  } = useUIState();
  const { setSearch } = useSearch();
  const { wordStatsOpen, setWordStatsOpen } = useMetadata();

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

  useEffect(() => {
    if (!isMobile) {
      setSidebar(true);
    }
  }, [isMobile, setSidebar]);

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

  useKeyboardShortcut(() => isMobile && toggleSidebar(), { key: "b", meta: true });
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

  const sorted = getDocsInSidebarOrder();
  const idx = sorted.findIndex((d) => d.slug === currentSlug || d.id === currentSlug);
  const prevDoc = idx > 0 ? sorted[idx - 1] : null;
  const nextDoc = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  const getFirstDocSlug = useCallback((item: any): string | undefined => {
    if (!item) return undefined;
    if (item.type === "doc") return item.slug || item.id;
    if (item.type === "category" && Array.isArray(item.items)) {
      for (const subItem of item.items) {
        const slug = getFirstDocSlug(subItem);
        if (slug) return slug;
      }
    }
    return undefined;
  }, []);

  const breadcrumbs = useMemo(() => {
    const root = { label: deslugify(services.config.siteTitle || "Docs"), slug: "abstract" };

    // Find the actual structural path of the current document
    const docPathResult = sidebarService.resolvePathForSlug(sidebarData, currentSlug);
    const actualDocPath = docPathResult.isOk() ? docPathResult.value : [];

    // The active path is what the user is currently seeing in the sidebar
    const activePath = sidebarPath;

    const intermediates = activePath.map((p) => ({
      label: deslugify(p.label),
      slug: p.link?.id ?? getFirstDocSlug(p) ?? "abstract",
    }));

    // We show the current document if:
    // 1. It exists.
    // 2. It is actually a descendant of the currently active sidebar path.
    const isDescendant =
      actualDocPath.length >= activePath.length &&
      actualDocPath.slice(0, activePath.length).every((p, i) => p.label === activePath[i]?.label);

    if (currentDoc && isDescendant) {
      return [root, ...intermediates, { label: deslugify(currentDoc.title), slug: currentSlug }];
    }

    return [root, ...intermediates];
  }, [
    currentSlug,
    services.config.siteTitle,
    currentDoc,
    sidebarPath,
    sidebarService,
    getFirstDocSlug,
  ]);

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

  return (
    <AppShell
      topBar={
        <TopBar
          mermaidLoading={mermaidLoading}
          onNavigate={handleNavigate}
          breadcrumbs={breadcrumbs}
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
      <MockupMenuPanel
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onPrint={async () => {
          await printAllDocs(allDocs as any, services.config, services.dom);
        }}
        onToggleSettings={() => setSettingsOpen(!settingsOpen)}
        isTopDrawer={true}
      />
      <WordStatsPanel />
      <FrontmatterGraph />
      <ThreeColumnLayout
        sidebarCollapsed={!sidebarVisible}
        sidebar={
          <Sidebar
            sidebar={sidebarData}
            currentSlug={currentSlug}
            onNavigate={handleNavigate}
            isMobile={isMobile}
            articlePosition={idx >= 0 ? { current: idx + 1, total: sorted.length } : undefined}
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
