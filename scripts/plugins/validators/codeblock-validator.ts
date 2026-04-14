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
            detail: `${language} codeblock at line ${startLine} has no desc= attribute`,
          });
        }
      } else if (inCodeBlock && line.match(/^(```|~~~)\s*$/)) {
        inCodeBlock = false;
      }
    }

    const statsRecord: Record<string, number> = {
      total: codeBlocksCount,
      withDescription,
      withoutDescription,
    };

    for (const [cat, data] of Object.entries(categoryStats)) {
      statsRecord[`${cat}_total`] = data.total;
    }

    return {
      checked: codeBlocksCount,
      issues,
      stats: statsRecord,
    };
  },
};

export default codeblockValidator;
