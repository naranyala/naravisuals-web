import type React from "react";

interface ThreeColumnLayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  reference: React.ReactNode;
}

/**
 * ThreeColumnLayout
 *
 * Primitive for the main documentation view.
 * Handles the responsive transition from 3-col to 1-col.
 */
export function ThreeColumnLayout({ sidebar, content, reference }: ThreeColumnLayoutProps) {
  return (
    <div className="doc-page-layout">
      {/* Navigation Column */}
      <nav className="sidebar">{sidebar}</nav>

      {/* Main Content Column */}
      <main className="main-content">{content}</main>

      {/* Reference Column (TOC, Metadata, Refs) */}
      <aside className="toc-container">{reference}</aside>
    </div>
  );
}
