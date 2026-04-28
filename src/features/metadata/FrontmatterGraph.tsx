import cytoscape from "cytoscape";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { allDocs } from "../../generated";
import { Modal } from "../../shared/components/Modal";
import { useDocsTheme } from "../theme";
import { useMetadata } from "./MetadataProvider";

/**
 * Frontmatter Network Graph Visuals
 *
 * Visualizes the relationship between documentation articles and their tags.
 * Each article is a node, and each tag is a node.
 * Edges connect articles to their associated tags.
 */
export function FrontmatterGraph() {
  const { graphOpen, setGraphOpen } = useMetadata();
  const { isDark } = useDocsTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const elements = useMemo(() => {
    const nodes: any[] = [];
    const edges: any[] = [];
    const seenTags = new Set<string>();

    for (const doc of allDocs) {
      // Add Doc node
      nodes.push({
        data: {
          id: doc.id,
          label: doc.title,
          type: "doc",
          slug: doc.slug,
        },
      });

      // Process tags
      if (doc.tags && Array.isArray(doc.tags)) {
        for (const tag of doc.tags) {
          const tagId = `tag:${tag}`;
          if (!seenTags.has(tagId)) {
            nodes.push({
              data: {
                id: tagId,
                label: tag,
                type: "tag",
              },
            });
            seenTags.add(tagId);
          }

          // Add edge from Doc to Tag
          edges.push({
            data: {
              id: `${doc.id}-${tagId}`,
              source: doc.id,
              target: tagId,
            },
          });
        }
      }
    }

    return [...nodes, ...edges];
  }, []);

  useEffect(() => {
    if (!graphOpen || !containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "font-size": "14px",
            "text-valign": "center",
            "text-halign": "center",
            "background-color": isDark ? "#4c566a" : "#d8dee9",
            color: isDark ? "#eceff4" : "#2e3440",
            width: "label",
            height: "label",
            padding: "10px",
            shape: "round-rectangle",
          },
        },
        {
          selector: 'node[type="tag"]',
          style: {
            "background-color": isDark ? "#88c0d0" : "#5e81ac",
            color: "#ffffff",
            "font-weight": "bold",
          },
        },
        {
          selector: 'node[type="doc"]',
          style: {
            "border-width": 2,
            "border-color": isDark ? "#81a1c1" : "#88c0d0",
          },
        },
        {
          selector: "edge",
          style: {
            width: 1,
            "line-color": isDark ? "#434c5e" : "#e5e9f0",
            "curve-style": "bezier",
            opacity: 0.6,
          },
        },
      ],
      layout: {
        name: "cose",
        animate: true,
        padding: 50,
        componentSpacing: 150,
        nodeOverlap: 50,
        refresh: 20,
        fit: true,
        idealEdgeLength: 80,
      },
    });

    cyRef.current = cy;

    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      if (node.data("type") === "doc") {
        console.log("Clicked doc:", node.data("slug"));
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graphOpen, elements, isDark]);

  const handleZoomIn = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 1.3,
        renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 },
      });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() / 1.3,
        renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 },
      });
    }
  }, []);

  const handleFit = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
    }
  }, []);

  return (
    <Modal
      isOpen={graphOpen}
      onClose={() => setGraphOpen(false)}
      title="Frontmatter Network Graph"
      className="graph-modal-container"
      header={
        <div className="graph-zoom-controls">
          <div className="graph-legend">
            <span className="legend-item">
              <span className="dot tag-dot" /> Tag
            </span>
            <span className="legend-item">
              <span className="dot doc-dot" /> Article
            </span>
          </div>
          <button type="button" className="zoom-btn" onClick={handleZoomIn} title="Zoom in">
            +
          </button>
          <button type="button" className="zoom-btn" onClick={handleZoomOut} title="Zoom out">
            −
          </button>
          <button type="button" className="zoom-btn" onClick={handleFit} title="Fit to view">
            ⊡
          </button>
        </div>
      }
      footer={<p>Drag to move nodes • Scroll to zoom • Cose force-directed layout</p>}
    >
      <div
        className="graph-container-body"
        style={{ position: "relative", height: "70vh", overflow: "hidden" }}
      >
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </Modal>
  );
}
