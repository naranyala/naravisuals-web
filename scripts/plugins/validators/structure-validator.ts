/**
 * Structure Validator Plugin
 *
 * Checks for:
 * - List marker consistency (mixing * and - in same file)
 * - Malformed table markers
 */

import type { MarkdownValidator, ValidationIssue, ValidationResult } from "./types.ts";

function stripCodeBlocks(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let fenceLength = 0;
  let inCodeBlock = false;

  for (const line of lines) {
    const match = line.match(/^(`{3,})/);
    if (match?.[1]) {
      const length = match[1].length;
      if (!inCodeBlock) {
        inCodeBlock = true;
        fenceLength = length;
        continue;
      } else if (length >= fenceLength) {
        inCodeBlock = false;
        continue;
      }
    }
    if (!inCodeBlock) {
      result.push(line);
    }
  }
  return result.join("\n");
}

export const structureValidator: MarkdownValidator = {
  name: "structure",
  label: "Markdown Structure",
  isStrict: false,

  validate(content: string, filePath: string): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Strip code blocks to avoid false positives (e.g., JSDoc *)
    const contentWithoutCodeBlocks = stripCodeBlocks(content);

    // 1. List Consistency
    const dashMatches = (contentWithoutCodeBlocks.match(/^[ \t]*- /gm) || []).length;
    const starMatches = (contentWithoutCodeBlocks.match(/^[ \t]*\* /gm) || []).length;

    if (dashMatches > 0 && starMatches > 0) {
      issues.push({
        severity: "warning",
        file: filePath,
        message: "Inconsistent list markers detected",
        detail: `Found ${dashMatches} items using '-' and ${starMatches} items using '*'. Stick to one style for better visual consistency.`,
      });
    }

    // 2. Malformed Tables (loose check)
    // Common error: | Header | Header | without trailing | or with mismatched separator count
    const tableLines = content
      .split("\n")
      .filter((l) => l.trim().startsWith("|") && l.includes("|"));
    for (const line of tableLines) {
      const trimmed = line.trim();
      const pipeCount = (trimmed.match(/\|/g) || []).length;

      // Basic check: should have at least 2 pipes for a cell
      if (pipeCount < 2) {
        issues.push({
          severity: "info",
          file: filePath,
          message: "Potential malformed table row",
          detail: `Line: "${trimmed}" has very few pipes. Ensure tables are correctly formatted.`,
        });
      }
    }

    return {
      checked: dashMatches + starMatches + tableLines.length,
      issues,
      stats: {
        dashLists: dashMatches,
        starLists: starMatches,
        tableRows: tableLines.length,
      },
    };
  },
};
