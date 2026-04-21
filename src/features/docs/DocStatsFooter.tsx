/**
 * Doc Stats Footer
 *
 * Displays comprehensive statistics about the current document
 * in a collapsible footer panel.
 */

import { clsx } from "clsx";
import { useMemo, useState } from "react";

interface DocStats {
  wordCount: number;
  headingCount: number;
  codeBlocks: number;
  mermaidDiagrams: number;
  admonitions: number;
  admonitionTypes: Record<string, number>;
  links: number;
  images: number;
  tables: number;
  lists: number;
}

interface DocStatsFooterProps {
  contentHtml: string;
}

export function DocStatsFooter({ contentHtml }: DocStatsFooterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse stats when content changes
  const stats = useMemo<DocStats | null>(() => {
    if (!contentHtml) return null;

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = contentHtml;

    // Count code blocks
    const codeBlocks = tempDiv.querySelectorAll(".code-block, pre code").length;

    // Count mermaid diagrams
    const mermaidDiagrams = tempDiv.querySelectorAll(".mermaid-diagram").length;

    // Count admonitions
    const admonitions = tempDiv.querySelectorAll(".admonition").length;
    const admonitionTypes: Record<string, number> = {};
    tempDiv.querySelectorAll(".admonition").forEach((el) => {
      const className = el.className;
      const match = className.match(/admonition-(\w+)/);
      if (match) {
        const type = match[1];
        if (type) {
          admonitionTypes[type] = (admonitionTypes[type] || 0) + 1;
        }
      }
    });

    // Count headings
    const headingCount = tempDiv.querySelectorAll("h2, h3, h4").length;

    // Count links (excluding internal hash links)
    const links = Array.from(tempDiv.querySelectorAll("a[href]")).filter(
      (a) => !a.getAttribute("href")?.startsWith("#")
    ).length;

    // Count images
    const images = tempDiv.querySelectorAll("img").length;

    // Count tables
    const tables = tempDiv.querySelectorAll("table").length;

    // Count lists
    const lists = tempDiv.querySelectorAll("ul, ol").length;

    // Count words (rough estimate from text content)
    const textContent = tempDiv.textContent || "";
    const wordCount = textContent.split(/\s+/).filter((w) => w.length > 0).length;

    return {
      wordCount,
      headingCount,
      codeBlocks,
      mermaidDiagrams,
      admonitions,
      admonitionTypes,
      links,
      images,
      tables,
      lists,
    };
  }, [contentHtml]);

  if (!stats) return null;

  return (
    <div className="doc-stats-footer">
      <button
        type="button"
        className="doc-stats-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="doc-stats-toggle-text">{isOpen ? "Hide" : "Show"} Document Stats</span>
        <span className={clsx("doc-stats-chevron", { open: isOpen })}>▾</span>
      </button>

      {isOpen && (
        <div className="doc-stats-content">
          <div className="doc-stats-grid">
            <div className="doc-stat">
              <span className="doc-stat-label">Words</span>
              <span className="doc-stat-value">{stats.wordCount.toLocaleString()}</span>
            </div>
            <div className="doc-stat">
              <span className="doc-stat-label">Headings</span>
              <span className="doc-stat-value">{stats.headingCount}</span>
            </div>
            <div className="doc-stat">
              <span className="doc-stat-label">Code Blocks</span>
              <span className="doc-stat-value">{stats.codeBlocks}</span>
            </div>
            <div className="doc-stat">
              <span className="doc-stat-label">Mermaid Diagrams</span>
              <span className="doc-stat-value">{stats.mermaidDiagrams}</span>
            </div>
            <div className="doc-stat">
              <span className="doc-stat-label">Admonitions</span>
              <span className="doc-stat-value">{stats.admonitions}</span>
            </div>
            {stats.admonitions > 0 && (
              <div className="doc-stat doc-stat-full">
                <span className="doc-stat-label">Admonition Types</span>
                <span className="doc-stat-value doc-stat-breakdown">
                  {Object.entries(stats.admonitionTypes)
                    .map(([type, count]) => `${type}: ${count}`)
                    .join(", ")}
                </span>
              </div>
            )}
            <div className="doc-stat">
              <span className="doc-stat-label">Links</span>
              <span className="doc-stat-value">{stats.links}</span>
            </div>
            <div className="doc-stat">
              <span className="doc-stat-label">Images</span>
              <span className="doc-stat-value">{stats.images}</span>
            </div>
            <div className="doc-stat">
              <span className="doc-stat-label">Tables</span>
              <span className="doc-stat-value">{stats.tables}</span>
            </div>
            <div className="doc-stat">
              <span className="doc-stat-label">Lists</span>
              <span className="doc-stat-value">{stats.lists}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
