/**
 * Mermaid Content Validation Helper
 *
 * Used by mermaid.ts plugin to validate diagram content at build-time.
 * Focuses only on critical issues that break rendering.
 */

interface ValidationError {
  message: string;
  detail: string;
}

const VALID_DIAGRAM_TYPES = [
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
  "block",
  "packet",
  "c4Context",
  "c4Container",
  "c4Component",
  "c4Dynamic",
  "c4Deployment",
];

/**
 * Validate only critical issues that break mermaid rendering
 */
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

  // 1. Encoded ampersand
  if (/&#x26;+/.test(content)) {
    errors.push({ message: "Encoded ampersand", detail: "Use literal '&'" });
  }

  // 2. HTML tags
  if (/<br\s*\/?>/gi.test(content)) {
    errors.push({ message: "Invalid <br/> tag", detail: "Use \\n in label" });
  }
  if (/<[a-z][^>]*>/gi.test(content)) {
    errors.push({ message: "HTML tag in diagram", detail: "Remove HTML tags" });
  }

  // 3. Check diagram type
  const firstLine = content.split("\n")[0].trim().toLowerCase();
  if (firstLine.startsWith("%%")) {
    // directives allowed
  } else if (!VALID_DIAGRAM_TYPES.some((t) => firstLine.startsWith(t.toLowerCase()))) {
    errors.push({
      message: "Invalid diagram type",
      detail: `Use: ${VALID_DIAGRAM_TYPES.join(", ")}`,
    });
  }

  return errors;
}
