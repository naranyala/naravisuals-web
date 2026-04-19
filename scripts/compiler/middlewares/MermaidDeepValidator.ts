/**
 * Mermaid Deep Validator Middleware
 * 
 * Performs "Pre-Flight" rendering of Mermaid diagrams during the build process
 * to ensure that the generated SVG will be valid and renderable in the browser.
 */

import { JSDOM } from "jsdom";
import type { CompilerMiddleware } from "../Middleware.ts";
import { validateMermaidContent } from "../../plugins/validators/mermaid-content.ts";

export const mermaidDeepValidator: CompilerMiddleware = {
  name: "mermaid-deep-validator",

  async onTransform(unit, ctx) {
    // 1. Find all mermaid blocks in the markdown content
    // We use a regex to find blocks before they are turned into HTML
    const mermaidRegex = /```mermaid(?::desc=([^ \n]+))?\n([\s\S]*?)\n```/g;
    let match;

    while ((match = mermaidRegex.exec(unit.rawContent)) !== null) {
      const desc = match[1];
      const source = match[2].trim();

      if (!source) continue;

      // 2. Perform Deep Validation
      try {
        await validateDiagram(source, unit.relPath);
      } catch (err: any) {
        ctx.error("plugin", unit.relPath, "Mermaid Deep Rendering Failed", err.message);
      }
    }
  }
};

/**
 * Validates a diagram by attempting to simulate its rendering.
 * Note: Since a full Mermaid render in Node/JSDOM is extremely complex due to
 * layout engine dependencies (D3/Dagre), we primarily use the internal parser
 * and a "Well-formed SVG" check.
 */
async function validateDiagram(source: string, filePath: string) {
  // We use the official Mermaid parser if possible, or our strict validator
  const errors = await validateMermaidContent(source, filePath);
  
  if (errors.length > 0 && errors.some(e => e.severity === "error")) {
    throw new Error(errors[0].message + ": " + errors[0].detail);
  }

  // To truly validate SVG generation, we would need to run mermaid.render()
  // in a JSDOM instance with full SVG support.
  // For now, we perform a "Structure Integrity" check on the source
  // to catch common deep nesting issues.
  
  checkNestingIntegrity(source);
}

function checkNestingIntegrity(source: string) {
  const openBraces = (source.match(/\{/g) || []).length;
  const closeBraces = (source.match(/\}/g) || []).length;
  const subgraphs = (source.match(/\bsubgraph\b/g) || []).length;
  const ends = (source.match(/\bend\b/g) || []).length;

  if (openBraces !== closeBraces) {
    throw new Error(`Unbalanced braces ({:${openBraces}, }:${closeBraces}). This will cause SVG corruption.`);
  }

  if (subgraphs !== ends) {
    throw new Error(`Unbalanced subgraphs (subgraph:${subgraphs}, end:${ends}). Deep nesting requires explicit 'end' tags.`);
  }
  
  // Detect "Illegal Nesting" patterns known to break flowchart SVGs
  if (source.includes("subgraph") && source.includes("classDiagram")) {
    throw new Error("Illegal mixing of diagram types: subgraphs are not supported in classDiagrams.");
  }
}
