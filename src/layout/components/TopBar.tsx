import { clsx } from "clsx";
import { useUIState } from "../../core/store";
import { useServices } from "../../services";

interface TopBarProps {
  mermaidLoading: boolean;
  isPrinting: boolean;
  onNavigate: (target: string) => void;
  onPrint: () => void;
}

export function TopBar({ mermaidLoading, isPrinting, onNavigate, onPrint }: TopBarProps) {
  const { config } = useServices();
  const {
    sidebarVisible,
    settingsOpen,
    searchOpen,
    wordStatsOpen,
    toggleSidebar,
    setSettingsOpen,
    setSearch,
    setWordStatsOpen,
  } = useUIState();

  const onToggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const onToggleSidebar = () => {
    toggleSidebar();
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <button
          className={clsx("top-bar-btn menu-btn show-on-mobile", { active: sidebarVisible })}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="btn-icon">☰</span>
        </button>
        <h1
          className="site-title"
          style={{ cursor: "pointer" }}
          onClick={() => onNavigate("abstract")}
          title="Go to Abstract page"
        >
          {config.siteTitle}
        </h1>
        {mermaidLoading && (
          <span className="mermaid-loading-indicator" title="Loading diagrams...">
            <span className="mermaid-spinner" />
          </span>
        )}
      </div>
      <div className="top-bar-right">
        <button
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
          className={clsx("top-bar-btn top-bar-action-btn", { active: settingsOpen })}
          onClick={onToggleSettings}
          aria-label="Toggle settings"
          title="Settings"
        >
          <span className="btn-icon">🎨</span>
        </button>
        <button
          className={clsx("top-bar-btn top-bar-action-btn print-btn", { loading: isPrinting })}
          onClick={onPrint}
          disabled={isPrinting}
          aria-label="Print all docs"
          title="Open all docs in new tab for printing"
        >
          <span className="btn-icon">{isPrinting ? <span className="mermaid-spinner" /> : "🖨️"}</span>
        </button>
        <button
          className={clsx("top-bar-btn top-bar-action-btn", { active: wordStatsOpen })}
          onClick={() => setWordStatsOpen(!wordStatsOpen)}
          aria-label="Word statistics"
          title="Word Frequency Analysis"
        >
          <span className="btn-icon">📊</span>
        </button>
      </div>
    </div>
  );
}
