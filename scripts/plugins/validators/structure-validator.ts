/**
 * Structure Validator Plugin
 *
 * Checks for:
 * - List marker consistency (mixing * and - in same file)
 * - Malformed table markers
 */

import type { MarkdownValidator, ValidationIssue, ValidationResult } from "./types.ts";

export const structureValidator: MarkdownValidator = {
  name: "structure",
  label: "Markdown Structure",
  isStrict: false,

  validate(content: string, filePath: string): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Strip code blocks to avoid false positives (e.g., JSDoc *)
    const contentWithoutCodeBlocks = content.replace(
      /`{3,}[\s\S]*?`{3,}/g,
      ""
    );

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
