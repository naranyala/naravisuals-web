import { clsx } from "clsx";
import type React from "react";

interface ThreeColumnLayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  reference: React.ReactNode;
  sidebarCollapsed?: boolean;
}

export function ThreeColumnLayout({
  sidebar,
  content,
  reference,
  sidebarCollapsed = false,
}: ThreeColumnLayoutProps) {
  return (
    <div className="doc-page-layout">
      {/* Navigation Column */}
      <nav className={clsx("sidebar", { collapsed: sidebarCollapsed })}>{sidebar}</nav>

      {/* Main Content Column */}
      <main className="main-content">{content}</main>

      {/* Reference Column (TOC, Metadata, Refs) */}
      <aside className="toc-container">{reference}</aside>
    </div>
  );
}
