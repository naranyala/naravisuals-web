import { clsx } from "clsx";
import { useUIState } from "../../core/store";
import { useServices } from "../../services";

interface BreadcrumbItem {
  label: string;
  slug?: string;
}

interface TopBarProps {
  mermaidLoading: boolean;
  onNavigate: (target: string) => void;
  breadcrumbs: BreadcrumbItem[];
}

export function TopBar({ mermaidLoading, onNavigate, breadcrumbs }: TopBarProps) {
  const { config } = useServices();
  const { isMobile, sidebarVisible, menuOpen, toggleSidebar, setMenuOpen } = useUIState();

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
          {isMobile && (
            <button
              type="button"
              className={clsx("top-bar-btn menu-btn", { active: sidebarVisible })}
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
            >
              <span className="btn-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="18"
                  height="18"
                  aria-label="Menu"
                >
                  <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          )}
          <div className="top-bar-breadcrumbs">
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
        <div className="top-bar-right">
          <button
            type="button"
            className={clsx("top-bar-btn context-menu-btn", { active: menuOpen })}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Context menu"
            title="Context Menu"
          >
            <span className="btn-icon">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18"
                aria-label="Context Menu"
              >
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </span>
            <span className="btn-text">Context Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
