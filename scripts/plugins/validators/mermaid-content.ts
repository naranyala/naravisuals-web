/**
 * Mermaid Content Validation Helper
 *
 * Used by mermaid.ts plugin to validate diagram content at build-time.
 */

interface ValidationError {
  message: string;
  detail: string;
}

// Valid Mermaid diagram types
const VALID_DIAGRAM_TYPES = [
  "graph",
  "flowchart",
  "sequenceDiagram",
  "classDiagram",
  "classDiagram-v2",
  "stateDiagram",
  "stateDiagram-v2",
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
  "block-beta",
  "packet",
  "packet-beta",
  "zendao-c4",
  "c4Context",
  "c4Container",
  "c4Component",
  "c4Dynamic",
  "c4Deployment",
];

// Patterns that indicate invalid or corrupted content
const INVALID_PATTERNS = [
  // Match HTML entities that represent special characters (not common ones like &amp; &lt; &gt;)
  { pattern: /&(?:#x[0-9a-fA-F]+|#\d+|[a-z]+);?/gi, message: "HTML entity in diagram", filter: (match: string) => {
    // Allow common valid entities
    const allowed = ['&amp;', '&lt;', '&gt;', '&quot;', '&apos;', '&nbsp;'];
    return !allowed.includes(match.toLowerCase());
  }},
  { pattern: /&amp;&amp;/gi, message: "Double-encoded ampersand" },
  { pattern: /\\x[0-9a-fA-F]{2}/g, message: "Hex escape sequence in content" },
  { pattern: /\\u[0-9a-fA-F]{4}/g, message: "Unicode escape sequence in content" },
  { pattern: /%[0-9a-fA-F]{2}/g, message: "URL-encoded character in content" },
];

/**
 * Validate Mermaid diagram content
 * Returns array of validation errors (empty if valid)
 */
export function validateMermaidContent(
  content: string,
  _filePath: string = "unknown"
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Trim and check for empty content
  const trimmed = content.trim();
  if (!trimmed) {
    errors.push({
      message: "Empty diagram",
      detail: "Diagram contains no content.",
    });
    return errors;
  }

  // Check for invalid patterns
  for (const { pattern, message, filter } of INVALID_PATTERNS) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      // Apply filter if provided to exclude allowed patterns
      const filteredMatches = filter 
        ? matches.filter(m => filter(m))
        : matches;
      
      if (filteredMatches.length > 0) {
        errors.push({
          message,
          detail: `Found: ${filteredMatches.slice(0, 3).join(", ")}`,
        });
      }
    }
  }

  // Check for empty or invalid quotes
  validateQuotes(content, errors);

  // Check for balanced brackets
  validateBalancedBrackets(content, errors);

  // Check diagram type
  validateDiagramType(content, errors);

  return errors;
}

/**
 * Validate quotes in diagram content
 */
function validateQuotes(content: string, errors: ValidationError[]): void {
  // Check for empty quotes
  const emptyQuotes = content.match(/["']\s*["']/g);
  if (emptyQuotes && emptyQuotes.length > 0) {
    errors.push({
      message: "Empty quotes detected",
      detail: `Found: ${emptyQuotes.slice(0, 3).join(", ")}. Labels must have meaningful content.`,
    });
  }

  // Check for quotes with only special characters
  const allQuotes = content.match(/["'][^"']*["']/g);
  if (allQuotes) {
    const invalidOnes = allQuotes.filter((q) => {
      const inner = q.slice(1, -1).trim();
      return inner.length > 0 && !/[a-zA-Z0-9\u00C0-\u024F\u4E00-\u9FFF]/.test(inner);
    });
    if (invalidOnes.length > 0) {
      errors.push({
        message: "Quotes contain only special characters",
        detail: `Found: ${invalidOnes.slice(0, 3).join(", ")}. Text must contain alphanumeric characters.`,
      });
    }
  }
}

/**
 * Validate balanced brackets
 */
function validateBalancedBrackets(content: string, errors: ValidationError[]): void {
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  const openBrackets = (content.match(/\[/g) || []).length;
  const closeBrackets = (content.match(/\]/g) || []).length;
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;

  const imbalances: string[] = [];
  if (openBraces !== closeBraces) {
    imbalances.push(`{${openBraces} vs }${closeBraces}`);
  }
  if (openBrackets !== closeBrackets) {
    imbalances.push(`[${openBrackets} vs ]${closeBrackets}`);
  }
  if (openParens !== closeParens) {
    imbalances.push(`(${openParens} vs )${closeParens}`);
  }

  if (imbalances.length > 0) {
    errors.push({
      message: "Unbalanced brackets",
      detail: `Found: ${imbalances.join(", ")}`,
    });
  }
}

/**
 * Validate diagram starts with a valid type
 */
function validateDiagramType(content: string, errors: ValidationError[]): void {
  const firstLine = content.split("\n")[0].trim().toLowerCase();

  // Allow directives
  if (firstLine.startsWith("%%")) {
    return;
  }

  const hasValidType = VALID_DIAGRAM_TYPES.some((type) =>
    firstLine.startsWith(type.toLowerCase())
  );

  if (!hasValidType) {
    errors.push({
      message: "Invalid diagram type",
      detail: `Must start with valid diagram type. Found: "${firstLine.substring(0, 50)}"`,
    });
  }
}
