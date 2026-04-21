/**
 * Markdown file scanner and processor.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import glob from "fast-glob";
import { marked } from "marked";
import type { Highlighter } from "shiki";
import {
  type Diagnostics,
  validateCodeBlockDescriptions,
  validateFrontmatter,
} from "../diagnostics.ts";
import { plugins } from "../plugins/index.ts";
import { mermaidValidator } from "../plugins/validators/mermaid-validator.ts";
import { parseFrontmatter } from "./frontmatter.ts";
import { createCustomRenderer } from "./renderer.ts";
import { extractTOC } from "./toc.ts";
import type { DocEntry } from "./types.ts";

const KNOWN_FM_FIELDS = new Set([
  "title",
  "description",
  "sidebar_label",
  "sidebar_position",
  "date",
  "author",
  "tags",
  "slug",
]);

export async function scanMdFiles(
  baseDir: string,
  section: "docs" | "blog",
  diags: Diagnostics,
  highlighter: Highlighter
): Promise<DocEntry[]> {
  if (!fs.existsSync(baseDir)) return [];
  const entries: DocEntry[] = [];

  const files = await glob("**/*.md", { cwd: baseDir, absolute: true });

  for (const full of files) {
    const raw = fs.readFileSync(full, "utf-8");
    const relPath = path.relative(baseDir, full).replace(/\.md$/, "");
    const { fm, content } = parseFrontmatter(raw);

    // Validate frontmatter
    validateFrontmatter(fm, relPath, diags);

    // Extract numeric index prefix from filename
    const entryName = path.basename(full);
    const filename = entryName.replace(/\.md$/, "");
    const indexMatch = filename.match(/^(\d{2})-/);
    const fileIndex = indexMatch ? parseInt(indexMatch[1] || "0", 10) : null;

    const slugParts = relPath.split("/");
    const originalCategory = slugParts.length > 1 ? slugParts[0] : "";
    const category = slugParts.length > 1 ? (slugParts[0] || "").replace(/^\d{2}-/, "") : "";
    const cleanSlug = slugParts.map((part) => part.replace(/^\d{2}-/, "")).join("/");
    const slug = section === "blog" ? `blog/${cleanSlug}` : cleanSlug;

    const titleMatch = content.match(/^# (.+)$/m);
    const title =
      (fm.title as string) ||
      titleMatch?.[1] ||
      "" ||
      filename
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");

    // Run preProcess plugins
    let processed = content;
    for (const plugin of plugins) {
      if (plugin.preProcess) {
        try {
          processed = plugin.preProcess(processed);
        } catch (err: any) {
          diags.error("plugin", relPath, `Plugin "${plugin.name}" preProcess failed`, err.message);
        }
      }
    }

    // Diagnostics
    validateCodeBlockDescriptions(content, relPath, diags);
    const mermaidResult = await mermaidValidator.validate(content, relPath);
    for (const issue of mermaidResult.issues) {
      diags.report({
        severity: issue.severity as any,
        source: "mermaid",
        file: relPath,
        message: issue.message,
        detail: issue.detail,
        line: issue.line,
      });
    }

    let html = "";
    let tokens: any[] = [];
    const renderer = createCustomRenderer(highlighter);

    try {
      tokens = marked.Lexer.lex(processed);
      html = marked.parse(processed, { renderer }) as any as string;
    } catch (err: any) {
      diags.error("content", relPath, "Markdown parsing failed", err.message);
    }

    // Fallback description
    let description = (fm.description as string) || "";
    if (!description) {
      const firstPara = html.match(/<p>(.*?)<\/p>/);
      if (firstPara && firstPara[1] !== undefined) {
        description = firstPara[1]
          .replace(/<[^>]*>/g, "")
          .slice(0, 160)
          .trim();
      }
    }

    // Run postProcess plugins in reverse order
    for (let i = plugins.length - 1; i >= 0; i--) {
      const plugin = plugins[i];
      if (plugin?.postProcess) {
        try {
          html = await (plugin.postProcess as any)(html);
        } catch (err: any) {
          diags.error("plugin", relPath, `Plugin "${plugin.name}" postProcess failed`, err.message);
        }
      }
    }

    const pos = fileIndex !== null ? fileIndex : parseInt(fm.sidebar_position as string, 10) || 999;
    const metadata: Record<string, string | string[]> = {};
    for (const [key, val] of Object.entries(fm)) {
      if (!KNOWN_FM_FIELDS.has(key) && val !== undefined) {
        metadata[key] = Array.isArray(val) ? val.map(String) : String(val);
      }
    }

    entries.push({
      id: slug,
      slug,
      title,
      sidebar_label: (fm.sidebar_label as string) || title,
      sidebar_position: section === "blog" ? 9000 + pos : pos,
      category: section === "blog" ? "blog" : category,
      original_category: section === "blog" ? undefined : originalCategory || undefined,
      description,
      content: html,
      rawContent: content,
      toc: extractTOC(tokens),
      date: fm.date as string | undefined,
      author: fm.author as string | undefined,
      tags: fm.tags as string[] | undefined,
      section,
      metadata,
      ast: tokens,
    });
  }

  return entries;
}
