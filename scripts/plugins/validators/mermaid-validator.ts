/**
 * Mermaid Diagram Validator Plugin
 *
 * Strictly validates Mermaid diagram content to ensure:
 * - No empty diagrams
 * - No invalid characters or malformed syntax
 * - Proper use of quotes for labels/text
 * - No HTML entity encoded weird characters like &&x26;
 * - Valid diagram type declarations
 * - Balanced braces, brackets, parentheses
 * - No suspicious patterns that indicate corruption
 */

import type { MarkdownValidator, ValidationIssue, ValidationResult } from "./types.ts";
import { validateMermaidContent } from "./mermaid-content.ts";

export const mermaidValidator: MarkdownValidator = {
  name: "mermaid-content",
  label: "Mermaid Content Validator",
  isStrict: true,

  validate(content: string, filePath: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    const lines = content.split("\n");
    let inMermaidBlock = false;
    let startLine = 0;
    let diagramLines: string[] = [];
    let mermaidCount = 0;
    let validCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const fenceMatch = line.match(/^(```|~~~)(\w+)?(.*)$/);

      if (fenceMatch && !inMermaidBlock) {
        const language = fenceMatch[2] || "";
        if (language.toLowerCase() === "mermaid") {
          inMermaidBlock = true;
          startLine = i + 1;
          diagramLines = [];
          mermaidCount++;
        }
      } else if (inMermaidBlock && line.match(/^(```|~~~)\s*$/)) {
        // End of mermaid block - validate the content
        const diagramContent = diagramLines.join("\n").trim();
        
        const validationErrors = validateMermaidContent(diagramContent, filePath);
        
        for (const error of validationErrors) {
          issues.push({
            severity: "error",
            file: filePath,
            line: startLine,
            message: error.message,
            detail: error.detail,
          });
        }

        if (validationErrors.length === 0) {
          validCount++;
        } else {
          invalidCount++;
        }

        inMermaidBlock = false;
        diagramLines = [];
      } else if (inMermaidBlock) {
        diagramLines.push(line);
      }
    }

    return {
      checked: mermaidCount,
      issues,
      stats: {
        total: mermaidCount,
        valid: validCount,
        invalid: invalidCount,
      },
    };
  },
};

export default mermaidValidator;
