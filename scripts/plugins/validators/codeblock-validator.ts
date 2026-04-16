/**
 * Codeblock Validator Plugin
 *
 * Validates that all code blocks have descriptions.
 * This is a STRICT validation - fails the build if any are missing.
 */

import type { MarkdownValidator, ValidationIssue, ValidationResult } from "./types.ts";

function categorizeLanguage(lang: string): string {
  const lower = lang.toLowerCase();

  if (lower === "mermaid") return "Mermaid";
  if (["txt", "text", "plain", "plaintext"].includes(lower)) return "Text/TXT";
  if (["json", "yaml", "yml", "toml", "xml", "csv", "sql"].includes(lower)) return "Data Format";
  if (["html", "markdown", "md", "latex", "tex"].includes(lower)) return "Markup";
  if (
    ["bash", "sh", "shell", "zsh", "fish", "powershell", "cmd", "console", "terminal"].includes(
      lower
    )
  )
    return "Shell/Terminal";
  if (["ini", "cfg", "config", "env", "properties"].includes(lower)) return "Configuration";
  if (["glsl", "hlsl", "shader"].includes(lower)) return "Shader/3D";
  if (lower === "unknown" || lower === "") return "Unspecified";

  return "Programming Language";
}

export const codeblockValidator: MarkdownValidator = {
  name: "codeblock-descriptions",
  label: "Codeblock Description Validator",
  isStrict: true,

  validate(content: string, filePath: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    const lines = content.split("\n");
    let inCodeBlock = false;
    let startLine = 0;
    let codeBlocksCount = 0;
    let withDescription = 0;
    let withoutDescription = 0;

    const categoryStats: Record<string, { total: number; withDesc: number; withoutDesc: number }> =
      {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const fenceMatch = line.match(/^(```|~~~)(\w+)?(.*)$/);

      if (fenceMatch && !inCodeBlock) {
        inCodeBlock = true;
        startLine = i + 1;
        const language = fenceMatch[2] || "unknown";
        const infoString = fenceMatch[3] || "";

        const descMatch = infoString.match(/(?:^|:)desc(?:ription)?\s*=\s*([^:]+?)(?=:|$)/);
        const hasDesc = !!descMatch;

        const category = categorizeLanguage(language);
        if (!categoryStats[category]) {
          categoryStats[category] = { total: 0, withDesc: 0, withoutDesc: 0 };
        }
        categoryStats[category].total++;
        codeBlocksCount++;

        if (hasDesc) {
          categoryStats[category].withDesc++;
          withDescription++;
        } else {
          categoryStats[category].withoutDesc++;
          withoutDescription++;

          issues.push({
            severity: "error",
            file: filePath,
            line: startLine,
            message: `Codeblock missing description`,
            detail: `Provide a description for the codeblock using the :desc= attribute. For example: \`\`\`${language}:desc=A brief explanation of the code's purpose.`,
          });
        }
      } else if (inCodeBlock && line.match(/^(```|~~~)\s*$/)) {
        inCodeBlock = false;
      }
    }

    // Prepare the stats breakdown by codeblock type
    const breakdown: Record<string, number> = {};
    Object.entries(categoryStats).forEach(([key, data]) => {
      breakdown[key] = data.total;
    });

    // Create single-line codeblock summary message
    let message = "";
    if (codeBlocksCount === 0) {
      message = "Codeblocks: 0";
    } else {
      const typesStr = Object.entries(breakdown)
        .map(([type, count]) => `${type}:${count}`)
        .join(" ");
      message = `Codeblocks: ${codeBlocksCount} | ${typesStr} | withDesc:${withDescription} withoutDesc:${withoutDescription}`;
    }
    // Add summary one-liner for every file
    issues.push({
      severity: "info",
      file: filePath,
      message,
    });

    return {
      checked: codeBlocksCount,
      issues,
      stats: {
        total: codeBlocksCount,
        withDescription,
        withoutDescription,
        breakdown,
      },
    };
  },
};

export default codeblockValidator;
