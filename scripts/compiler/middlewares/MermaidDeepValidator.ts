/**
 * Mermaid Deep Validator Middleware
 *
 * Performs "Pre-Flight" rendering of Mermaid diagrams during the build process
 * to ensure that the generated SVG will be valid and renderable in the browser.
 */

import { validateMermaidContent } from "../../plugins/validators/mermaid-content.ts";
import type { CompilerMiddleware } from "../Middleware.ts";

export const mermaidDeepValidator: CompilerMiddleware = {
  name: "mermaid-deep-validator",

  async onTransform(unit, container) {
    // 1. Find all mermaid blocks in the markdown content
    // Supports: ```mermaid, ```flowchart, ```graph, etc.
    const mermaidTypes = [
      "mermaid",
      "graph",
      "flowchart",
      "sequenceDiagram",
      "classDiagram",
      "stateDiagram",
      "erDiagram",
      "gantt",
      "pie",
      "quadrantChart",
      "xyChart",
      "mindmap",
      "timeline",
      "journey",
      "requirementDiagram",
      "gitGraph",
      "sankey",
    ];
    const typesRegex = mermaidTypes.join("|");
    const mermaidRegex = new RegExp(
      `\`\`\`(${typesRegex})(?::desc=([^\\n]+))?\\n([\\s\\S]*?)\\n\`\`\``,
      "g"
    );

    const content = unit.content || "";
    const matches = Array.from(content.matchAll(mermaidRegex));

    for (const match of matches) {
      const type = match[1] || "mermaid";
      let source = (match[3] || "").trim();

      if (!source) continue;

      // Determine the target diagram type
      let targetType = type;
      if (type === "mermaid") {
        const splitParts = source.split(/\s+/);
        const firstWord = (splitParts[0] || "").toLowerCase();
        if (mermaidTypes.includes(firstWord) && firstWord !== "mermaid") {
          targetType = firstWord;
        } else if (firstWord === "graph") {
          targetType = "flowchart";
        }
      }

      // Ensure diagram has the correct prefix and direction
      if (targetType !== "mermaid") {
        const trimmedDiagram = source.trim();
        const firstLineParts = trimmedDiagram.split("\n");
        const firstLine = (firstLineParts[0] || "").trim().toLowerCase();

        const isPrefixed =
          firstLine.startsWith(targetType.toLowerCase()) ||
          (targetType === "graph" && firstLine.startsWith("flowchart")) ||
          (targetType === "flowchart" && firstLine.startsWith("graph"));

        if (!isPrefixed) {
          const directions = ["LR", "RL", "TD", "TB", "BT"];
          const lineParts = firstLine.split(/\s+/);
          const firstWord = (lineParts[0] || "").toUpperCase();

          if (directions.includes(firstWord)) {
            const restOfDiagram = trimmedDiagram.split("\n").slice(1).join("\n");
            source = `${targetType} ${firstWord}\n${restOfDiagram}`;
          } else if (targetType === "flowchart" || targetType === "graph") {
            source = `${targetType} TD\n${trimmedDiagram}`;
          } else {
            source = `${targetType}\n${trimmedDiagram}`;
          }
        }
      }

      // 2. Perform Deep Validation
      try {
        await validateDiagram(source, unit.relPath);
      } catch (err: any) {
        container.context.error(
          "plugin",
          unit.relPath,
          "Mermaid Deep Validation Failed",
          err.message
        );
      }
    }
  },
};

/**
 * Validates a diagram by attempting to simulate its rendering.
 */
async function validateDiagram(source: string, filePath: string) {
  const errors = await validateMermaidContent(source, filePath);

  if (errors.length > 0 && errors.some((e) => e.severity === "error")) {
    const firstError = errors[0];
    if (firstError) {
      throw new Error(`${firstError.message}: ${firstError.detail}`);
    }
  }

  checkNestingIntegrity(source);
}

function checkNestingIntegrity(source: string) {
  const openBraces = (source.match(/\{/g) || []).length;
  const closeBraces = (source.match(/\}/g) || []).length;
  const subgraphs = (source.match(/\bsubgraph\b/g) || []).length;
  const ends = (source.match(/\bend\b/g) || []).length;

  if (openBraces !== closeBraces) {
    throw new Error(
      `Unbalanced braces ({:${openBraces}, }:${closeBraces}). This will cause SVG corruption.`
    );
  }

  if (subgraphs !== ends) {
    throw new Error(
      `Unbalanced subgraphs (subgraph:${subgraphs}, end:${ends}). Deep nesting requires explicit 'end' tags.`
    );
  }

  if (source.includes("subgraph") && source.includes("classDiagram")) {
    throw new Error(
      "Illegal mixing of diagram types: subgraphs are not supported in classDiagrams."
    );
  }
}
