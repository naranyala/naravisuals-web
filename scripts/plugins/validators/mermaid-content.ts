/**
 * Mermaid Content Validation Helper (STRICT & Pure TS)
 *
 * NOTE: These validation rules are heuristics and may be incomplete or outdated
 * compared to the official Mermaid.js parser. Successful validation DOES NOT
 * guarantee successful rendering in the browser. Always verify diagrams visually.
 *
 * This validator implements a strict set of rules to catch common Mermaid.js
 * syntax errors without relying on the browser-based Mermaid engine.
 * This ensures it runs reliably in any build environment (Bun, Rust, Node).
 */

import { match, P } from "ts-pattern";

export interface ValidationError {
  message: string;
  detail: string;
  line?: number;
  severity?: "error" | "warning" | "info";
}

const VALID_DIAGRAM_TYPES = [
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
  "block",
  "packet",
  "c4Context",
  "c4Container",
  "c4Component",
  "c4Dynamic",
  "c4Deployment",
  "graph", // Alias for flowchart
];

export async function validateMermaidContent(
  content: string,
  _filePath: string = "unknown"
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];
  const trimmed = content.trim();

  if (!trimmed) {
    errors.push({ message: "Empty diagram", detail: "Diagram contains no content." });
    return errors;
  }

  const lines = trimmed.split("\n");

  // 1. Find the first line that isn't a comment/metadata line
  const firstActualLineIndex = lines.findIndex((line) => {
    const l = (line || "").trim();
    return l !== "" && !l.startsWith("%%") && !l.startsWith("---") && !l.startsWith(":");
  });

  if (firstActualLineIndex === -1 || lines[firstActualLineIndex] === undefined) {
    errors.push({
      message: "Invalid diagram content",
      detail: "No valid Mermaid diagram type found (only comments or metadata).",
    });
    return errors;
  }

  const firstLine = lines[firstActualLineIndex].trim();
  const firstLineLower = firstLine.toLowerCase();

  // 2. Diagram Type Validation
  const firstLineParts = firstLine.split(/\s+/);
  const type = firstLineParts[0] || "unknown";
  const direction = firstLineParts[1];

  const validType = VALID_DIAGRAM_TYPES.find((t) => firstLineLower.startsWith(t.toLowerCase()));
  if (!validType || type === "unknown") {
    errors.push({
      message: "Invalid diagram type",
      detail: `Must start with a valid type (e.g., flowchart, sequenceDiagram, etc.). Found: "${type}"`,
    });
    return errors;
  }

  // Rule: Flowchart direction should ideally be on the same line as 'flowchart'
  match([validType, firstLineParts.length])
    .with([P.union("flowchart", "graph"), 1], () => {
      const nextLine = lines[firstActualLineIndex + 1]?.trim();
      const directions = ["LR", "RL", "TD", "TB", "BT"];
      if (nextLine && directions.includes(nextLine.toUpperCase())) {
        errors.push({
          severity: "warning",
          message: "Disconnected direction",
          detail: `Put diagram direction (e.g., '${nextLine.toUpperCase()}') on the same line as the diagram type: '${validType} ${nextLine.toUpperCase()}'.`,
          line: firstActualLineIndex + 1,
        });
      }
    })
    .otherwise(() => {});

  // Rule: Mindmap must have a root node
  if (validType === "mindmap") {
    const hasRoot = lines.some(
      (l, i) => i > firstActualLineIndex && l.trim() !== "" && !l.trim().startsWith("%%")
    );
    if (!hasRoot) {
      errors.push({
        message: "Missing root node",
        detail: "Mindmap requires at least one root node.",
        line: firstActualLineIndex + 1,
      });
    }
  }

  // Rule: Prefer 'flowchart' over 'graph' (modern standard)
  if (type.toLowerCase() === "graph") {
    errors.push({
      severity: "warning",
      message: "Legacy diagram type",
      detail:
        "Use 'flowchart' instead of 'graph' for more features and better rendering consistency.",
      line: firstActualLineIndex + 1,
    });
  }

  // Rule: Diagram type and direction must be correctly cased
  match([type, validType])
    .with([P.not(validType), P.select()], (valid) => {
      if (type.toLowerCase() === valid.toLowerCase()) {
        errors.push({
          severity: "warning",
          message: "Lowercase diagram type",
          detail: `Standard practice is to use PascalCase/Lowercase as defined by Mermaid: use '${valid}' instead of '${type}'.`,
          line: firstActualLineIndex + 1,
        });
      }
    })
    .otherwise(() => {});

  if (direction && direction === direction.toLowerCase() && direction !== direction.toUpperCase()) {
    errors.push({
      severity: "warning",
      message: "Lowercase direction",
      detail: `Standard practice is to use uppercase for directions: use '${direction.toUpperCase()}' instead of '${direction}'.`,
      line: firstActualLineIndex + 1,
    });
  }

  // 3. State-based scanning for syntax errors
  let inQuote = false;
  let currentQuoteChar = "";
  const bracketStack: { char: string; line: number }[] = [];
  const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
  let subgraphCount = 0;
  let endCount = 0;

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    if (line === undefined) return;
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("%%")) return;

    let unquotedLine = "";

    // Track quotes and brackets char-by-char
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === undefined) continue;

      const prevChar = i > 0 ? line[i - 1] : "";
      const isEscaped = prevChar === "\\" && (i < 2 || line[i - 2] !== "\\");

      if ((char === '"' || char === "'" || char === "`") && !isEscaped) {
        if (!inQuote) {
          inQuote = true;
          currentQuoteChar = char;
          unquotedLine += char;
        } else if (char === currentQuoteChar) {
          inQuote = false;
          currentQuoteChar = "";
          unquotedLine += char;
        } else {
          // Rule: No double-quote inside double-quote
          if (char === '"' && currentQuoteChar === '"') {
            errors.push({
              message: "Nested double quotes",
              detail:
                "Do not use double quotes inside a double-quoted label. Use single quotes instead.",
              line: lineNum,
            });
          }
          unquotedLine += " "; // inside different quote type
        }
      } else if (!inQuote) {
        unquotedLine += char;
        if (pairs[char]) {
          bracketStack.push({ char, line: lineNum });
        } else if (Object.values(pairs).includes(char)) {
          const last = bracketStack.pop();
          if (!last || pairs[last.char] !== char) {
            errors.push({
              message: "Unbalanced brackets",
              detail: `Mismatched closing bracket '${char}' at line ${lineNum}.`,
              line: lineNum,
            });
          }
        }
      } else {
        unquotedLine += " "; // inside quotes
      }
    }

    // 4. Content Checks (only on unquoted parts of the line)
    const stripped = unquotedLine.trim();
    if (index === firstActualLineIndex) return; // Skip diagram type line

    // Track subgraphs
    if (stripped.match(/^subgraph\b/)) subgraphCount++;
    if (stripped === "end") endCount++;

    // Flowchart specific checks
    if (validType === "flowchart" || validType === "graph") {
      // Reject single arrows ->
      if (/\s->\s/.test(stripped) || /^->\s/.test(stripped) || /\s->$/.test(stripped)) {
        errors.push({
          message: "Invalid arrow syntax",
          detail: "Flowcharts must use '-->' or '---'. Single '->' is invalid.",
          line: lineNum,
        });
      }

      // Reject malformed dotted arrows (must be -.->)
      if (/-+\.-*->/.test(stripped) && !stripped.includes("-.->")) {
        errors.push({
          message: "Invalid arrow syntax",
          detail: "Dotted arrows must use '-.->'. Found a malformed dotted arrow.",
          line: lineNum,
        });
      }

      // Suggest double quotes for labels in brackets: [Label] -> ["Label"]
      if (/[[({][^"'`\s][^\])}]*[\])}]/.test(unquotedLine)) {
        errors.push({
          severity: "warning",
          message: "Unquoted label",
          detail:
            'Consider wrapping labels inside brackets, parentheses, or braces in double quotes (e.g., ["Text"]) for better compatibility with special characters.',
          line: lineNum,
        });
      }

      // Check for illegal characters in node IDs (must be alphanumeric/underscore unless quoted)
      // 1. Strip edge labels: |label|
      let idOnlyLine = stripped.replace(/\|[^|]+\|/g, " ");
      // 2. Replace all valid arrows with a common delimiter
      idOnlyLine = idOnlyLine.replace(/--+>|---+|-+\.->|==+>/g, " § ");
      // 3. Split by delimiter and validate IDs
      const parts = idOnlyLine.split(" § ");

      for (const part of parts) {
        const p = part.trim();
        if (!p) continue;

        // Skip keywords
        if (p === "subgraph" || p === "end" || p === "direction") continue;

        const idMatch = p.match(/^([^[({ \t\n\r\f\v;]+)/);
        if (idMatch && idMatch[1] !== undefined) {
          const id = idMatch[1];
          // If it is already quoted, it is fine
          if (id.startsWith('"') || id.startsWith("'") || id.startsWith("`")) continue;

          if (/[^a-zA-Z0-9_-]/.test(id)) {
            errors.push({
              message: "Invalid node ID",
              detail: `Node ID '${id}' contains illegal characters. Wrap in double quotes or use only alphanumeric/underscores.`,
              line: lineNum,
            });
          }
        }
      }
    }

    // Mindmap specific checks
    if (validType === "mindmap") {
      // Mindmaps use indentation, but we can still check for node IDs
      const stripped = unquotedLine.trim();
      if (stripped && !stripped.startsWith("%%")) {
        // Simple check for illegal node characters in mindmap if not using shapes () [] etc.
        const firstWord = stripped.split(/\s+/)[0];
        if (
          firstWord &&
          !firstWord.includes("(") &&
          !firstWord.includes("[") &&
          !firstWord.includes("{")
        ) {
          if (/[^a-zA-Z0-9_-]/.test(firstWord)) {
            // Mindmaps are more flexible but certain chars at start can confuse parser
            // Just a warning
            errors.push({
              severity: "info",
              message: "Complex node ID",
              detail: `Node '${firstWord}' contains special characters. Wrap in double quotes if rendering fails.`,
              line: lineNum,
            });
          }
        }
      }
    }
  });

  if (inQuote) {
    errors.push({
      message: "Unclosed quote",
      detail: `Diagram has an unclosed quote: ${currentQuoteChar}`,
    });
  }

  if (bracketStack.length > 0) {
    errors.push({
      message: "Unbalanced brackets",
      detail: `Diagram has ${bracketStack.length} unclosed opening bracket(s).`,
    });
  }

  if (subgraphCount !== endCount) {
    errors.push({
      message: "Unbalanced subgraphs",
      detail: `Diagram has ${subgraphCount} 'subgraph' declarations but ${endCount} 'end' keywords.`,
    });
  }

  // 6. Global Quality Checks
  const globalPatterns = [
    {
      regex: /&amp;amp;/,
      message: "Double-encoded ampersand",
      detail: "Use '&amp;' or '&' instead of '&amp;amp;'",
    },
    {
      regex: /\\x[0-9a-fA-F]{2}/,
      message: "Hex escape sequence",
      detail: "Do not use hex escape sequences (\\xNN). Use literal characters.",
    },
    {
      regex: /\\u[0-9a-fA-F]{4}/,
      message: "Unicode escape sequence",
      detail: "Do not use unicode escape sequences (\\uNNNN). Use literal characters.",
    },
    {
      regex: /%[0-9a-fA-F]{2}/,
      message: "URL-encoded character",
      detail: "Do not use URL-encoded characters (%NN). Use literal characters.",
    },
    {
      regex: /&#\w+;/,
      message: "HTML entity detected",
      detail: "Use literal characters instead of HTML entities (e.g., '&' instead of '&#x26;')",
    },
    {
      regex: /\\n/g,
      message: "Literal newline character",
      detail: "Replace '\\n' with '<br/>' for newlines in labels.",
    },
    {
      regex: /<(?!\/?br\s*\/?)(\/?[a-z][a-z0-9]*)\b[^>]*>/gi,
      message: "Unsupported HTML tag",
      detail: "HTML tags (except <br/>) are not allowed in Mermaid diagrams.",
    },
  ];

  globalPatterns.forEach(({ regex, message, detail }) => {
    if (regex.test(content)) {
      errors.push({ severity: "error", message, detail });
    }
  });

  // Special check for nested double quotes in flowcharts
  if (validType === "flowchart" || validType === "graph") {
    // Ignore escaped quotes for this check
    const cleanContent = content.replace(/\\"/g, " ");
    const nestedQuoteRegex = /[[({][^\])}]*"[^"\])}]*"[^"\])}]*"[^\])}]*[\])}]/;
    if (nestedQuoteRegex.test(cleanContent)) {
      errors.push({
        message: "Nested double quotes",
        detail:
          "Double quotes should not be used inside other double quotes. Use single quotes ('...') for internal emphasis within a [\"...\"] label.",
      });
    }
  }

  return errors;
}
