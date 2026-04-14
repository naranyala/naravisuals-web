/**
 * Admonition Validator Plugin
 *
 * Validates and tracks admonition blocks across markdown content.
 * Reports enrichment statistics and recommendations.
 * NOT strict - only informs about enrichment opportunities.
 */

import type { MarkdownValidator, ValidationIssue, ValidationResult } from "./types.ts";

const ADMONITION_TYPES = [
  "note",
  "tip",
  "warning",
  "danger",
  "caution",
  "info",
  "important",
  "seealso",
];

export const admonitionValidator: MarkdownValidator = {
  name: "admonitions",
  label: "Admonition Tracker",
  isStrict: false,

  validate(content: string, filePath: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    const lines = content.split("\n");
    const typeCounts: Record<string, number> = {};
    let totalAdmonitions = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^:::(\w+)/);
      if (match) {
        const type = match[1].toLowerCase();
        totalAdmonitions++;
        typeCounts[type] = (typeCounts[type] || 0) + 1;

        if (!ADMONITION_TYPES.includes(type)) {
          issues.push({
            severity: "warning",
            file: filePath,
            line: i + 1,
            message: `Unknown admonition type: ${type}`,
            detail: `Valid types: ${ADMONITION_TYPES.join(", ")}`,
          });
        }
      }
    }

    if (totalAdmonitions === 0) {
      issues.push({
        severity: "info",
        file: filePath,
        message: "No admonitions found - enrichment candidate",
        detail: "Consider adding :::tip, :::warning, :::note for context and clarity",
      });
    }

    return {
      checked: totalAdmonitions,
      issues,
      stats: {
        total: totalAdmonitions,
        ...typeCounts,
      },
    };
  },
};

export default admonitionValidator;
