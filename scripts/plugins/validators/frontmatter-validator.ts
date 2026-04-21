/**
 * Frontmatter Validator Plugin
 *
 * Extracts and exposes all frontmatter data from markdown files.
 * This is NOT strict - only informs about frontmatter presence and content.
 *
 * Purpose: Help LLM-code-agents understand article metadata and
 * identify opportunities to enrich or standardize frontmatter.
 */

import type { MarkdownValidator, ValidationIssue, ValidationResult } from "./types.ts";

interface FrontmatterData {
  title?: string;
  description?: string;
  sidebar_label?: string;
  sidebar_position?: number;
  tags?: string[];
  date?: string;
  author?: string;
  [key: string]: any;
}

export const frontmatterValidator: MarkdownValidator = {
  name: "frontmatter",
  label: "Frontmatter Inspector",
  isStrict: false,

  validate(content: string, filePath: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    const frontmatter = extractFrontmatter(content);
    const stats: Record<string, any> = {
      hasFrontmatter: frontmatter !== null,
      fieldCount: 0,
    };

    if (frontmatter === null) {
      issues.push({
        severity: "info",
        file: filePath,
        message: "No frontmatter found",
        detail:
          "Add frontmatter at the beginning of your file. Example:\n---\ntitle: Article Title\ndescription: A brief overview.\nsidebar_label: Short Label\nsidebar_position: 1\n---",
      });
      return {
        checked: 0,
        issues,
        stats,
      };
    }

    // Extract all fields
    const fields = Object.keys(frontmatter);
    stats.fieldCount = fields.length;
    stats.fields = fields;

    // Track which standard fields are present
    const standardFields = ["title", "description", "sidebar_label", "sidebar_position"];
    const presentStandardFields = standardFields.filter((f) => frontmatter[f] !== undefined);
    const missingStandardFields = standardFields.filter((f) => frontmatter[f] === undefined);

    stats.standardFields = {
      present: presentStandardFields,
      missing: missingStandardFields,
    };

    // Store full frontmatter data for LLM use
    stats.data = frontmatter;

    // Provide guidance for LLM-code-agents
    if (missingStandardFields.length > 0) {
      issues.push({
        severity: "info",
        file: filePath,
        message: `Missing ${missingStandardFields.length} standard field(s): ${missingStandardFields.join(", ")}`,
        detail: `Consider adding: ${missingStandardFields.map((f) => `${f}: value`).join(", ")}`,
      });
    }

    // Check for empty or placeholder values
    const emptyFields = fields.filter(
      (f) =>
        frontmatter[f] === "" ||
        frontmatter[f] === "TODO" ||
        frontmatter[f] === "FIXME" ||
        frontmatter[f] === "TBD"
    );

    if (emptyFields.length > 0) {
      issues.push({
        severity: "info",
        file: filePath,
        message: `${emptyFields.length} field(s) with empty/placeholder values: ${emptyFields.join(", ")}`,
        detail: "Consider filling in these fields with actual content",
      });
    }

    return {
      checked: fields.length,
      issues,
      stats,
    };
  },
};

/**
 * Extract frontmatter from markdown content.
 * Returns null if no frontmatter found.
 */
function extractFrontmatter(content: string): FrontmatterData | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatterStr = match[1];
  if (frontmatterStr === undefined) return null;
  const data: FrontmatterData = {};

  // Parse key-value pairs
  const lines = frontmatterStr.split("\n");
  let currentKey: string | null = null;
  let currentList: string[] | null = null;

  for (const line of lines) {
    // Check if this is a list item under the current key
    const listMatch = line.match(/^\s+-\s+(.+)$/);
    if (listMatch && currentKey && currentList !== null) {
      currentList.push((listMatch[1] || "").trim().replace(/^["']|["']$/g, ""));
      continue;
    }

    // Flush previous list if any
    if (currentKey && currentList !== null) {
      data[currentKey as string] = currentList;
      currentKey = null;
      currentList = null;
    }

    // Check for key: value
    const kvMatch = line.match(/^(\w[\w_-]*):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const value = (kvMatch[2] || "").trim().replace(/^["']|["']$/g, "");

      if (key !== undefined) {
        if (value === "") {
          // Might be a list on following lines
          currentKey = key;
          currentList = [];
        } else if (value.startsWith("[")) {
          // Inline array
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value.split(",").map((t) => t.trim().replace(/["']/g, ""));
          }
        } else if (/^\d+$/.test(value)) {
          // Number
          data[key] = Number.parseInt(value, 10);
        } else if (/^\d+\.\d+$/.test(value)) {
          // Float
          data[key] = Number.parseFloat(value);
        } else if (value === "true" || value === "false") {
          // Boolean
          data[key] = value === "true";
        } else {
          // String
          data[key] = value;
        }
      }
    }
  }

  // Flush final list if any
  if (currentKey && currentList !== null) {
    data[currentKey as string] = currentList;
  }

  return data;
}

export default frontmatterValidator;
