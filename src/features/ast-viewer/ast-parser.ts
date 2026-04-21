/**
 * Markdown AST Token Viewer
 *
 * Works with marked's Token type to display the markdown AST
 * (the structure between raw markdown and HTML output).
 */

import type { Token, Tokens } from "marked";

/** Union of all marked token subtypes so we can access subtype-specific properties without `as any`. */
type ExtendedToken = Token & {
  raw?: string;
  text?: string;
  depth?: number;
  lang?: string;
  tokens?: Token[];
  items?: (Tokens.ListItem | string)[];
  header?: Tokens.TableCell[];
  rows?: Tokens.TableCell[][];
  ordered?: boolean;
  start?: number;
  loose?: boolean;
};

export interface ASTTokenNode {
  type: string;
  raw?: string;
  text?: string;
  depth?: number;
  lang?: string;
  tokens?: Token[];
  items?: Token[];
  header?: Token[];
  rows?: Token[][];
  ordered?: boolean;
  start?: number;
  loose?: boolean;
  children?: ASTTokenNode[];
}

/**
 * Convert marked Token[] into a simplified tree structure for display.
 */
export function tokensToAST(tokens: Token[]): ASTTokenNode[] {
  return tokens.map(tokenToNode);
}

function tokenToNode(token: Token): ASTTokenNode {
  const ext = token as ExtendedToken;
  const node: ASTTokenNode = {
    type: token.type,
  };

  // Add relevant fields based on token type
  if (ext.raw) node.raw = ext.raw;
  if (ext.text) node.text = ext.text;
  if (ext.depth !== undefined) node.depth = ext.depth;
  if (ext.lang) node.lang = ext.lang;
  if (ext.ordered !== undefined) node.ordered = ext.ordered;
  if (ext.start !== undefined) node.start = ext.start;
  if (ext.loose !== undefined) node.loose = ext.loose;

  // Recursively process nested tokens
  if (ext.tokens && Array.isArray(ext.tokens)) {
    node.children = ext.tokens.map(tokenToNode);
  }
  if (ext.items && Array.isArray(ext.items)) {
    node.children = ext.items
      .filter((item): item is Tokens.ListItem => typeof item !== "string" && "text" in item)
      .map((item) => tokenToNode(item as unknown as Token));
  }
  if (ext.header && Array.isArray(ext.header)) {
    node.children = ext.header.map((cell) => tokenToNode(cell as unknown as Token));
  }
  if (ext.rows && Array.isArray(ext.rows)) {
    const rowNodes = ext.rows.map((row) => ({
      type: "row",
      children: Array.isArray(row) ? row.map((cell) => tokenToNode(cell as unknown as Token)) : [],
    }));

    if (node.children) {
      node.children.push(...rowNodes);
    } else {
      node.children = rowNodes;
    }
  }

  return node;
}

/**
 * Count total nodes in AST
 */
export function countNodes(ast: ASTTokenNode[]): number {
  let count = 0;
  for (const node of ast) {
    count += 1 + (node.children ? countNodes(node.children) : 0);
  }
  return count;
}

/**
 * Get all unique token types in AST
 */
export function getUniqueTypes(ast: ASTTokenNode[]): string[] {
  const types = new Set<string>();
  function walk(nodes: ASTTokenNode[]): void {
    for (const node of nodes) {
      types.add(node.type);
      if (node.children) walk(node.children);
    }
  }
  walk(ast);
  return Array.from(types).sort();
}

/**
 * Get AST depth
 */
export function getASTDepth(ast: ASTTokenNode[]): number {
  if (ast.length === 0) return 0;
  return 1 + Math.max(...ast.map((n) => (n.children ? getASTDepth(n.children) : 0)));
}
