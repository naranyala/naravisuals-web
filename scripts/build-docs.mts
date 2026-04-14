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

// Terminal colors for output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

import { marked } from "marked";
import { createHighlighter, type Language } from "shiki";
import {
  analyzeAdmonitions,
  analyzeContent,
  Diagnostics,
  validateFrontmatter,
  validateUniqueSlugs,
} from "./diagnostics.ts";
import { plugins } from "./plugins/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
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

  // Extract language (everything before the first colon, or the whole string)
  const colonIndex = info.indexOf(":");
  const lang = colonIndex > 0 ? info.slice(0, colonIndex).trim() : info.trim();

  // If no colons, return just the language with defaults
  if (colonIndex === -1) return { lang, copy: true, zoom: true };

  // Parse key=value pairs after the language
  const rest = info.slice(colonIndex + 1);
  const titleMatch = rest.match(/(?:^|:)title\s*=\s*([^:]+?)(?=:|$)/);
  const descMatch = rest.match(/(?:^|:)desc(?:ription)?\s*=\s*([^:]+?)(?=:|$)/);
  const labelMatch = rest.match(/(?:^|:)label\s*=\s*([^:]+?)(?=:|$)/);
  const copyMatch = rest.match(/(?:^|:)copy\s*=\s*(true|false)(?=:|$)/i);
  const zoomMatch = rest.match(/(?:^|:)zoom\s*=\s*(true|false)(?=:|$)/i);

  const copyValue = copyMatch ? copyMatch[1].toLowerCase() === "true" : true;
  const zoomValue = zoomMatch ? zoomMatch[1].toLowerCase() === "true" : true;

  return {
    lang,
    title: titleMatch ? titleMatch[1].trim().replace(/["'\s]+$/, "") : undefined,
    desc: descMatch ? descMatch[1].trim().replace(/["'\s]+$/, "") : undefined,
    label: labelMatch ? labelMatch[1].trim().replace(/["'\s]+$/, "") : undefined,
    copy: copyValue,
    zoom: zoomValue,
  };
}

renderer.code = ({ text, lang: rawLang }) => {
  const meta = parseCodeInfo(rawLang);

  if (meta.lang && highlighter.getLoadedLanguages().includes(meta.lang as Language)) {
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

function scanMdFiles(baseDir: string, section: "docs" | "blog", diags: Diagnostics): DocEntry[] {
  if (!fs.existsSync(baseDir)) return [];
  const entries: DocEntry[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
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
              html = plugin.postProcess(html);
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
  walk(baseDir);
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

console.log("📚 Scanning docs…");
const docs = scanMdFiles(DOCS_DIR, "docs", diags);
const blogs = scanMdFiles(BLOG_DIR, "blog", diags);
const all = [...docs, ...blogs];
const sidebar = buildSidebar(all);

console.log(`✅ Found ${docs.length} docs`);

// ─── AST/Token Summary ────────────────────────────────────────────
for (const doc of all) {
  if (doc.ast && doc.ast.length > 0) {
    const tokenTypes = new Set(doc.ast.map((t: any) => t.type));
    console.log(
      `  📊 ${doc.slug}: ${doc.ast.length} tokens, ${tokenTypes.size} types (${Array.from(tokenTypes).slice(0, 5).join(", ")}${tokenTypes.size > 5 ? "..." : ""})`
    );
  }
}

// ─── Deferred validations ─────────────────────────────────────────

// Validate unique slugs
validateUniqueSlugs(
  all.map((d) => ({ id: d.id, slug: d.slug })),
  diags
);

// Validate internal links now that we know all slugs
const knownSlugs = new Set(all.map((d) => d.slug));
const brokenLinksByFile: Record<string, { text: string; href: string; slug: string }[]> = {};

for (const doc of all) {
  // Validate links and collect broken ones
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  const fileBrokenLinks: { text: string; href: string; slug: string }[] = [];

  while ((match = linkRegex.exec(doc.content)) !== null) {
    const href = match[2];
    const text = match[1];

    // Only validate internal doc links
    if (!href.startsWith("/docs/") && !href.startsWith("/blog/")) continue;

    // Strip anchor fragments and leading slash to get the slug
    const cleanHref = href.split("#")[0].replace(/^\//, "");

    if (!knownSlugs.has(cleanHref)) {
      fileBrokenLinks.push({
        text: text || "(empty)",
        href,
        slug: cleanHref,
      });
      // Also add to diagnostics for the standard warning output
      diags.warn(
        "links",
        doc.id,
        `Broken link: "${text || "(empty)"}" → "${href}"`,
        `Slug "${cleanHref}" not found. Available slugs: ${Array.from(knownSlugs).sort().join(", ")}`
      );
    }
  }

  if (fileBrokenLinks.length > 0) {
    brokenLinksByFile[doc.id] = fileBrokenLinks;
  }
}

// ─── Report diagnostics ──────────────────────────────────────────
const summary = diags.summary();
if (summary.errors > 0 || summary.warnings > 0) {
  console.log("");
  console.log(diags.format());
  console.log("");
}

// ─── Admonitions Analysis ──────────────────────────────────────────
console.log("");
console.log(`${colors.cyan}${colors.bright}📋 Admonitions Analysis${colors.reset}`);
console.log("═".repeat(60));

const allAdmonitions: Record<string, { total: number; byType: Record<string, number> }> = {};
let filesWithAdmonitions = 0;
let filesWithoutAdmonitions = 0;

// Analyze raw markdown content (before processing)
for (const doc of docs) {
  // doc.id is like "getting-started/blender-roadmap-overview"
  // Need to look in DOCS_DIR/01-getting-started/01-blender-roadmap-overview.md
  const docDir = DOCS_DIR;
  let rawContent = "";

  // Try to find the markdown file by searching
  const slugParts = doc.id.split("/");
  if (slugParts.length >= 2) {
    const categoryFolder = slugParts[0];
    const docFile = slugParts[1];

    // Find folder that starts with the category number prefix
    const docsFolders = fs
      .readdirSync(docDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);

    const matchingFolder = docsFolders.find((f) => f.endsWith(categoryFolder));
    if (matchingFolder) {
      // Find the file in that folder (may have numeric prefix)
      const folderPath = path.join(docDir, matchingFolder);
      const mdFiles = fs
        .readdirSync(folderPath)
        .filter((f) => f.endsWith(".md"))
        .filter((f) => f.replace(/^\d+-/, "").replace(".md", "") === docFile);

      if (mdFiles.length > 0) {
        const fullPath = path.join(folderPath, mdFiles[0]);
        rawContent = fs.readFileSync(fullPath, "utf-8");
      }
    }
  }

  const analysis = analyzeAdmonitions(rawContent, doc.id, diags);
  if (analysis.hasAdmonitions) {
    filesWithAdmonitions++;
    allAdmonitions[doc.id] = analysis.stats;
  } else {
    filesWithoutAdmonitions++;
  }
}

// Sort by total admonitions descending
const sortedFiles = Object.entries(allAdmonitions).sort((a, b) => b[1].total - a[1].total);

for (const [file, stats] of sortedFiles) {
  const types = Object.entries(stats.byType)
    .map(([type, count]) => `${type}: ${count}`)
    .join(", ");
  console.log(`\n${colors.green}✓${colors.reset} ${file}`);
  console.log(`   Total: ${stats.total} | ${types}`);
}

if (filesWithoutAdmonitions > 0) {
  console.log(
    `\n${colors.yellow}⚠ Files without admonitions (${filesWithoutAdmonitions}):${colors.reset}`
  );
  let count = 0;
  for (const doc of docs) {
    const slugParts = doc.id.split("/");
    let rawContent = "";
    if (slugParts.length >= 2) {
      const categoryFolder = slugParts[0];
      const docFile = slugParts[1];
      const docsFolders = fs
        .readdirSync(DOCS_DIR, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name);
      const matchingFolder = docsFolders.find((f) => f.endsWith(categoryFolder));
      if (matchingFolder) {
        const folderPath = path.join(DOCS_DIR, matchingFolder);
        const mdFiles = fs
          .readdirSync(folderPath)
          .filter((f) => f.endsWith(".md"))
          .filter((f) => f.replace(/^\d+-/, "").replace(".md", "") === docFile);
        if (mdFiles.length > 0) {
          rawContent = fs.readFileSync(path.join(folderPath, mdFiles[0]), "utf-8");
        }
      }
    }
    const analysis = analyzeAdmonitions(rawContent, doc.id, diags);
    if (!analysis.hasAdmonitions && count < 15) {
      console.log(`   - ${doc.id}`);
      count++;
    }
  }
  if (filesWithoutAdmonitions > 15) {
    console.log(`   ... and ${filesWithoutAdmonitions - 15} more`);
  }
  console.log(
    `\n${colors.dim}💡 Tip: Add :::tip, :::warning, :::note for better context and clarity${colors.reset}`
  );
}

// Calculate totals
const totalAdmonitions = Object.values(allAdmonitions).reduce((sum, s) => sum + s.total, 0);
const typeTotals: Record<string, number> = {};
for (const stats of Object.values(allAdmonitions)) {
  for (const [type, count] of Object.entries(stats.byType)) {
    typeTotals[type] = (typeTotals[type] || 0) + count;
  }
}
console.log(
  `\n${colors.bright}Summary:${colors.reset} ${totalAdmonitions} total admonitions across ${filesWithAdmonitions} files`
);
console.log(
  `By type: ${Object.entries(typeTotals)
    .map(([t, c]) => `${t}=${c}`)
    .join(", ")}`
);

// ─── Content Enrichment Analysis ───────────────────────────────────
console.log("");
console.log(`${colors.cyan}${colors.bright}📊 Content Enrichment Analysis${colors.reset}`);
console.log("═".repeat(60));

interface FileContentStats {
  codeBlocks: number;
  mermaidBlocks: number;
  admonitions: number;
  references: number;
  footnotes: number;
}

const allContentStats: Record<string, FileContentStats> = {};
let totalCodeBlocks = 0;
let totalMermaidBlocks = 0;
let totalAdmonitionsCount = 0;
let totalReferences = 0;
let totalFootnotes = 0;

for (const doc of docs) {
  const slugParts = doc.id.split("/");
  let rawContent = "";
  if (slugParts.length >= 2) {
    const categoryFolder = slugParts[0];
    const docFile = slugParts[1];
    const docsFolders = fs
      .readdirSync(DOCS_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    const matchingFolder = docsFolders.find((f) => f.endsWith(categoryFolder));
    if (matchingFolder) {
      const folderPath = path.join(DOCS_DIR, matchingFolder);
      const mdFiles = fs
        .readdirSync(folderPath)
        .filter((f) => f.endsWith(".md"))
        .filter((f) => f.replace(/^\d+-/, "").replace(".md", "") === docFile);
      if (mdFiles.length > 0) {
        rawContent = fs.readFileSync(path.join(folderPath, mdFiles[0]), "utf-8");
      }
    }
  }

  const analysis = analyzeContent(rawContent, doc.id, diags);
  allContentStats[doc.id] = {
    codeBlocks: analysis.stats.codeBlocks,
    mermaidBlocks: analysis.stats.mermaidBlocks,
    admonitions: analysis.stats.admonitions,
    references: analysis.stats.references,
    footnotes: analysis.stats.footnotes,
  };
  totalCodeBlocks += analysis.stats.codeBlocks;
  totalMermaidBlocks += analysis.stats.mermaidBlocks;
  totalAdmonitionsCount += analysis.stats.admonitions;
  totalReferences += analysis.stats.references;
  totalFootnotes += analysis.stats.footnotes;
}

// Sort by enrichment score (lower = more enrichment potential)
const sortedByEnrichment = Object.entries(allContentStats).sort((a, b) => {
  const scoreA =
    a[1].codeBlocks + a[1].mermaidBlocks + a[1].admonitions + a[1].references + a[1].footnotes;
  const scoreB =
    b[1].codeBlocks + b[1].mermaidBlocks + b[1].admonitions + b[1].references + b[1].footnotes;
  return scoreA - scoreB;
});

// Show files with least enrichment (most potential)
console.log(`\n${colors.yellow}Files needing enrichment (sorted by priority):${colors.reset}`);
let shown = 0;
for (const [file, stats] of sortedByEnrichment) {
  if (shown >= 20) break;
  const score =
    stats.codeBlocks + stats.mermaidBlocks + stats.admonitions + stats.references + stats.footnotes;
  if (score < 5) {
    console.log(`\n${colors.dim}${file}${colors.reset}`);
    console.log(
      `   code: ${stats.codeBlocks} | mermaid: ${stats.mermaidBlocks} | admonitions: ${stats.admonitions} | refs: ${stats.references} | footnotes: ${stats.footnotes}`
    );
    shown++;
  }
}

console.log(`\n${colors.bright}Overall Summary:${colors.reset}`);
console.log(`   Code blocks: ${totalCodeBlocks} (${totalMermaidBlocks} mermaid)`);
console.log(`   Admonitions: ${totalAdmonitionsCount}`);
console.log(`   References: ${totalReferences}`);
console.log(`   Footnotes: ${totalFootnotes}`);
console.log(
  `\n${colors.dim}💡 Higher counts = more enriched content. Files with low counts need attention.${colors.reset}`
);

// ─── Broken Links Summary ────────────────────────────────────────
const brokenFiles = Object.keys(brokenLinksByFile);
if (brokenFiles.length > 0) {
  console.log("");
  console.log(
    `${colors.yellow}${colors.bright}🔗 Broken Links Summary (${brokenFiles.length} file(s))${colors.reset}`
  );
  console.log("═".repeat(60));

  for (const file of brokenFiles.sort()) {
    const links = brokenLinksByFile[file];
    console.log(`\n${colors.cyan}📄 ${file}${colors.reset}`);
    for (const link of links) {
      console.log(
        `   ${colors.red}✗${colors.reset} "${link.text}" → ${colors.yellow}${link.href}${colors.reset}`
      );
      console.log(`     ↪ ${colors.dim}Slug not found: ${link.slug}${colors.reset}`);
    }
  }

  const totalLinks = brokenFiles.reduce((sum, f) => sum + brokenLinksByFile[f].length, 0);
  console.log(
    `\n${colors.bright}Total: ${totalLinks} broken link${totalLinks !== 1 ? "s" : ""} across ${brokenFiles.length} file(s)${colors.reset}`
  );
  console.log(`${colors.dim}💡 Fix these links to point to valid document slugs${colors.reset}`);
  console.log("");
}

// Check for --json flag to output diagnostics as JSON
const args = process.argv.slice(2);
if (args.includes("--json")) {
  fs.writeFileSync(
    path.join(ROOT, "diagnostics.json"),
    JSON.stringify(diags.toJSON(), null, 2),
    "utf-8"
  );
  console.log("💾 Diagnostics written to diagnostics.json");
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
console.log("🗺️  Sitemap generated: sitemap.xml");

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
console.log("🤖 robots.txt generated: robots.txt");

console.log(`💾 Written to ${GEN_DIR}/`);
console.log("✨ Done!");
