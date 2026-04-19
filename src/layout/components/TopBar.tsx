import type { DocEntry } from "../../generated";

interface TopBarProps {
  sidebarVisible: boolean;
  setSidebarVisible: (v: boolean) => void;
  mermaidLoading: boolean;
  currentDoc: DocEntry;
  onNavigate: (target: string) => void;
  onPrint: () => void;
  onToggleSettings: () => void;
  settingsOpen: boolean;
}

export function TopBar({
  sidebarVisible,
  setSidebarVisible,
  mermaidLoading,
  currentDoc,
  onNavigate,
  onPrint,
  onToggleSettings,
  settingsOpen,
}: TopBarProps) {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
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
          onClick={() => onNavigate("welcome")}
          title="Go to Welcome page"
        >
          Docs
        </h1>
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
          onClick={onPrint}
          aria-label="Print all docs"
          title="Open all docs in new tab for printing"
        >
          🖨️
        </button>
        <button
          className={`top-bar-icon-btn ${settingsOpen ? "active" : ""}`}
          onClick={onToggleSettings}
          aria-label="Toggle settings"
        >
          🎨
        </button>
      </div>
    </div>
  );
}
