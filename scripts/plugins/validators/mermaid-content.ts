/**
 * Mermaid Content Validation Helper
 *
 * Used by mermaid.ts plugin to validate diagram content at build-time.
 * This validator implements a strict set of rules to catch common Mermaid.js
 * syntax errors before they reach the renderer.
 */

interface ValidationError {
  message: string;
  detail: string;
  line?: number;
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
];

const RESERVED_KEYWORDS = new Set([
  "graph",
  "flowchart",
  "sequenceDiagram",
  "classDiagram",
  "stateDiagram",
  "erDiagram",
  "gantt",
  "pie",
  "mindmap",
  "journey",
  "gitGraph",
  "subgraph",
  "end",
  "style",
  "class",
  "classDef",
  "direction",
]);

export function validateMermaidContent(
  content: string,
  _filePath: string = "unknown"
): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = content.trim();

  if (!trimmed) {
    errors.push({ message: "Empty diagram", detail: "Diagram contains no content." });
    return errors;
  }

  // 1. Strip directives for type checking
  const contentWithoutDirectives = trimmed.replace(/%%\{[\s\S]*?\}%%/g, "").trim();
  if (!contentWithoutDirectives) {
    errors.push({ message: "Empty diagram", detail: "Diagram contains only directives." });
    return errors;
  }

  const lines = contentWithoutDirectives.split("\n");

  // Find the first line that isn't a custom metadata line (starts with ':')
  const firstActualLineIndex = lines.findIndex((line) => !line.trim().startsWith(":"));

  if (firstActualLineIndex === -1) {
    errors.push({
      message: "Invalid diagram content",
      detail: "Diagram contains only metadata. No valid Mermaid type found.",
    });
    return errors;
  }

  const firstLine = lines[firstActualLineIndex].trim();
  const firstLineLower = firstLine.toLowerCase();

  // 2. Diagram Type Validation
  const validType = VALID_DIAGRAM_TYPES.find((t) => firstLineLower.startsWith(t.toLowerCase()));
  if (!validType) {
    errors.push({
      message: "Invalid diagram type",
      detail: `The diagram must start with a valid type. Allowed: ${VALID_DIAGRAM_TYPES.join(", ")}`,
    });
    return errors;
  }

  // 3. Global Pattern-based checks (Critical rendering issues)
  const globalPatterns = [
    {
      regex: /<br\s*\/?>/gi,
      message: "Invalid <br/> tag",
      detail: "Replace <br/> with '\\n' for newlines in labels.",
    },
    {
      regex: /&#\w+;/,
      message: "HTML entity",
      detail: "Use literal characters instead of HTML entities (e.g., '&' instead of '&#x26;')",
    },
    { regex: /&amp;amp;/, message: "Double-encoded ampersand", detail: "Use literal '&'" },
    {
      regex: /\\x[0-9a-fA-F]{2}/,
      message: "Hex escape sequence",
      detail: "Use literal characters instead of hex escapes.",
    },
    {
      regex: /\\u[0-9a-fA-F]{4}/,
      message: "Unicode escape sequence",
      detail: "Use literal characters instead of unicode escapes.",
    },
    {
      regex: /%[0-9a-fA-F]{2}/,
      message: "URL-encoded character",
      detail: "Use literal characters instead of URL encoding.",
    },
  ];

  globalPatterns.forEach(({ regex, message, detail }) => {
    if (regex.test(content)) {
      errors.push({ message, detail });
    }
  });

  // 4. Line-by-Line Validation
  let inQuote = false;
  let currentQuoteChar = "";
  const bracketStack: { char: string; line: number }[] = [];
  const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}" };

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("%%") || index === firstActualLineIndex) return;

    // Quote and Bracket tracking
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'" || char === "`") {
        if (!inQuote) {
          inQuote = true;
          currentQuoteChar = char;
        } else if (char === currentQuoteChar) {
          inQuote = false;
          currentQuoteChar = "";
        }
      } else if (!inQuote) {
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
      }
    }

    // Diagram-specific structural rules - Skip the first line (diagram type)
    if (index > 0) {
      if (validType === "flowchart") {
        validateFlowchartLine(trimmedLine, lineNum, errors);
      } else if (validType === "sequenceDiagram") {
        validateSequenceLine(trimmedLine, lineNum, errors);
      }
    }
  });

  if (inQuote) {
    errors.push({
      message: "Unclosed quote",
      detail: `Diagram ends with an unclosed quote starting with '${currentQuoteChar}'.`,
    });
  }

  if (bracketStack.length > 0) {
    errors.push({
      message: "Unbalanced brackets",
      detail: `Unclosed bracket '${bracketStack[bracketStack.length - 1].char}' opened at line ${bracketStack[bracketStack.length - 1].line}.`,
    });
  }

  return errors;
}

function validateFlowchartLine(line: string, lineNum: number, errors: ValidationError[]) {
  const trimmedLine = line.trim();
  if (trimmedLine === "end") return;

  // 1. Check for illegal arrow syntax (single ->)
  if (/\s->\s/.test(line) || /^->\s/.test(line) || /\s->$/.test(line)) {
    errors.push({
      message: "Invalid arrow syntax",
      detail: "Flowcharts must use '-->' or '---'. Single '->' is invalid.",
      line: lineNum,
    });
  }

  // 2. Node ID validation
  const parts = line.split(/-->|---/);

  parts.forEach((part, i) => {
    const trimmedPart = part.trim();
    if (!trimmedPart) return;

    // Ignore edge labels starting with '|'
    if (trimmedPart.startsWith("|")) return;

    // Handle subgraph, style, class, classDef keywords
    if (
      trimmedPart.startsWith("subgraph ") ||
      trimmedPart.startsWith("style ") ||
      trimmedPart.startsWith("class ") ||
      trimmedPart.startsWith("classDef ")
    ) {
      return;
    }

    // Extract the ID part (before any label [ ( {)
    const idMatch = trimmedPart.match(/^([^\[\(\{\s]+)/);
    if (idMatch) {
      const id = idMatch[1];

      // If it contains illegal characters and isn't quoted
      if (/[^a-zA-Z0-9_]/.test(id)) {
        if (!id.startsWith('"') && !id.startsWith("'") && !id.startsWith("`")) {
          errors.push({
            message: "Invalid node ID",
            detail: `Node ID '${id}' contains illegal characters. Use quotes: "${id}".`,
            line: lineNum,
          });
        }
      }

      // Reserved keyword check
      if (RESERVED_KEYWORDS.has(id.toLowerCase())) {
        if (!id.startsWith('"') && !id.startsWith("'") && !id.startsWith("`")) {
          errors.push({
            message: "Reserved keyword used as ID",
            detail: `The word '${id}' is a Mermaid reserved keyword. Wrap it in quotes: "${id}".`,
            line: lineNum,
          });
        }
      }
    }
  });

  // 3. Empty labels
  // Only flag if the brackets are not inside quotes
  if (/\s*\[\s*\]\s*$/.test(line) || /\s*\(\s*\)\s*$/.test(line) || /\s*\{\s*\}\s*$/.test(line)) {
    errors.push({
      message: "Empty node label",
      detail: "Node labels ([], (), {}) cannot be empty.",
      line: lineNum,
    });
  }
}

function validateSequenceLine(line: string, lineNum: number, errors: ValidationError[]) {
  // 1. Participant declaration check: participant Name as Alias
  if (line.startsWith("participant")) {
    const parts = line.split(/\s+/);
    if (parts.length < 2) {
      errors.push({
        message: "Invalid participant declaration",
        detail: "Participant declaration requires a name: 'participant Name'.",
        line: lineNum,
      });
    }
  }

  // 2. Arrow validation: sequence diagrams ONLY allow ->, ->>, -->>, -x
  const arrowRegex = /([^ \t\n\r\f\v]+)\s*(->>|-->>|->|-x)\s*([^ \t\n\r\f\v]+)/;
  if (!arrowRegex.test(line) && line.includes("->")) {
    if (
      !line.startsWith("Note") &&
      !line.startsWith("loop") &&
      !line.startsWith("alt") &&
      !line.startsWith("opt")
    ) {
      // transition’s generic structure check passed, but if it doesn't match the arrow regex,
      // and it's not a keyword, it's likely wrong.
    }
  }
}
