import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { useUIState } from "../../core/store";
import { useServices } from "../../services";

interface BreadcrumbItem {
  label: string;
  slug?: string;
}

interface TopBarProps {
  mermaidLoading: boolean;
  isPrinting: boolean;
  onNavigate: (target: string) => void;
  onPrint: () => void;
  breadcrumbs: BreadcrumbItem[];
}

export function TopBar({
  mermaidLoading,
  isPrinting,
  onNavigate,
  onPrint,
  breadcrumbs,
}: TopBarProps) {
  const { config } = useServices();
  const {
    sidebarVisible,
    settingsOpen,
    searchOpen,
    wordStatsOpen,
    graphOpen,
    toggleSidebar,
    setSettingsOpen,
    setSearch,
    setWordStatsOpen,
    setGraphOpen,
  } = useUIState();

  const [breadcrumbDropdownOpen, setBreadcrumbDropdownOpen] = useState(false);

  useEffect(() => {
    if (!breadcrumbDropdownOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".top-bar-breadcrumb-dropdown") && !target.closest(".top-bar-btn")) {
        setBreadcrumbDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [breadcrumbDropdownOpen]);

  const onToggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const onToggleSidebar = () => {
    toggleSidebar();
  };

  const handleBreadcrumbClick = (e: React.MouseEvent, slug: string | undefined) => {
    e.preventDefault();
    if (!slug) return;
    if (slug === breadcrumbs[breadcrumbs.length - 1]?.slug) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onNavigate(slug);
    }
  };

  return (
    <div className="top-bar">
      <div className="top-bar-container">
        <div className="top-bar-left">
          <button
            type="button"
            className={clsx("top-bar-btn menu-btn show-on-mobile", { active: sidebarVisible })}
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <span className="btn-icon">☰</span>
          </button>
          <button
            type="button"
            className={clsx("top-bar-btn show-on-mobile", { active: breadcrumbDropdownOpen })}
            onClick={() => setBreadcrumbDropdownOpen(!breadcrumbDropdownOpen)}
            aria-label="Toggle breadcrumbs"
          >
            <span className="btn-icon">📂</span>
          </button>
          <div className={clsx("top-bar-breadcrumbs", { "hide-on-mobile": true })}>
            {breadcrumbs.map((item, idx) => (
              <div
                key={item.slug || item.label}
                className={clsx("top-bar-breadcrumb-separator", { first: idx === 0 })}
              >
                {idx !== 0 && <span>›</span>}
                <a
                  href={idx === 0 ? "/" : `/${config.routes.docs}/${item.slug}`}
                  className={clsx("top-bar-breadcrumb-item", {
                    root: idx === 0,
                    current: idx === breadcrumbs.length - 1,
                  })}
                  onClick={(e) => handleBreadcrumbClick(e, idx === 0 ? "/" : item.slug)}
                >
                  {item.label}
                </a>
              </div>
            ))}
          </div>
          {mermaidLoading && (
            <span className="mermaid-loading-indicator" title="Loading diagrams...">
              <span className="mermaid-spinner" />
            </span>
          )}
        </div>
        {breadcrumbDropdownOpen && (
          <div className="top-bar-breadcrumb-dropdown show-on-mobile">
            <div className="top-bar-breadcrumb-dropdown-content">
              {breadcrumbs.map((item, idx) => (
                <a
                  key={item.slug || item.label}
                  href={idx === 0 ? "/" : `/${config.routes.docs}/${item.slug}`}
                  className={clsx("top-bar-breadcrumb-dropdown-item", {
                    current: idx === breadcrumbs.length - 1,
                  })}
                  onClick={(e) => {
                    handleBreadcrumbClick(e, idx === 0 ? "/" : item.slug);
                    setBreadcrumbDropdownOpen(false);
                  }}
                >
                  {idx !== 0 && <span className="separator">›</span>}
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="top-bar-right">
          <button
            type="button"
            className={clsx("top-bar-btn top-bar-action-btn", { active: searchOpen })}
            onClick={() => setSearch(true)}
            aria-label="Search"
            title="Search (Cmd+K)"
          >
            <span className="btn-icon">🔍</span>
            <span className="btn-text hide-on-mobile">Search...</span>
            <span className="btn-shortcut hide-on-mobile">⌘K</span>
          </button>
          <button
            type="button"
            className={clsx("top-bar-btn top-bar-action-btn", { active: settingsOpen })}
            onClick={onToggleSettings}
            aria-label="Toggle settings"
            title="Settings"
          >
            <span className="btn-icon">🎨</span>
          </button>
          <button
            type="button"
            className={clsx("top-bar-btn top-bar-action-btn", { loading: isPrinting })}
            onClick={onPrint}
            disabled={isPrinting}
            aria-label="Print all docs"
            title="Open all docs in new tab for printing"
          >
            <span className="btn-icon">
              {isPrinting ? <span className="mermaid-spinner" /> : "🖨️"}
            </span>
          </button>
          <button
            type="button"
            className={clsx("top-bar-btn top-bar-action-btn", { active: graphOpen })}
            onClick={() => setGraphOpen(!graphOpen)}
            aria-label="Frontmatter graph"
            title="Frontmatter Network Graph Visuals"
          >
            <span className="btn-icon">🕸️</span>
          </button>
          <button
            type="button"
            className={clsx("top-bar-btn top-bar-action-btn", { active: wordStatsOpen })}
            onClick={() => setWordStatsOpen(!wordStatsOpen)}
            aria-label="Word statistics"
            title="Word Frequency Analysis"
          >
            <span className="btn-icon">📊</span>
          </button>
        </div>
      </div>
    </div>
  );
}
