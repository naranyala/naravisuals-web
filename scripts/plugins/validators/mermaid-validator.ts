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
 *
 * Reports file path and specific line numbers for each error.
 */

import { validateMermaidContent } from "./mermaid-content.ts";
import type { MarkdownValidator, ValidationIssue, ValidationResult } from "./types.ts";

export const mermaidValidator: MarkdownValidator = {
  name: "mermaid-content",
  label: "Mermaid Content Validator (Advisory Rules)",
  isStrict: true,

  async validate(content: string, filePath: string): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const lines = content.split("\n");
    let inMermaidBlock = false;
    let blockStartLine = 0;
    let diagramLines: string[] = [];
    let diagramLineNumbers: number[] = [];
    let mermaidCount = 0;
    let validCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;

      const lineNumber = i + 1;
      const fenceMatch = line.match(/^(```|~~~)(\w+)?(.*)$/);

      if (fenceMatch && !inMermaidBlock) {
        const language = fenceMatch[2] || "";
        if (language.toLowerCase() === "mermaid") {
          inMermaidBlock = true;
          blockStartLine = lineNumber;
          diagramLines = [];
          diagramLineNumbers = [];
          mermaidCount++;
        }
      } else if (inMermaidBlock && line.match(/^(```|~~~)\s*$/)) {
        // End of mermaid block - validate the content
        const diagramContent = diagramLines.join("\n").trim();

        const validationErrors = await validateMermaidContent(diagramContent, filePath);

        for (const error of validationErrors as any[]) {
          // Extract line number from error detail if available
          const lineMatch = (error.detail || "").match(/Line (\d+)/);
          const errorLineNum = lineMatch ? parseInt(lineMatch[1], 10) : 0;
          const actualLineNumber =
            errorLineNum > 0 ? blockStartLine + errorLineNum : blockStartLine;

          issues.push({
            severity: error.severity || "error",
            file: filePath,
            line: actualLineNumber,
            message: `[${filePath}:${actualLineNumber}] ${error.message}`,
            detail: `${error.detail || ""} (diagram line ${errorLineNum || "N/A"})`,
          });
        }

        if (validationErrors.length === 0) {
          validCount++;
        } else {
          invalidCount++;
        }

        inMermaidBlock = false;
        diagramLines = [];
        diagramLineNumbers = [];
      } else if (inMermaidBlock) {
        diagramLines.push(line);
        diagramLineNumbers.push(lineNumber);
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
