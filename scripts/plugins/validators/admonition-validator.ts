/**
 * Admonition Validator Plugin
 *
 * Validates and tracks admonition blocks across markdown content.
 * Reports one-line stats summary per file with compact type codes.
 * NOT strict - only stats/info.
 */

import type { MarkdownValidator, ValidationIssue, ValidationResult } from "./types.ts";

// Compact type code mapping for shorter output
const TYPE_CODES: Record<string, string> = {
  note: "n",
  tip: "t",
  info: "i",
  warning: "w",
  danger: "d",
  caution: "c",
};

function getTypeCode(type: string): string {
  const lower = type.toLowerCase();
  const firstChar = lower[0];
  return TYPE_CODES[lower] || (firstChar !== undefined ? firstChar : "x");
}

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
      if (line === undefined) continue;
      const match = line.match(/^(:::|!!!)(\w+)/);
      if (match && match[2] !== undefined) {
        const type = match[2].toLowerCase();
        totalAdmonitions++;
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    }

    let message = "";
    if (totalAdmonitions === 0) {
      message = "✓ No admonitions";
    } else {
      // Sort types alphabetically and use compact codes
      const breakdown = Object.entries(typeCounts)
        .sort(([typeA], [typeB]) => typeA.localeCompare(typeB))
        .map(([type, count]) => `${getTypeCode(type)}:${count}`)
        .join(" ");
      message = `${totalAdmonitions} adm (${breakdown})`;
    }

    issues.push({
      severity: "info",
      file: filePath,
      message,
    });

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
