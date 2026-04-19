/**
 * Build script: scans all markdown docs/blog and generates split TypeScript
 * data files under src/generated/. Zero runtime APIs needed.
 *
 * Bundler-agnostic — runs with Bun or Node.js runtime.
 *
 * Output structure:
 *   src/generated/
 *     ├── index.ts          # barrel export
 *     ├── sidebar.ts        # sidebarData
 *     ├── clipboard.ts      # copyCode helper (static, not regenerated)
 *     ├── types.ts          # DocEntry interface (static)
 *     └── docs/
 *         ├── index.ts      # re-exports all doc entries
 *         └── *.ts          # one file per doc
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { c, colors, Logger, line } from "./core/index.ts";
import { paths } from "./core/paths.ts";

const logger = new Logger();

import { marked } from "marked";
import { createHighlighter, type Language } from "shiki";
import {
  analyzeAdmonitions,
  analyzeContent,
  Diagnostics,
  validateCodeBlockDescriptions,
  validateFrontmatter,
  validateInternalLinks,
  validateUniqueSlugs,
} from "./diagnostics.ts";
import { plugins } from "./plugins/index.ts";
import { mermaidValidator } from "./plugins/validators/mermaid-validator.ts";
import { ReportGenerator } from "./report/generator.ts";

const reporter = new ReportGenerator();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = paths.root;
const DOCS_DIR = path.join(ROOT, "docs");
const BLOG_DIR = path.join(ROOT, "blog");
const GEN_DIR = path.join(ROOT, "src", "generated");
const GEN_DOCS_DIR = path.join(GEN_DIR, "docs");

interface DocEntry {
  id: string;
  slug: string;
  title: string;
  sidebar_label: string;
  sidebar_position: number;
  category: string;
  original_category?: string; // Folder name with numeric prefix for ordering (e.g., "02-guides")
  description: string;
  content: string;
  rawContent: string;
  toc: { value: string; id: string; level: number }[];
  date?: string;
  author?: string;
  tags?: string[];
  section: "docs" | "blog";
  metadata?: Record<string, string | string[]>;
  ast?: any[]; // Raw marked tokens for debugging
}

interface SidebarDocItem {
  type: "doc";
  id: string;
  label: string;
  slug: string;
  category?: string;
  date?: string;
}

interface SidebarCategoryItem {
  type: "category";
  label: string;
  link?: { type: string; id: string };
  items: SidebarDocItem[];
}

type SidebarItem = SidebarDocItem | SidebarCategoryItem;

// ---- Shiki setup ----
const highlighter = await createHighlighter({
  themes: ["github-dark"],
  langs: [
    "typescript",
    "javascript",
    "python",
    "bash",
    "json",
    "html",
    "css",
    "docker",
    "yaml",
    "markdown",
    "tsx",
    "jsx",
    "mermaid",
  ],
});

const renderer = new marked.Renderer();

function codeBlockWrapper(inner: string, meta: CodeBlockMeta) {
  const langLabel =
    meta.label || (meta.lang ? meta.lang.charAt(0).toUpperCase() + meta.lang.slice(1) : "");
  const titleHtml = meta.title
    ? `<span class="code-title">${meta.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`
    : "";
  const descHtml = meta.desc
    ? `<div class="code-desc">${meta.desc.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`
    : "";
  const copyBtnHtml =
    meta.copy !== false
      ? `<button class="code-copy-btn" aria-label="Copy code" onclick="copyCode(this)">Copy</button>`
      : "";

  return [
    `<div class="code-block" data-lang="${meta.lang}" data-copy="${meta.copy !== false}" data-zoom="${meta.zoom !== false}">`,
    `<div class="code-header"><span class="code-lang">${langLabel}</span>${titleHtml}${copyBtnHtml}</div>`,
    inner,
    descHtml,
    `</div>`,
  ].join("");
}

/** Codeblock metadata extracted from fence info string */
interface CodeBlockMeta {
  lang: string;
  title?: string;
  desc?: string;
  /** Custom text to show in titlebar instead of language label */
  label?: string;
  /** Whether to show copy button (default: true) */
  copy?: boolean;
  /** Whether to show zoom button for mermaid diagrams (default: true) */
  zoom?: boolean;
}

/** Parse code fence info string → metadata
 * Supported syntaxes:
 *   ```typescript
 *   ```typescript:title=src/store.ts
 *   ```typescript:desc=A description
 *   ```typescript:label=Custom Label:copy=false:zoom=true
 *   ```typescript:title=src/store.ts:desc=A description:copy=false
 *   ```mermaid:desc=User flow:zoom=true
 * Order doesn't matter for any key=value pairs after the language.
 */
function parseCodeInfo(info: string | undefined): CodeBlockMeta {
  if (!info) return { lang: "", copy: true, zoom: true };

  let lang = "";
  let rest = "";

  // 1. Try to parse the new syntax: lang { key="value" }
  const braceMatch = info.match(/^([^\s{]+)\s*\{([\s\S]*)\}\s*$/);
  if (braceMatch) {
    lang = braceMatch[1].trim();
    rest = braceMatch[2].trim();

    const titleMatch = rest.match(
      /title\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^"'\s{}]+))/
    );
    const descMatch = rest.match(
      /desc(?:ription)?\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^"'\s{}]+))/
    );
    const labelMatch = rest.match(
      /label\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^"'\s{}]+))/
    );
    const copyMatch = rest.match(/copy\s*=\s*["']?(true|false)["']?/i);
    const zoomMatch = rest.match(/zoom\s*=\s*["']?(true|false)["']?/i);

    return {
      lang,
      title: titleMatch?.[1].trim(),
      desc: descMatch?.[1].trim(),
      label: labelMatch?.[1].trim(),
      copy: copyMatch ? copyMatch[1].toLowerCase() === "true" : true,
      zoom: zoomMatch ? zoomMatch[1].toLowerCase() === "true" : true,
    };
  }

  // 2. Fall back to existing colon syntax: lang:key=value
  const colonIndex = info.indexOf(":");
  lang = colonIndex > 0 ? info.slice(0, colonIndex).trim() : info.trim();

  if (colonIndex === -1) return { lang, copy: true, zoom: true };

  rest = info.slice(colonIndex + 1);
  const titleMatch = rest.match(/(?:^|:)\s*title\s*=\s*([^:]+?)\s*(?=:|$)/);
  const descMatch = rest.match(/(?:^|:)\s*desc(?:ription)?\s*=\s*([^:]+?)\s*(?=:|$)/);
  const labelMatch = rest.match(/(?:^|:)\s*label\s*=\s*([^:]+?)\s*(?=:|$)/);
  const copyMatch = rest.match(/(?:^|:)\s*copy\s*=\s*(true|false)\s*(?=:|$)/i);
  const zoomMatch = rest.match(/(?:^|:)\s*zoom\s*=\s*(true|false)\s*(?=:|$)/i);

  return {
    lang,
    title: titleMatch ? titleMatch[1].trim().replace(/["'\s]+$/, "") : undefined,
    desc: descMatch ? descMatch[1].trim().replace(/["'\s]+$/, "") : undefined,
    label: labelMatch ? labelMatch[1].trim().replace(/["'\s]+$/, "") : undefined,
    copy: copyMatch ? copyMatch[1].toLowerCase() === "true" : true,
    zoom: zoomMatch ? zoomMatch[1].toLowerCase() === "true" : true,
  };
}

renderer.code = ({ text, lang: rawLang }) => {
  const meta = parseCodeInfo(rawLang);

  // Skip Shiki for mermaid - the mermaid plugin needs raw text with newlines
  if (
    meta.lang &&
    meta.lang.toLowerCase() !== "mermaid" &&
    highlighter.getLoadedLanguages().includes(meta.lang as Language)
  ) {
    const highlighted = highlighter.codeToHtml(text, { lang: meta.lang, theme: "github-dark" });
    return codeBlockWrapper(highlighted, meta);
  }
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return codeBlockWrapper(
    `<pre><code class="language-${meta.lang || ""}">${escaped}</code></pre>`,
    meta
  );
};
renderer.heading = ({ text, depth }) => {
  const id = slugifyHeading(text);
  return `<h${depth} id="${id}">${text}<a class="hash-link" href="#${id}" aria-label="${text} permalink">#</a></h${depth}>`;
};
marked.use({ renderer, gfm: true });

// ---- Helpers ----

/**
 * Docusaurus-compatible heading slugifier.
 * - Lowercases
 * - Strips most punctuation but preserves + (C++ → c-plus-plus)
 * - Handles common special cases
 */
const SPECIAL_CASES: Record<string, string> = {
  "c++": "c-plus-plus",
  "c#": "c-sharp",
  ".net": "net",
};

function slugifyHeading(text: string): string {
  const lower = text.toLowerCase().trim();
  if (SPECIAL_CASES[lower]) return SPECIAL_CASES[lower];

  return lower
    .replace(/\+/g, "-plus-")
    .replace(/#/g, "-sharp-")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseFrontmatter(md: string) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const fm: Record<string, unknown> = {};
  let content = md;
  if (m) {
    content = m[2];
    const fmLines = m[1].split("\n");
    let currentKey: string | null = null;
    let currentList: string[] | null = null;

    for (let i = 0; i < fmLines.length; i++) {
      const line = fmLines[i];

      // Check if this is a list item under the current key
      const listMatch = line.match(/^\s+-\s+(.+)$/);
      if (listMatch && currentKey && currentList !== null) {
        currentList.push(listMatch[1].trim().replace(/^["']|["']$/g, ""));
        continue;
      }

      // Flush previous list if any
      if (currentKey && currentList !== null) {
        fm[currentKey] = currentList;
        currentKey = null;
        currentList = null;
      }

      // Regular key: value line
      const ci = line.indexOf(":");
      if (ci > 0) {
        const key = line.slice(0, ci).trim();
        const rawVal = line
          .slice(ci + 1)
          .trim()
          .replace(/^["']|["']$/g, "");

        if (rawVal === "") {
          // Might be a list on following lines
          currentKey = key;
          currentList = [];
        } else if (rawVal.startsWith("[")) {
          try {
            fm[key] = JSON.parse(rawVal) as unknown;
          } catch {
            fm[key] = rawVal.split(",").map((t: string) => t.trim().replace(/["']/g, ""));
          }
        } else {
          fm[key] = rawVal;
        }
      }
    }

    // Flush final list if any
    if (currentKey && currentList !== null) {
      fm[currentKey] = currentList;
    }
  }
  return { fm, content };
}

function extractTOC(content: string) {
  const toc: DocEntry["toc"] = [];
  const re = /^(#{2,3})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const id = m[2]
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    toc.push({ value: m[2], id, level: m[1].length });
  }
  return toc;
}

/** Convert a slug like "guides/build-system" to a safe file var name "guides_build_system" */
function slugToVarName(slug: string): string {
  return slug.replace(/\//g, "_").replace(/-/g, "_");
}

/** Convert a slug to a kebab-case filename "guides-build-system" */
function slugToFilename(slug: string): string {
  return slug.replace(/\//g, "-");
}

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

async function scanMdFiles(baseDir: string, section: "docs" | "blog", diags: Diagnostics): Promise<DocEntry[]> {
  if (!fs.existsSync(baseDir)) return [];
  const entries: DocEntry[] = [];
  async function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && entry.name.endsWith(".md")) {
        const raw = fs.readFileSync(full, "utf-8");
        const relPath = path.relative(baseDir, full).replace(/\.md$/, "");
        const { fm, content } = parseFrontmatter(raw);

        // Validate frontmatter
        validateFrontmatter(fm, relPath, diags);

        // Extract numeric index prefix from filename (e.g., "01-project-overview" → 1)
        const filename = entry.name.replace(/\.md$/, "");
        const indexMatch = filename.match(/^(\d{2})-/);
        const fileIndex = indexMatch ? parseInt(indexMatch[1], 10) : null;

        // Strip index prefix from slug for clean URLs
        // "01-getting-started/01-project-overview" → "getting-started/project-overview"
        // "02-guides/01-build-system" → "guides/build-system"
        const slugParts = relPath.split("/");
        // Store original category with numeric prefix for ordering
        const originalCategory = slugParts.length > 1 ? slugParts[0] : "";
        // Strip numeric prefix from folder name for clean category label
        const category = slugParts.length > 1 ? slugParts[0].replace(/^\d{2}-/, "") : "";
        const cleanSlug = slugParts
          .map((part) => {
            // Strip index prefix from all path segments
            return part.replace(/^\d{2}-/, "");
          })
          .join("/");
        const slug = section === "blog" ? `blog/${cleanSlug}` : cleanSlug;

        const title = (fm.title as string) || content.match(/^# (.+)$/m)?.[1] || "Untitled";

        // Run plugins with error handling
        let processed = content;
        for (const plugin of plugins) {
          if (plugin.preProcess) {
            try {
              processed = plugin.preProcess(processed);
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              diags.error("plugin", relPath, `Plugin "${plugin.name}" preProcess failed`, msg);
            }
          }
        }

        // Validate mandatory code block descriptions
        validateCodeBlockDescriptions(content, relPath, diags);

        // Validate Mermaid diagrams at build-time
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
        try {
          // Lex tokens for AST/debug purposes
          tokens = marked.Lexer.lex(processed);
          html = marked.parse(processed) as string;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          diags.error("content", relPath, "Markdown parsing failed", msg);
        }

        // PostProcess in REVERSE order with error handling
        for (let i = plugins.length - 1; i >= 0; i--) {
          const plugin = plugins[i];
          if (plugin.postProcess) {
            try {
              html = await plugin.postProcess(html);
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              diags.error("plugin", relPath, `Plugin "${plugin.name}" postProcess failed`, msg);
            }
          }
        }

        // Validate internal links (deferred — slugs not known yet)
        // Will be validated after all files are scanned

        // Use file index prefix for ordering, fall back to frontmatter, then 999
        const pos =
          fileIndex !== null ? fileIndex : parseInt(fm.sidebar_position as string, 10) || 999;

        // Collect arbitrary frontmatter fields not in the known schema
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
          description: (fm.description as string) || "",
          content: html,
          rawContent: content,
          toc: extractTOC(content),
          date: fm.date as string | undefined,
          author: fm.author as string | undefined,
          tags: fm.tags as string[] | undefined,
          section,
          metadata,
          ast: tokens,
        });
      }
    }
  }
  await walk(baseDir);
  return entries;
}

function buildSidebar(docs: DocEntry[]): SidebarItem[] {
  const catOrder: string[] = [];
  const catPrefixes: Record<string, number> = {}; // Track folder numeric prefixes
  const grouped: Record<string, DocEntry[]> = {};
  const uncategorized: DocEntry[] = [];
  for (const d of docs) {
    if (d.category) {
      if (!grouped[d.category]) {
        grouped[d.category] = [];
        catOrder.push(d.category);
        // Extract numeric prefix from original category for ordering
        // e.g., "02-guides" → 2
        if (d.original_category) {
          const prefixMatch = d.original_category.match(/^(\d{2})/);
          catPrefixes[d.category] = prefixMatch ? parseInt(prefixMatch[1], 10) : 999;
        } else {
          catPrefixes[d.category] = 999;
        }
      }
      grouped[d.category].push(d);
    } else uncategorized.push(d);
  }
  const sidebar: SidebarItem[] = [];

  // Add welcome page as first item (before categories)
  const welcomeDoc = docs.find((d) => d.slug === "welcome");
  if (welcomeDoc) {
    sidebar.push({
      type: "doc",
      id: welcomeDoc.id,
      label: welcomeDoc.sidebar_label || "Welcome",
      slug: welcomeDoc.slug,
      date: welcomeDoc.date,
    });
  }

  for (const d of uncategorized.sort((a, b) => a.sidebar_position - b.sidebar_position)) {
    // Skip welcome page as it's already added above
    if (d.slug === "welcome") continue;
    sidebar.push({
      type: "doc",
      id: d.id,
      label: d.sidebar_label,
      slug: d.slug,
      date: d.date,
    });
  }
  // Sort categories by their folder numeric prefix
  const sortedCats = catOrder
    .filter((c) => c !== "blog")
    .sort((a, b) => (catPrefixes[a] || 999) - (catPrefixes[b] || 999));
  for (const cat of sortedCats) {
    const items = (grouped[cat] || []).sort((a, b) => a.sidebar_position - b.sidebar_position);
    // Format label: "getting-started" → "Getting Started", "guides" → "Guides"
    const label = cat
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    sidebar.push({
      type: "category",
      label,
      link: items[0] ? { type: "doc", id: items[0].id } : undefined,
      items: items.map((d) => ({
        type: "doc" as const,
        id: d.id,
        label: d.sidebar_label,
        slug: d.slug,
        category: d.category,
        date: d.date,
      })),
    });
  }
  if (catOrder.includes("blog")) {
    const items = (grouped.blog || []).sort((a, b) => a.sidebar_position - b.sidebar_position);
    sidebar.push({
      type: "category",
      label: "📝 Blog",
      link: items[0] ? { type: "doc", id: items[0].id } : undefined,
      items: items.map((d) => ({
        type: "doc" as const,
        id: d.id,
        label: d.sidebar_label,
        slug: d.slug,
        category: "blog",
        date: d.date,
      })),
    });
  }
  return sidebar;
}

function escapeSingleLineJson(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

// ---- Main ----
const diags = new Diagnostics();

logger.raw("📚 Scanning docs…");
const docs = await scanMdFiles(DOCS_DIR, "docs", diags);
const blogs = await scanMdFiles(BLOG_DIR, "blog", diags);
const all = [...docs, ...blogs];
const sidebar = buildSidebar(all);

logger.raw(`✅ Found ${docs.length} docs`);

// ─── AST/Token Summary ────────────────────────────────────────────
const totalTokens = all.reduce((sum, doc) => sum + (doc.ast?.length || 0), 0);
logger.raw(`📊 ${all.length} articles, ${totalTokens} total tokens`);

// List article titles
for (const doc of all) {
  const tokenCount = doc.ast?.length || 0;
  logger.raw(`  📄 ${doc.slug}: ${tokenCount} tokens`);
}

// ─── Deferred validations ─────────────────────────────────────────

// Validate unique slugs
validateUniqueSlugs(
  all.map((d) => ({ id: d.id, slug: d.slug })),
  diags
);

// Validate internal links now that we know all slugs
const knownSlugs = new Set(all.map((d) => d.slug));

for (const doc of all) {
  validateInternalLinks(doc.content, knownSlugs, doc.id, diags);
}

// ─── Unified Reporting ──────────────────────────────────────────

// 1. Formal Diagnostics (errors/warnings)
const report = {
  validator: "build-diagnostics",
  label: "Build Diagnostics",
  filesChecked: all.length,
  issues: diags.all().map((d) => ({
    severity: d.severity as any,
    file: d.file,
    line: d.line,
    message: d.message,
    detail: d.detail,
  })),
  pass: !diags.hasErrors(),
};
reporter.addReport(report);

// 2. Admonitions Analysis Section
const addAdmonitionLine = reporter.addSection("Admonitions Analysis");
const allAdmonitions: Record<string, { total: number; byType: Record<string, number> }> = {};
for (const doc of docs) {
  const analysis = analyzeAdmonitions(doc.rawContent, doc.id, diags);
  if (analysis.hasAdmonitions) {
    allAdmonitions[doc.id] = analysis.stats;
  }
}

const sortedFiles = Object.entries(allAdmonitions).sort((a, b) => b[1].total - a[1].total);
for (const [file, stats] of sortedFiles) {
  const types = Object.entries(stats.byType)
    .map(([type, count]) => `${type}:${count}`)
    .join(", ");
  addAdmonitionLine(
    `${colors.green}✓${colors.reset} ${c(file, "dim")} (${stats.total} | ${types})`
  );
}

// 3. Content Enrichment Section
const addEnrichmentLine = reporter.addSection("Content Enrichment");
const allContentStats: Record<string, FileContentStats> = {};
const totals = { code: 0, mermaid: 0, adm: 0, ref: 0 };

for (const doc of docs) {
  const analysis = analyzeContent(doc.rawContent, doc.id, diags);
  allContentStats[doc.id] = {
    codeBlocks: analysis.stats.codeBlocks,
    mermaidBlocks: analysis.stats.mermaidBlocks,
    admonitions: analysis.stats.admonitions,
    references: analysis.stats.references,
    footnotes: analysis.stats.footnotes,
  };
  totals.code += analysis.stats.codeBlocks;
  totals.mermaid += analysis.stats.mermaidBlocks;
  totals.adm += analysis.stats.admonitions;
  totals.ref += analysis.stats.references;
}

const sortedByEnrichment = Object.entries(allContentStats).sort((a, b) => {
  return (
    a[1].codeBlocks +
    a[1].mermaidBlocks +
    a[1].admonitions -
    (b[1].codeBlocks + b[1].mermaidBlocks + b[1].admonitions)
  );
});

for (const [file, stats] of sortedByEnrichment.slice(0, 5)) {
  addEnrichmentLine(
    `${c(file.padEnd(30), "dim")} code:${stats.codeBlocks} mermaid:${stats.mermaidBlocks} adm:${stats.admonitions}`
  );
}
addEnrichmentLine(line("─", 40, "dim"));
addEnrichmentLine(
  `${colors.bright}Totals:${colors.reset} Code:${totals.code} (${totals.mermaid} mermaid) | Adm:${totals.adm} | Ref:${totals.ref}`
);

// Print the unified report
reporter.print();

if (diags.hasErrors()) {
  logger.error("Build failed due to validation errors.");
  process.exit(1);
}

// Check for --json flag to output diagnostics as JSON
const args = process.argv.slice(2);
if (args.includes("--json")) {
  fs.writeFileSync(
    path.join(ROOT, "diagnostics.json"),
    JSON.stringify(diags.toJSON(), null, 2),
    "utf-8"
  );
  logger.raw("💾 Diagnostics written to diagnostics.json");
}

// Ensure output dirs exist
fs.mkdirSync(GEN_DOCS_DIR, { recursive: true });

// 1) Write sidebar.ts
const sidebarContent = `// AUTO-GENERATED — DO NOT EDIT. Run \`npm run build:docs\` to regenerate.

export interface SidebarDocItem {
  type: "doc";
  id: string;
  label: string;
  slug: string;
  category?: string;
  date?: string;
}

export interface SidebarCategoryItem {
  type: "category";
  label: string;
  link?: { type: string; id: string };
  items: SidebarDocItem[];
}

export type SidebarItem = SidebarDocItem | SidebarCategoryItem;

export const sidebarData: SidebarItem[] = ${JSON.stringify(sidebar, null, 2)};
`;
fs.writeFileSync(path.join(GEN_DIR, "sidebar.ts"), sidebarContent, "utf-8");

// 2) Write one file per doc into docs/
for (const d of all) {
  const filename = slugToFilename(d.id);
  const astJson = d.ast ? JSON.stringify(d.ast) : "undefined";
  const content = `// AUTO-GENERATED — DO NOT EDIT.
import type { DocEntry } from "../types.ts";

export const ${slugToVarName(d.id)}: DocEntry = {
  id: '${escapeSingleLineJson(d.id)}',
  slug: '${escapeSingleLineJson(d.slug)}',
  title: '${escapeSingleLineJson(d.title)}',
  sidebar_label: '${escapeSingleLineJson(d.sidebar_label)}',
  sidebar_position: ${d.sidebar_position},
  category: '${escapeSingleLineJson(d.category)}',
  description: '${escapeSingleLineJson(d.description)}',
  content: '${escapeSingleLineJson(d.content)}',
  rawContent: '${escapeSingleLineJson(d.rawContent)}',
  toc: ${JSON.stringify(d.toc)},
  date: ${d.date ? `'${d.date}'` : "undefined"},
  author: ${d.author ? `'${d.author}'` : "undefined"},
  tags: ${d.tags ? JSON.stringify(d.tags) : "undefined"},
  section: '${d.section}',
  metadata: ${JSON.stringify(d.metadata)},
  ast: ${astJson},
};
`;
  fs.writeFileSync(path.join(GEN_DOCS_DIR, `${filename}.ts`), content, "utf-8");
}

// 3) Write docs/index.ts — barrel re-export all doc entries, plus allDocs array
const docsIndexContent = `// AUTO-GENERATED — DO NOT EDIT.
import type { DocEntry } from "../types.ts";
${all.map((d) => `import { ${slugToVarName(d.id)} } from "./${slugToFilename(d.id)}.ts";`).join("\n")}

export {
  ${all.map((d) => slugToVarName(d.id)).join(",\n  ")},
};

export const allDocs: DocEntry[] = [
  ${all.map((d) => slugToVarName(d.id)).join(",\n  ")},
];
`;
fs.writeFileSync(path.join(GEN_DOCS_DIR, "index.ts"), docsIndexContent, "utf-8");

// 4) Write top-level index.ts — barrel export sidebar + allDocs
const topIndexContent = `// AUTO-GENERATED — DO NOT EDIT.
import "./clipboard.ts";

export { sidebarData } from "./sidebar.ts";
export type { SidebarItem, SidebarDocItem, SidebarCategoryItem } from "./sidebar.ts";
export { allDocs } from "./docs/index.ts";
export type { DocEntry } from "./types.ts";
`;
fs.writeFileSync(path.join(GEN_DIR, "index.ts"), topIndexContent, "utf-8");

// ─── SEO: Generate sitemap.xml ─────────────────────────────────────
const SITE_URL = "https://your-docs-site.com"; // Replace with your actual domain
const today = new Date().toISOString().split("T")[0];

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

// Add homepage
sitemapXml += `  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

// Add all doc pages
for (const doc of all) {
  const url =
    doc.section === "blog"
      ? `${SITE_URL}/blog/${doc.slug.replace("blog/", "")}`
      : `${SITE_URL}/docs/${doc.slug}`;

  sitemapXml += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${doc.section === "blog" ? "weekly" : "monthly"}</changefreq>
    <priority>${doc.section === "blog" ? "0.7" : "0.9"}</priority>
  </url>
`;
}

sitemapXml += `</urlset>\n`;

// Write to project root (rspack CopyRspackPlugin will copy to dist)
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemapXml, "utf-8");
logger.raw("🗺️  Sitemap generated: sitemap.xml");

// ─── SEO: Generate robots.txt ──────────────────────────────────────
const robotsTxt = `# robots.txt — Allow all crawlers
User-agent: *
Allow: /

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl delay (optional, polite)
Crawl-delay: 1
`;

fs.writeFileSync(path.join(ROOT, "robots.txt"), robotsTxt, "utf-8");
logger.raw("🤖 robots.txt generated: robots.txt");

logger.raw(`💾 Written to ${GEN_DIR}/`);
logger.raw("✨ Done!");
