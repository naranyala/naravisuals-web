import { clsx } from "clsx";
import { useState } from "react";
import { ArticleRefsPanel } from "./ArticleRefsPanel";
import { MetadataPanel } from "./MetadataPanel";

interface ReferencePanelProps {
  metadata: Record<string, string | readonly string[]>;
  markdownAst?: readonly any[];
}

/**
 * Unified Reference Panel
 *
 * Consolidates Page Metadata and Footnotes into a single information panel.
 * This panel is always visible to provide a consistent UI across all articles.
 */
export function ReferencePanel({ metadata, markdownAst }: ReferencePanelProps) {
  const [activeTab, setActiveTab] = useState<"metadata" | "footnotes">("metadata");

  const hasMetadata = Object.keys(metadata).length > 0;

  return (
    <div className="reference-panel-unified">
      <div className="reference-tabs">
        <button
          type="button"
          className={clsx("ref-tab", { active: activeTab === "metadata" })}
          onClick={() => setActiveTab("metadata")}
        >
          Metadata
        </button>
        <button
          type="button"
          className={clsx("ref-tab", { active: activeTab === "footnotes" })}
          onClick={() => setActiveTab("footnotes")}
        >
          Footnotes
        </button>
      </div>

      <div className="reference-content">
        {activeTab === "metadata" ? (
          hasMetadata ? (
            <MetadataPanel metadata={metadata} />
          ) : (
            <div className="ref-empty-state">No metadata available for this article.</div>
          )
        ) : (
          <ArticleRefsPanel markdownAst={markdownAst} />
        )}
      </div>
    </div>
  );
}
