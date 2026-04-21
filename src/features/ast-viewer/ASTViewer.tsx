/**
 * Markdown AST Viewer Component
 *
 * Displays the marked.js token AST as a collapsible tree structure
 * for debugging purposes. Shows the structure between raw markdown
 * and HTML output.
 */

import { useEffect, useMemo, useState } from "react";
import {
  type ASTTokenNode,
  countNodes,
  getASTDepth,
  getUniqueTypes,
  tokensToAST,
} from "./ast-parser";

interface ASTViewerProps {
  ast: any[];
}

interface TreeNodeProps {
  node: ASTTokenNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  path: string;
}

function getTokenIcon(type: string): string {
  const icons: Record<string, string> = {
    heading: "📌",
    paragraph: "📝",
    code: "💻",
    blockquote: "💬",
    hr: "➖",
    list: "📋",
    list_item: "•",
    html: "🔧",
    text: "📄",
    def: "🔗",
    escape: "⎋",
    reflink: "🔗",
    nolink: "🔗",
    image: "🖼️",
    strong: "🔒",
    em: "✨",
    codespan: "💻",
    br: "↵",
    del: "❌",
    link: "🔗",
    table: "📊",
    table_row: "📊",
    table_cell: "📊",
  };
  return icons[type] || "📦";
}

function TreeNode({ node, depth, expanded, onToggle, path }: TreeNodeProps) {
  const isExpanded = expanded.has(path);
  const hasChildren = node.children && node.children.length > 0;
  const indent = depth * 16;

  return (
    <div className="ast-node" style={{ paddingLeft: indent }}>
      <button
        type="button"
        className={`ast-node-header ${hasChildren ? "expandable" : ""} ${isExpanded ? "expanded" : ""}`}
        onClick={() => hasChildren && onToggle(path)}
        title={node.type}
      >
        <span className="ast-node-icon">{getTokenIcon(node.type)}</span>
        <span className="ast-node-toggle">{hasChildren ? (isExpanded ? "▼" : "▶") : " "}</span>
        <span className="ast-node-tag">{node.type}</span>

        {/* Show relevant metadata */}
        {node.depth !== undefined && <span className="ast-meta">h{node.depth}</span>}
        {node.lang && <span className="ast-meta lang">{node.lang}</span>}
        {node.ordered !== undefined && (
          <span className="ast-meta">{node.ordered ? "ordered" : "unordered"}</span>
        )}
        {node.start !== undefined && node.start > 1 && (
          <span className="ast-meta">start={node.start}</span>
        )}

        {/* Show text preview */}
        {node.text && !hasChildren && (
          <span className="ast-text-preview">
            {node.text.length > 60 ? `${node.text.slice(0, 60)}...` : node.text}
          </span>
        )}

        {hasChildren && <span className="ast-node-count">({(node.children as any[]).length})</span>}
      </button>

      {/* Expandable children */}
      {isExpanded && hasChildren && node.children && (
        <div className="ast-node-children">
          {(node.children as any[]).map((child: any, i: number) => (
            <TreeNode
              // biome-ignore lint/suspicious/noArrayIndexKey: AST nodes don't have unique IDs, path includes depth info
              key={`node-${path}-${i}`}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              path={`${path}-${i}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ASTViewer({ ast: tokens }: ASTViewerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const astNodes = useMemo(() => {
    if (!tokens || tokens.length === 0) return [];
    return tokensToAST(tokens);
  }, [tokens]);

  const stats = useMemo(
    () => ({
      totalNodes: countNodes(astNodes),
      uniqueTypes: getUniqueTypes(astNodes),
      depth: getASTDepth(astNodes),
    }),
    [astNodes]
  );

  // Expand top-level nodes by default
  useEffect(() => {
    const topLevel = new Set<string>();
    for (let i = 0; i < astNodes.length; i++) {
      topLevel.add(`-${i}`);
    }
    setExpanded(topLevel);
  }, [astNodes]);

  // Handle undefined or empty tokens
  if (!tokens || tokens.length === 0) {
    return (
      <div className="ast-viewer">
        <div className="ast-empty-state">
          <p>No AST data available.</p>
          <p className="ast-empty-hint">
            AST is not generated during the standard build. This component is for debugging only.
          </p>
        </div>
      </div>
    );
  }

  const handleToggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allPaths = new Set<string>();
    function collectPaths(nodes: ASTTokenNode[], path: string) {
      nodes.forEach((node, i) => {
        const nodePath = `${path}-${i}`;
        allPaths.add(nodePath);
        if (node.children) {
          collectPaths(node.children, nodePath);
        }
      });
    }
    collectPaths(astNodes, "");
    setExpanded(allPaths);
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  return (
    <div className="ast-viewer">
      {/* Stats bar */}
      <div className="ast-stats">
        <span className="ast-stat">
          <strong>{stats.totalNodes}</strong> tokens
        </span>
        <span className="ast-stat">
          Depth: <strong>{stats.depth}</strong>
        </span>
        <span className="ast-stat">
          <strong>{stats.uniqueTypes.length}</strong> types
        </span>
      </div>

      {/* Controls */}
      <div className="ast-controls">
        <button type="button" className="ast-btn" onClick={expandAll}>
          Expand All
        </button>
        <button type="button" className="ast-btn" onClick={collapseAll}>
          Collapse All
        </button>
        <input
          type="text"
          className="ast-search"
          placeholder="Search types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Type list */}
      <div className="ast-tags">
        {stats.uniqueTypes
          .filter((type) => !searchTerm || type.includes(searchTerm.toLowerCase()))
          .map((type) => (
            <span key={type} className="ast-tag">
              {getTokenIcon(type)} {type}
            </span>
          ))}
      </div>

      {/* Tree */}
      <div className="ast-tree">
        {astNodes.map((node, i) => (
          <TreeNode
            // biome-ignore lint/suspicious/noArrayIndexKey: AST nodes don't have unique IDs and order is stable
            key={`root-${i}-${node.type}`}
            node={node}
            depth={0}
            expanded={expanded}
            onToggle={handleToggle}
            path={`-${i}`}
          />
        ))}
      </div>
    </div>
  );
}
