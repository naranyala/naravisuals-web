import { clsx } from "clsx";
import { useMetadata } from "../../features/metadata/MetadataProvider";
import { useSearch } from "../../features/search/SearchProvider";
import { Modal } from "../../shared/components/Modal";

interface MockupMenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onToggleSettings: () => void;
  isSidebar?: boolean;
  isTopDrawer?: boolean;
}

export function MockupMenuPanel({
  isOpen,
  onClose,
  onPrint,
  onToggleSettings,
  isSidebar = false,
  isTopDrawer = false,
}: MockupMenuPanelProps) {
  const { setSearch } = useSearch();
  const { setGraphOpen, setWordStatsOpen } = useMetadata();

  const menuItems = [
    { icon: "🔍", label: "Search", onClick: () => setSearch(true) },
    { icon: "🎨", label: "Settings", onClick: onToggleSettings },
    { icon: "🖨️", label: "Print", onClick: onPrint },
    { icon: "🕸️", label: "Graph", onClick: () => setGraphOpen(true) },
    { icon: "📊", label: "Stats", onClick: () => setWordStatsOpen(true) },
    { icon: "🌙", label: "Dark Mode", onClick: onClose },
    { icon: "📂", label: "Files", onClick: onClose },
    { icon: "📝", label: "Edit", onClick: onClose },
    { icon: "🔗", label: "Copy Link", onClick: onClose },
    { icon: "🏷️", label: "Tags", onClick: onClose },
    { icon: "👁️", label: "Preview", onClick: onClose },
    { icon: "💾", label: "Save", onClick: onClose },
    { icon: "📤", label: "Export", onClick: onClose },
    { icon: "⚙️", label: "Config", onClick: onClose },
    { icon: "👤", label: "Profile", onClick: onClose },
    { icon: "❓", label: "Help", onClick: onClose },
    { icon: "🏠", label: "Home", onClick: onClose },
    { icon: "📚", label: "Docs", onClick: onClose },
  ];

  if (isTopDrawer) {
    return (
      <div className={clsx("top-push-drawer-container", { open: isOpen })}>
        <div className="top-push-drawer">
          <div className="mockup-menu-grid top-drawer-grid">
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="mockup-menu-item"
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
              >
                <span className="menu-item-icon">{item.icon}</span>
                <span className="menu-item-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isSidebar) {
    return (
      <div className="context-menu-sidebar">
        <div className="context-menu-sidebar-header">
          <span className="context-menu-sidebar-title">Context Menu</span>
          <button type="button" className="context-menu-sidebar-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="mockup-menu-grid">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="mockup-menu-item"
              onClick={() => {
                item.onClick();
                onClose();
              }}
            >
              <span className="menu-item-icon">{item.icon}</span>
              <span className="menu-item-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Context Menu" className="context-menu-modal">
      <div className="mockup-menu-grid">
        {menuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className="mockup-menu-item"
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            <span className="menu-item-icon">{item.icon}</span>
            <span className="menu-item-label">{item.label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
