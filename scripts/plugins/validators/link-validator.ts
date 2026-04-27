/**
 * Internal Link Validator Plugin (STRICT)
 *
 * Validates all internal markdown links to ensure they point to valid slugs.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { paths } from "../../core/paths.ts";
import type { MarkdownValidator, ValidationIssue, ValidationResult } from "./types.ts";

// Helper to get all valid slugs in the project
let cachedSlugs: Set<string> | null = null;

function getValidSlugs(): Set<string> {
  if (cachedSlugs) return cachedSlugs;

  const slugs = new Set<string>();
  const docsDir = path.join(paths.root, "docs");
  const blogDir = path.join(paths.root, "blog");

  const scan = (dir: string, prefix = "", section: "docs" | "blog") => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        scan(path.join(dir, entry.name), `${prefix}${entry.name.replace(/^\d{2}-/, "")}/`, section);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const name = entry.name.replace(/^\d{2}-/, "").replace(/\.md$/, "");
        const slug = section === "blog" ? `blog/${prefix}${name}` : `${prefix}${name}`;
        slugs.add(slug);
      }
    }
  };

  scan(docsDir, "", "docs");
  scan(blogDir, "", "blog");

  // Add welcome as special case
  slugs.add("welcome");

  cachedSlugs = slugs;
  return slugs;
}

export const linkValidator: MarkdownValidator = {
  name: "links",
  label: "Internal Link Validator",
  isStrict: true,

  validate(content: string, filePath: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    const validSlugs = getValidSlugs();
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let checkedCount = 0;

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;

      const matches = Array.from(line.matchAll(linkRegex));
      for (const match of matches) {
        const href = match[2];
        const text = match[1];

        if (href === undefined || text === undefined) continue;

        // Only validate internal links starting with /docs/, /blog/, ./docs/, or ../docs/
        const isInternal =
          href.startsWith("/docs/") ||
          href.startsWith("/blog/") ||
          href.startsWith("./docs/") ||
          href.startsWith("../docs/");

        if (!isInternal) continue;

        checkedCount++;

        // Special check for 00-introduction.md -> 00-abstract.md rename suggestion
        if (href.includes("00-introduction.md")) {
          const abstractPath = path.join(paths.root, "docs", "00-abstract.md");
          if (fs.existsSync(abstractPath)) {
            issues.push({
              severity: "warning",
              file: filePath,
              line: i + 1,
              message: `Outdated reference to 00-introduction.md`,
              detail: `Found reference to "00-introduction.md". Consider renaming it to "00-abstract.md" as it now exists.`,
            });
          }
        }

        // Strip anchor fragments and leading slash
        const cleanHref = (href.split("?")[0] || "").split("#")[0]?.replace(/^\//, "") || "";
        // Strip docs/ prefix for comparison with slugs
        const slug = cleanHref.startsWith("docs/") ? cleanHref.slice(5) : cleanHref;

        if (!validSlugs.has(slug)) {
          issues.push({
            severity: "error",
            file: filePath,
            line: i + 1,
            message: `Broken internal link: "${text}" → "${href}"`,
            detail: `Slug "${slug}" was not found in the documentation tree.`,
          });
        }
      }
    }

    return {
      checked: checkedCount,
      issues,
    };
  },
};

export default linkValidator;
