import { DocEntry } from "../../generated";
import { useServices } from "../../services";
import { useUIState } from "../../core/store";
import { clsx } from "clsx";

interface TopBarProps {
  mermaidLoading: boolean;
  currentDoc: DocEntry;
  onNavigate: (target: string) => void;
  onPrint: () => void;
}

export function TopBar({
  mermaidLoading,
  currentDoc,
  onNavigate,
  onPrint,
}: TopBarProps) {
  const { config } = useServices();
  const { 
    sidebarVisible, 
    settingsOpen, 
    searchOpen, 
    toggleSidebar, 
    setSettingsOpen, 
    setSearch 
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
          onClick={() => onNavigate("welcome")}
          title="Go to Welcome page"
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
          className="top-bar-btn top-bar-action-btn"
          onClick={onPrint}
          aria-label="Print all docs"
          title="Open all docs in new tab for printing"
        >
          <span className="btn-icon">🖨️</span>
        </button>
      </div>
    </div>
  );
}
