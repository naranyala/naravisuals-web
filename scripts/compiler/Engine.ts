/**
 * Documentation Compiler Engine
 * Orchestrates the full build pipeline.
 */

import * as path from "node:path";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import glob from "fast-glob";
import { marked } from "marked";
import type { Highlighter } from "shiki";
import { DocEntrySchema } from "../../src/shared/schemas.ts";
import { parseFrontmatter } from "../pipeline/frontmatter.ts";
import {
  cleanGeneratedDir,
  generateBarrelExports,
  generateDocFiles,
  generateSeoFiles,
  generateSidebar,
  generateTypes,
} from "../pipeline/generator.ts";
import {
  extractAllFootnotes,
  type FootnoteDefinition,
  generateReferencesMarkdown,
} from "../pipeline/references.ts";
import { buildSidebar } from "../pipeline/sidebar.ts";
import { extractTOC } from "../pipeline/toc.ts";
import { type CompilerContainer, createCompilerContainer } from "./container.ts";
import type { CompilerMiddleware } from "./Middleware.ts";
import type { CompilationUnit, CompilerConfig } from "./types.ts";

const docEntryValidator = TypeCompiler.Compile(DocEntrySchema);

/**
 * Utility to convert slug-style filenames to capitalized titles
 * e.g. "getting-started" -> "Getting Started"
 */
function capitalizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

const STOP_WORDS = new Set([
  // Basic grammar
  "the",
  "and",
  "a",
  "an",
  "in",
  "on",
  "at",
  "to",
  "for",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "of",
  "by",
  "from",
  "it",
  "its",
  "they",
  "them",
  "their",
  "this",
  "that",
  "these",
  "those",
  "which",
  "who",
  "whom",
  "can",
  "will",
  "would",
  "should",
  "could",
  "may",
  "might",
  "must",
  "if",
  "then",
  "else",
  "or",
  "as",
  "but",
  "not",
  "no",
  "yes",
  "all",
  "any",
  "each",
  "every",
  "some",
  "more",
  "most",
  "less",
  "least",
  "than",
  "then",
  "also",
  "very",
  "too",
  "own",
  "other",
  "such",
  "only",
  "well",
  "how",
  "when",
  "where",
  "why",
  "both",
  "either",
  "neither",
  "just",
  "even",
  "still",
  "back",
  "away",
  "out",
  "into",
  "onto",
  "over",
  "under",
  "again",
  "further",
  "once",
  "here",
  "there",
  "about",
  "above",
  "below",
  "up",
  "down",
  "left",
  "right",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  "me",
  "you",
  "him",
  "her",
  "us",
  "them",
  "this",
  "that",
  "these",
  "those",
  "am",
  "are",
  "is",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "shall",
  "will",
  "should",
  "would",
  "may",
  "might",
  "must",
  "can",
  "could",

  // Meta/Template words to hide across disciplines
  "example",
  "using",
  "used",
  "use",
  "within",
  "between",
  "through",
  "across",
  "during",
  "without",
  "following",
  "provides",
  "features",
  "allows",
  "support",
  "supported",
  "system",
  "tool",
  "project",
  "documentation",
  "files",
  "file",
  "build",
  "process",
  "details",
  "found",
  "available",
  "information",
  "Overview",
  "Section",
  "Table",
  "Contents",
  "Next",
  "Steps",
]);

export class DocumentationCompiler {
  private readonly container: CompilerContainer;
  private readonly middlewares: CompilerMiddleware[] = [];
  private units: CompilationUnit[] = [];
  private allFootnotes: FootnoteDefinition[] = [];

  constructor(config: CompilerConfig, highlighter?: Highlighter) {
    this.container = createCompilerContainer({ config, highlighter });
  }

  public use(middleware: CompilerMiddleware) {
    this.middlewares.push(middleware);
    return this;
  }

  public async compile() {
    this.container.logger.raw("🚀 Starting Documentation Compiler…");

    // 1. Ingest
    await this.scanDirectory(this.container.config.docsDir, "docs");

    // 1.1 Validate mandatory abstract
    const hasAbstract = this.units.some((u) => u.relPath === "00-abstract");
    if (!hasAbstract) {
      this.container.context.warn(
        "frontmatter",
        "docs/00-abstract.md",
        "Mandatory file missing: docs/00-abstract.md",
        "This file is required for the site abstract/home page."
      );
    }

    // 2. Process Units
    for (const unit of this.units) {
      await this.processUnit(unit);
    }

    // 2.1 Generate and Process Virtual Units (References)
    const refMarkdown = generateReferencesMarkdown(this.allFootnotes);
    const refUnit: CompilationUnit = {
      id: "references",
      filePath: path.join(this.container.config.docsDir, "references.md"),
      relPath: "references",
      rawContent: refMarkdown,
      section: "docs",
      rawMetadata: {
        title: "Footnote References",
        description: "Auto-generated list of all footnote references across documents.",
        tags: ["internal", "references", "footnotes"],
      },
    };
    await this.processUnit(refUnit);
    this.units.push(refUnit);

    // 3. Assemble (Global Analysis)
    for (const mw of this.middlewares) {
      if (mw.onAssemble) await mw.onAssemble(this.units, this.container);
    }

    // 4. Report
    console.log(this.container.context.formatReport());
    if (this.container.context.hasErrors()) {
      this.container.logger.raw(
        `⚠ Compilation completed with errors. Generating artifacts anyway...`
      );
    }

    // 5. Generate
    this.generate();
    this.generateWordStats();

    this.container.logger.raw(
      `✨ Compilation finished in ${Date.now() - this.container.context.startTime}ms`
    );
  }

  private generateWordStats() {
    const wordCounts: Record<string, number> = {};
    const filteredCounts: Record<string, number> = {};

    for (const unit of this.units) {
      if (!unit.rawContent) continue;

      // Clean markdown to get pure text
      const text = unit.rawContent
        .replace(/```[\s\S]*?```/g, " ") // Remove code blocks
        .replace(/`[^`]*`/g, " ") // Remove inline code
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // Remove images
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // Keep link text, remove URL
        .replace(/#+\s/g, " ") // Remove headers
        .replace(/[^a-zA-Z\s]/g, " ") // Remove punctuation/numbers/symbols
        .toLowerCase();

      const words = text.split(/\s+/);

      for (const word of words) {
        if (word.length < 3) continue;

        if (STOP_WORDS.has(word)) {
          filteredCounts[word] = (filteredCounts[word] || 0) + 1;
        } else {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      }
    }

    // Sort by frequency
    const sortedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 200)
      .map(([word, count]) => ({ word, count }));

    const sortedFiltered = Object.entries(filteredCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 200)
      .map(([word, count]) => ({ word, count }));

    const content = `// AUTO-GENERATED — DO NOT EDIT.
export const wordStats = ${JSON.stringify(sortedWords, null, 2)};
export const filteredStats = ${JSON.stringify(sortedFiltered, null, 2)};
`;
    this.container.fs.write(path.join(this.container.config.outputDir, "word-stats.ts"), content);
  }

  private async scanDirectory(baseDir: string, section: "docs" | "blog") {
    if (!this.container.fs.exists(baseDir)) return;

    const files = await glob("**/*.md", { cwd: baseDir, absolute: true });

    for (const fullPath of files) {
      const relPath = path.relative(baseDir, fullPath).replace(/\.md$/, "");
      const rawContent = this.container.fs.read(fullPath);

      const unit: CompilationUnit = {
        id: relPath,
        filePath: fullPath,
        relPath,
        rawContent,
        section,
      };

      for (const mw of this.middlewares) {
        if (mw.onIngest) await mw.onIngest(unit, this.container);
      }

      this.units.push(unit);
    }
  }

  private async processUnit(unit: CompilationUnit) {
    const { fm, content } = parseFrontmatter(unit.rawContent);
    unit.content = content;
    unit.rawMetadata = fm;

    // Metadata construction
    const filename = path.basename(unit.filePath).replace(/\.md$/, "");
    const cleanFilename = filename.replace(/^(\d{2}-)+/, "");
    const slugParts = unit.relPath.split("/");
    const category =
      slugParts.length > 1
        ? (slugParts[0] || "").replace(/^\d{2}-/, "")
        : unit.section === "blog"
          ? "blog"
          : "";
    const slug =
      unit.section === "blog"
        ? `blog/${unit.relPath.replace(/^\d{2}-/, "")}`
        : unit.relPath.replace(/\d{2}-/g, "");

    const knownFields = new Set([
      "title",
      "description",
      "sidebar_label",
      "sidebar_position",
      "date",
      "author",
      "tags",
      "slug",
    ]);
    const custom: Record<string, string | string[]> = {};
    for (const [k, v] of Object.entries(fm)) {
      if (!knownFields.has(k) && v !== undefined) {
        custom[k] = Array.isArray(v) ? v.map(String) : String(v);
      }
    }

    unit.metadata = {
      title: (fm.title as string) || capitalizeSlug(cleanFilename),
      description: (fm.description as string) || "",
      sidebar_label:
        (fm.sidebar_label as string) || (fm.title as string) || capitalizeSlug(cleanFilename),
      sidebar_position: parseInt(fm.sidebar_position as string, 10) || 999,
      category,
      original_category: slugParts.length > 1 ? slugParts[0] : "",
      slug,
      date: fm.date as string,
      author: fm.author as string,
      tags: Array.isArray(fm.tags) ? fm.tags.map(String) : undefined,
      custom,
    };

    // Middleware: Pre-Parse
    for (const mw of this.middlewares) {
      if (mw.onPreParse) await mw.onPreParse(unit, this.container);
    }

    // Parsing
    this.container.renderer.reset();
    const renderer = this.container.renderer.getRenderer();
    unit.tokens = marked.Lexer.lex(unit.content);

    // Collect footnotes (if not the references page itself)
    if (unit.id !== "references") {
      this.allFootnotes.push(...extractAllFootnotes(unit.tokens, unit.relPath));
    }

    // Middleware: Transform
    for (const mw of this.middlewares) {
      if (mw.onTransform) await mw.onTransform(unit, this.container);
    }

    unit.html = marked.parse(unit.content, { renderer }) as string;
    unit.toc = extractTOC(unit.tokens);

    // Fallback description
    if (unit.metadata && !unit.metadata.description && unit.html) {
      const firstPara = unit.html.match(/<p>(.*?)<\/p>/);
      if (firstPara && firstPara[1] !== undefined) {
        unit.metadata.description = firstPara[1]
          .replace(/<[^>]*>/g, "")
          .slice(0, 160)
          .trim();
      }
    }

    // Middleware: Post-Process
    for (const mw of this.middlewares) {
      if (mw.onPostProcess) await mw.onPostProcess(unit, this.container);
    }
  }

  private generate() {
    const { container } = this;
    const { config } = container;
    const GEN_DOCS_DIR = path.join(config.outputDir, "docs");

    cleanGeneratedDir(container, GEN_DOCS_DIR);

    // Transform units back to DocEntry format for legacy generator compatibility
    const allDocs = this.units.map((u) => {
      if (!u.metadata) throw new Error(`Missing metadata for unit ${u.relPath}`);
      const meta = u.metadata;
      const entry = {
        id: u.id,
        slug: meta.slug,
        title: meta.title,
        sidebar_label: meta.sidebar_label,
        sidebar_position: meta.sidebar_position,
        category: meta.category,
        original_category: meta.original_category,
        description: meta.description,
        content: u.html || "",
        rawContent: u.content || "",
        toc: u.toc || [],
        date: meta.date,
        author: meta.author,
        tags: meta.tags,
        section: u.section,
        metadata: (meta.custom || {}) as Record<string, string | string[]>, // Flattened custom fields only
        ast: u.tokens || [],
      };

      // Final validation of the generated entry
      if (!docEntryValidator.Check(entry)) {
        const errors = [...docEntryValidator.Errors(entry)];
        const first = errors[0];
        container.context.error(
          "build",
          u.relPath,
          `Generated document failed final validation: ${first?.message}`,
          `Path: ${first?.path}`
        );
      }

      return entry;
    });

    const sidebar = buildSidebar(allDocs as any);
    generateTypes(container);
    generateSidebar(container, sidebar);
    generateDocFiles(container, GEN_DOCS_DIR, allDocs as any);
    generateBarrelExports(container, GEN_DOCS_DIR, allDocs as any);
    generateSeoFiles(container, allDocs as any);
  }
}
