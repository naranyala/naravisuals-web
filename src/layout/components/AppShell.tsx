import React from "react";
import { clsx } from "clsx";
import { useUIState } from "../../core/store";

interface AppShellProps {
  children: React.ReactNode;
  topBar: React.ReactNode;
  search: React.ReactNode;
  settings: React.ReactNode;
}

/**
 * AppShell
 * 
 * Root structural primitive. Manages global overlays and top-level scroll.
 */
export function AppShell({ children, topBar, search, settings }: AppShellProps) {
  const { isMobile, sidebarVisible, setSidebar } = useUIState();

  return (
    <div className={clsx("site-wrapper", { "mobile-sidebar-open": isMobile && sidebarVisible })}>
      {topBar}
      {search}
      {settings}
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarVisible && (
        <div 
          className="mobile-overlay" 
          onClick={() => setSidebar(false)}
        />
      )}
      
      {children}
    </div>
  );
}
