/**
 * Image Validator Plugin
 *
 * Checks for:
 * - Missing alt text for images (accessibility)
 * - Empty image sources
 */

import type { MarkdownValidator, ValidationIssue, ValidationResult } from "./types.ts";

export const imageValidator: MarkdownValidator = {
  name: "images",
  label: "Image Accessibility",
  isStrict: true,

  validate(content: string, filePath: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    let checked = 0;

    // Regex for images: ![alt](src)
    const imageRegex = /!\[([^\]]*)\]\(([^)]*)\)/g;
    let match: RegExpExecArray | null;

    while (true) {
      match = imageRegex.exec(content);
      if (match === null) break;

      checked++;
      const altText = match[1]?.trim() || "";
      const src = match[2]?.trim() || "";

      if (src === "") {
        issues.push({
          severity: "error",
          file: filePath,
          message: "Empty image source detected",
          detail: "All images must have a source path or URL.",
        });
      }

      if (altText === "") {
        issues.push({
          severity: "warning",
          file: filePath,
          message: "Missing alt text for image",
          detail: `Image with source "${src}" is missing alternative text. Alt text is essential for accessibility.`,
        });
      }
    }

    return {
      checked,
      issues,
      stats: {
        imageCount: checked,
      },
    };
  },
};
