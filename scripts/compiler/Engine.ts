/**
 * Documentation Compiler Engine
 * Orchestrates the full build pipeline.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import glob from "fast-glob";
import { marked } from "marked";
import type { Highlighter } from "shiki";
import { Logger } from "../core/logger.ts";
import { parseFrontmatter } from "../pipeline/frontmatter.ts";
import {
  cleanGeneratedDir,
  generateBarrelExports,
  generateDocFiles,
  generateSeoFiles,
  generateSidebar,
} from "../pipeline/generator.ts";
import { buildSidebar } from "../pipeline/sidebar.ts";
import { extractTOC } from "../pipeline/toc.ts";
import {
  extractAllFootnotes,
  generateReferencesMarkdown,
  type FootnoteDefinition,
} from "../pipeline/references.ts";
import { CompilationContext } from "./Context.ts";
import type { CompilerMiddleware } from "./Middleware.ts";
import { MarkdownRenderer } from "./Renderer.ts";
import type { CompilationUnit, CompilerConfig } from "./types.ts";
import { DocEntrySchema } from "../../src/shared/schemas.ts";
import { TypeCompiler } from "@sinclair/typebox/compiler";

const docEntryValidator = TypeCompiler.Compile(DocEntrySchema);

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
  "provides",
  "features",
  "allows",
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
  private readonly ctx: CompilationContext;
  private readonly renderer: MarkdownRenderer;
  private readonly middlewares: CompilerMiddleware[] = [];
  private units: CompilationUnit[] = [];
  private allFootnotes: FootnoteDefinition[] = [];
  private readonly logger = new Logger();

  constructor(config: CompilerConfig, highlighter?: Highlighter) {
    this.ctx = new CompilationContext(config);
    this.renderer = new MarkdownRenderer(highlighter);
  }

  public use(middleware: CompilerMiddleware) {
    this.middlewares.push(middleware);
    return this;
  }

  public async compile() {
    this.logger.raw("🚀 Starting Documentation Compiler…");

    // 1. Ingest
    await this.scanDirectory(this.ctx.config.docsDir, "docs");

    // 2. Process Units
    for (const unit of this.units) {
      await this.processUnit(unit);
    }

    // 2.1 Generate and Process Virtual Units (References)
    const refMarkdown = generateReferencesMarkdown(this.allFootnotes);
    const refUnit: CompilationUnit = {
      id: "references",
      filePath: path.join(this.ctx.config.docsDir, "references.md"),
      relPath: "references",
      rawContent: refMarkdown,
      section: "docs",
    };
    await this.processUnit(refUnit);
    this.units.push(refUnit);

    // 3. Assemble (Global Analysis)
    for (const mw of this.middlewares) {
      if (mw.onAssemble) await mw.onAssemble(this.units, this.ctx);
    }

    // 4. Report
    console.log(this.ctx.formatReport());
    if (this.ctx.hasErrors()) {
      throw new Error("Compilation failed due to errors.");
    }

    // 5. Generate
    this.generate();
    this.generateWordStats();

    this.logger.raw(`✨ Compilation finished in ${Date.now() - this.ctx.startTime}ms`);
  }

  private generateWordStats() {
    const wordCounts: Record<string, number> = {};
    const filteredCounts: Record<string, number> = {};

    for (const unit of this.units) {
      if (!unit.content) continue;

      const text = unit.content
        .replace(/#+\s/g, " ") // headers
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
        .replace(/`[^`]+`/g, " ") // inline code
        .replace(/:::[^\s]+/g, " ") // admonitions
        .replace(/[^\w\s]/g, " ") // punctuation
        .toLowerCase();

      const words = text.split(/\s+/);

      for (const word of words) {
        if (word.length < 3) continue;
        if (/^\d+$/.test(word)) continue;

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
      .map(([word, count]) => ({ word, count }));

    const content = `// AUTO-GENERATED — DO NOT EDIT.
export const wordStats = ${JSON.stringify(sortedWords, null, 2)};
export const filteredStats = ${JSON.stringify(sortedFiltered, null, 2)};
`;
    fs.writeFileSync(path.join(this.ctx.config.outputDir, "word-stats.ts"), content, "utf-8");
  }

  private async scanDirectory(baseDir: string, section: "docs" | "blog") {
    if (!fs.existsSync(baseDir)) return;

    const files = await glob("**/*.md", { cwd: baseDir, absolute: true });

    for (const fullPath of files) {
      const relPath = path.relative(baseDir, fullPath).replace(/\.md$/, "");
      const rawContent = fs.readFileSync(fullPath, "utf-8");

      const unit: CompilationUnit = {
        id: relPath,
        filePath: fullPath,
        relPath,
        rawContent,
        section,
      };

      for (const mw of this.middlewares) {
        if (mw.onIngest) await mw.onIngest(unit, this.ctx);
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
      title:
        (fm["title"] as string) ||
        filename
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" "),
      description: (fm["description"] as string) || "",
      sidebar_label: (fm["sidebar_label"] as string) || (fm["title"] as string) || filename,
      sidebar_position: parseInt(fm["sidebar_position"] as string, 10) || 999,
      category,
      original_category: slugParts.length > 1 ? slugParts[0] : "",
      slug,
      date: fm["date"] as string,
      author: fm["author"] as string,
      tags: Array.isArray(fm["tags"]) ? fm["tags"].map(String) : undefined,
      custom,
    };

    // Middleware: Pre-Parse
    for (const mw of this.middlewares) {
      if (mw.onPreParse) await mw.onPreParse(unit, this.ctx);
    }

    // Parsing
    this.renderer.reset();
    const renderer = this.renderer.getRenderer();
    unit.tokens = marked.Lexer.lex(unit.content);

    // Collect footnotes (if not the references page itself)
    if (unit.id !== "references") {
      this.allFootnotes.push(...extractAllFootnotes(unit.tokens, unit.relPath));
    }

    // Middleware: Transform
    for (const mw of this.middlewares) {
      if (mw.onTransform) await mw.onTransform(unit, this.ctx);
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
      if (mw.onPostProcess) await mw.onPostProcess(unit, this.ctx);
    }
  }

  private generate() {
    const { config } = this.ctx;
    const GEN_DOCS_DIR = path.join(config.outputDir, "docs");

    cleanGeneratedDir(GEN_DOCS_DIR);

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
        this.ctx.error(
          "build",
          u.relPath,
          `Generated document failed final validation: ${first?.message}`,
          `Path: ${first?.path}`
        );
      }

      return entry;
    });

    const sidebar = buildSidebar(allDocs as any);
    generateSidebar(config.outputDir, sidebar);
    generateDocFiles(GEN_DOCS_DIR, allDocs as any);
    generateBarrelExports(config.outputDir, GEN_DOCS_DIR, allDocs as any);
    generateSeoFiles(path.dirname(config.outputDir), allDocs as any, config.siteUrl);
  }
}
