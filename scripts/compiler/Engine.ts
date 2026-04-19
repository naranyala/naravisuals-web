/**
 * Documentation Compiler Engine
 * Orchestrates the full build pipeline.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { marked } from "marked";
import type { Highlighter } from "shiki";
import { CompilationContext } from "./Context.ts";
import { MarkdownRenderer } from "./Renderer.ts";
import type { CompilerMiddleware } from "./Middleware.ts";
import type { CompilationUnit, CompilerConfig, DocMetadata, TocItem } from "./types.ts";
import { parseFrontmatter } from "../pipeline/frontmatter.ts";
import { extractTOC } from "../pipeline/toc.ts";
import { 
  cleanGeneratedDir, 
  generateSidebar, 
  generateDocFiles, 
  generateBarrelExports, 
  generateSeoFiles 
} from "../pipeline/generator.ts";
import { buildSidebar } from "../pipeline/sidebar.ts";
import { Logger } from "../core/index.ts";

export class DocumentationCompiler {
  private readonly ctx: CompilationContext;
  private readonly renderer: MarkdownRenderer;
  private readonly middlewares: CompilerMiddleware[] = [];
  private units: CompilationUnit[] = [];
  private readonly logger = new Logger();

  constructor(config: CompilerConfig) {
    this.ctx = new CompilationContext(config);
    this.renderer = new MarkdownRenderer();
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

    this.logger.raw(`✨ Compilation finished in ${Date.now() - this.ctx.startTime}ms`);
  }

  private async scanDirectory(baseDir: string, section: "docs" | "blog") {
    if (!fs.existsSync(baseDir)) return;

    const walk = async (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          const relPath = path.relative(baseDir, fullPath).replace(/\.md$/, "");
          const rawContent = fs.readFileSync(fullPath, "utf-8");
          
          const unit: CompilationUnit = {
            id: relPath,
            filePath: fullPath,
            relPath,
            rawContent,
            section
          };

          for (const mw of this.middlewares) {
            if (mw.onIngest) await mw.onIngest(unit, this.ctx);
          }

          this.units.push(unit);
        }
      }
    };

    await walk(baseDir);
  }

  private async processUnit(unit: CompilationUnit) {
    const { fm, content } = parseFrontmatter(unit.rawContent);
    unit.content = content;
    
    // Metadata construction
    const filename = path.basename(unit.filePath).replace(/\.md$/, "");
    const slugParts = unit.relPath.split("/");
    const category = slugParts.length > 1 ? slugParts[0].replace(/^\d{2}-/, "") : (unit.section === "blog" ? "blog" : "");
    const slug = unit.section === "blog" ? `blog/${unit.relPath.replace(/^\d{2}-/, "")}` : unit.relPath.replace(/\d{2}-/g, "");
    
    const knownFields = new Set(["title", "description", "sidebar_label", "sidebar_position", "date", "author", "tags", "slug"]);
    const custom: Record<string, string | string[]> = {};
    for (const [k, v] of Object.entries(fm)) {
      if (!knownFields.has(k) && v !== undefined) {
        custom[k] = Array.isArray(v) ? v.map(String) : String(v);
      }
    }

    unit.metadata = {
      title: (fm.title as string) || filename.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
      description: (fm.description as string) || "",
      sidebar_label: (fm.sidebar_label as string) || (fm.title as string) || filename,
      sidebar_position: parseInt(fm.sidebar_position as string, 10) || 999,
      category,
      original_category: slugParts.length > 1 ? slugParts[0] : "",
      slug,
      date: fm.date as string,
      author: fm.author as string,
      tags: Array.isArray(fm.tags) ? fm.tags.map(String) : undefined,
      custom
    };

    // Middleware: Pre-Parse
    for (const mw of this.middlewares) {
      if (mw.onPreParse) await mw.onPreParse(unit, this.ctx);
    }

    // Parsing
    this.renderer.reset();
    const renderer = this.renderer.getRenderer();
    unit.tokens = marked.Lexer.lex(unit.content);

    // Middleware: Transform
    for (const mw of this.middlewares) {
      if (mw.onTransform) await mw.onTransform(unit, this.ctx);
    }

    unit.html = marked.parse(unit.content, { renderer }) as string;
    unit.toc = extractTOC(unit.tokens);

    // Fallback description
    if (!unit.metadata.description) {
      const firstPara = unit.html.match(/<p>(.*?)<\/p>/);
      if (firstPara) {
        unit.metadata.description = firstPara[1].replace(/<[^>]*>/g, "").slice(0, 160).trim();
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
    const allDocs = this.units.map(u => {
      const meta = u.metadata!;
      return {
        id: u.id,
        slug: meta.slug,
        title: meta.title,
        sidebar_label: meta.sidebar_label,
        sidebar_position: meta.sidebar_position,
        category: meta.category,
        original_category: meta.original_category,
        description: meta.description,
        content: u.html!,
        rawContent: u.content!,
        toc: u.toc!,
        date: meta.date,
        author: meta.author,
        tags: meta.tags,
        section: u.section,
        metadata: meta.custom, // Flattened custom fields only
        ast: u.tokens
      };
    });

    const sidebar = buildSidebar(allDocs as any);
    generateSidebar(config.outputDir, sidebar);
    generateDocFiles(GEN_DOCS_DIR, allDocs as any);
    generateBarrelExports(config.outputDir, GEN_DOCS_DIR, allDocs as any);
    generateSeoFiles(path.dirname(config.outputDir), allDocs as any, config.siteUrl);
  }
}
