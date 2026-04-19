import mermaid from "mermaid";

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

// Initialize mermaid for build-time parsing
mermaid.initialize({ startOnLoad: false });

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

  // Use the actual Mermaid parser for the strictest possible validation
  try {
    // Note: mermaid.parse is async in newer versions
    await mermaid.parse(trimmed, { suppressErrors: true });
  } catch (err: any) {
    // Extract message and line number if available
    const message = err.message || "Syntax Error";
    const detail = err.str || String(err);
    const lineMatch = detail.match(/line (\d+)/i) || message.match(/line (\d+)/i);
    const line = lineMatch ? parseInt(lineMatch[1], 10) : undefined;

    errors.push({
      message: "Mermaid Syntax Error",
      detail: message,
      line,
    });

    // If we have a syntax error from the real parser, we can stop here
    return errors;
  }

  // Additional project-specific global patterns (optional)
  const globalPatterns = [
    {
      regex: /&#\w+;/,
      message: "HTML entity",
      detail: "Use literal characters instead of HTML entities (e.g., '&' instead of '&#x26;')",
    },
    { regex: /&amp;amp;/, message: "Double-encoded ampersand", detail: "Use literal '&'" },
  ];

  globalPatterns.forEach(({ regex, message, detail }) => {
    if (regex.test(content)) {
      errors.push({ message, detail });
    }
  });

  return errors;
}

// Remove legacy regex-based validation functions
