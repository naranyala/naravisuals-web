import { clsx } from "clsx";
import type React from "react";
import { useUIState } from "../../core/store";

interface AppShellProps {
  children: React.ReactNode;
  topBar: React.ReactNode;
  search: React.ReactNode;
  settings: React.ReactNode;
  menuOpen?: boolean;
}

/**
 * AppShell
 *
 * Root structural primitive. Manages global overlays and top-level scroll.
 */
export function AppShell({ children, topBar, search, settings, menuOpen }: AppShellProps) {
  const { isMobile, sidebarVisible, setSidebar, setMenuOpen } = useUIState();

  return (
    <div className={clsx("site-wrapper", { "mobile-sidebar-open": isMobile && sidebarVisible })}>
      {topBar}
      {search}
      {settings}

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarVisible && (
        <div className="mobile-overlay" onClick={() => setSidebar(false)} />
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && menuOpen && (
        <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {children}
    </div>
  );
}
