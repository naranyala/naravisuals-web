import { colors } from "./core/index.ts";

/**
 * Validate that all code blocks have a description in their info string.
 * Pattern: ```lang:desc=Description text
 */
export function validateCodeBlockDescriptions(
  markdownContent: string,
  file: string,
  diags: Diagnostics
): void {
  const lines = markdownContent.split("\n");
  let inCodeBlock = false;
  let fenceChar = "";
  let fenceLength = 0;
  let startLine = 0;

  lines.forEach((line, index) => {
    if (line === undefined) return;
    const match = line.match(/^(\s*)(`{3,}|~{3,})(\w+)?(.*)$/);

    if (inCodeBlock) {
      if (match && match[2] !== undefined) {
        const fence = match[2];
        const lang = match[3];
        // Closing fence must be at least as long as the opening fence and use the same character
        if (fence.startsWith(fenceChar) && fence.length >= fenceLength && !lang) {
          inCodeBlock = false;
          return;
        }
      }
      return;
    }

    if (match && match[2] !== undefined && match[4] !== undefined) {
      const fence = match[2];
      const language = match[3];
      const infoString = match[4];

      inCodeBlock = true;
      fenceChar = fence[0] || "`";
      fenceLength = fence.length;
      startLine = index + 1;

      // Check for description in both colon syntax and brace syntax
      const hasDesc =
        infoString.includes(":desc=") ||
        infoString.includes(":description=") ||
        /desc(?:ription)?\s*=\s*["']?([^"']+)["']?/.test(infoString);

      if (!hasDesc) {
        diags.warn(
          "content",
          file,
          `Missing description for ${language || "code"} block`,
          `Line ${startLine}: Code blocks should include a description for better documentation. Example: \`\`\`${language || "ts"}:desc=Description text\`\`\``
        );
      }
    }
  });
}

export type DiagnosticSeverity = "error" | "warning" | "info";
export type DiagnosticSource =
  | "frontmatter"
  | "links"
  | "slugs"
  | "plugin"
  | "content"
  | "build"
  | "admonitions"
  | "mermaid";

export interface Diagnostic {
  severity: DiagnosticSeverity;
  source: DiagnosticSource;
  file: string;
  message: string;
  /** Optional line number or position hint */
  line?: number;
  /** Optional detail/context about the issue */
  detail?: string;
}

export class Diagnostics {
  private items: Diagnostic[] = [];

  /** Record a single diagnostic */
  report(diag: Diagnostic): void {
    this.items.push(diag);
  }

  /** Convenience: record an error */
  error(source: DiagnosticSource, file: string, message: string, detail?: string): void {
    this.items.push({ severity: "error", source, file, message, detail });
  }

  /** Convenience: record a warning */
  warn(source: DiagnosticSource, file: string, message: string, detail?: string): void {
    this.items.push({ severity: "warning", source, file, message, detail });
  }

  /** Convenience: record an info */
  info(source: DiagnosticSource, file: string, message: string): void {
    this.items.push({ severity: "info", source, file, message });
  }

  /** Get all diagnostics */
  all(): ReadonlyArray<Diagnostic> {
    return this.items;
  }

  /** Get errors only */
  errors(): Diagnostic[] {
    return this.items.filter((d) => d.severity === "error");
  }

  /** Get warnings only */
  warnings(): Diagnostic[] {
    return this.items.filter((d) => d.severity === "warning");
  }

  /** Whether there are any errors */
  hasErrors(): boolean {
    return this.items.some((d) => d.severity === "error");
  }

  /** Count by severity */
  summary(): { errors: number; warnings: number; info: number } {
    let errors = 0;
    let warnings = 0;
    let info = 0;
    for (const d of this.items) {
      if (d.severity === "error") errors++;
      else if (d.severity === "warning") warnings++;
      else info++;
    }
    return { errors, warnings, info };
  }

  /** Clear all diagnostics */
  clear(): void {
    this.items.length = 0;
  }

  /** Merge another Diagnostics instance */
  merge(other: Diagnostics): void {
    this.items.push(...other.all());
  }

  /** Format as a human-readable string */
  format(): string {
    if (this.items.length === 0) return `${colors.green}✓ No diagnostics${colors.reset}`;

    const lines: string[] = [];
    const severityIcon: Record<DiagnosticSeverity, string> = {
      error: `${colors.red}✗${colors.reset}`,
      warning: `${colors.yellow}⚠${colors.reset}`,
      info: `${colors.blue}ℹ${colors.reset}`,
    };

    for (const d of this.items) {
      const icon = severityIcon[d.severity];
      const pos = d.line ? `:${d.line}` : "";
      const header = `${icon} ${colors.bright}[${d.severity.toUpperCase()}]${colors.reset} ${colors.cyan}${d.file}${colors.reset}${pos} (${colors.dim}${d.source}${colors.reset})`;
      lines.push(header);
      lines.push(`   ${d.message}`);
      if (d.detail) lines.push(`   ${colors.dim}→ ${d.detail}${colors.reset}`);
    }

    const { errors, warnings, info } = this.summary();
    lines.push("");
    lines.push(
      `${colors.bright}Summary:${colors.reset} ${colors.red}${errors} error(s)${colors.reset}, ${colors.yellow}${warnings} warning(s)${colors.reset}, ${colors.blue}${info} info${colors.reset}`
    );
    return lines.join("\n");
  }

  /** Format as JSON for programmatic consumption */
  toJSON(): Diagnostic[] {
    return [...this.items];
  }
}

/**
 * Validate internal markdown links against known slugs.
 * Finds [text](/docs/slug) patterns.
 * Returns the count of broken links found.
 */
export function validateInternalLinks(
  content: string,
  knownSlugs: Set<string>,
  file: string,
  diags: Diagnostics
): number {
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let brokenCount = 0;
  const matches = Array.from(content.matchAll(linkRegex));

  for (const match of matches) {
    const href = match[2];
    const text = match[1];
    if (href === undefined || text === undefined) continue;
    if (!href.startsWith("/docs/")) continue;

    const cleanHref = (href.split("?")[0] || "").split("#")[0]?.replace(/^\//, "") || "";
    const slug = cleanHref.startsWith("docs/") ? cleanHref.slice(5) : cleanHref;

    if (!knownSlugs.has(slug)) {
      brokenCount++;
      diags.warn(
        "links",
        file,
        `Broken link: "${text}" → "${href}"`,
        `Slug "${slug}" not found. Available slugs: ${Array.from(knownSlugs).sort().join(", ")}`
      );
    }
  }
  return brokenCount;
}

/**
 * Validate frontmatter has required fields.
 */
export function validateFrontmatter(
  fm: Record<string, unknown>,
  file: string,
  diags: Diagnostics
): void {
  if (!fm.title) {
    diags.error("frontmatter", file, "Missing required field: title");
  }
  if (!fm.description) {
    diags.warn("frontmatter", file, "Missing recommended field: description");
  }
}

/**
 * Validate for duplicate slugs across all documents.
 */
export function validateUniqueSlugs(
  entries: { id: string; slug: string; file?: string }[],
  diags: Diagnostics
): void {
  const seen = new Map<string, string>();
  for (const entry of entries) {
    const file = entry.file ?? entry.id;
    const existing = seen.get(entry.slug);
    if (existing) {
      diags.error(
        "slugs",
        file,
        `Duplicate slug: "${entry.slug}"`,
        `Also used by "${existing}". Each document must have a unique slug.`
      );
    } else {
      seen.set(entry.slug, file);
    }
  }
}

export interface AdmonitionStats {
  total: number;
  byType: Record<string, number>;
}

export interface AdmonitionAnalysis {
  file: string;
  stats: AdmonitionStats;
  hasAdmonitions: boolean;
  recommendations: string[];
}

export function analyzeAdmonitions(
  markdownContent: string,
  file: string,
  diags: Diagnostics
): AdmonitionAnalysis {
  const admonitionRegex = /(:::|!!!)(\w+)/g;
  const types: Record<string, number> = {};
  let total = 0;
  const admonitionMatches = Array.from(markdownContent.matchAll(admonitionRegex));

  for (const match of admonitionMatches) {
    const type = match[2]?.toLowerCase();
    if (type) {
      types[type] = (types[type] || 0) + 1;
      total++;
    }
  }

  const recommendations: string[] = [];

  if (total === 0) {
    recommendations.push(
      "No admonitions found. Consider adding :::tip or !!!tip, :::warning or !!!warning, :::note or !!!note for clarity."
    );
    diags.info(
      "admonitions",
      file,
      `No admonitions found - content may benefit from explanatory callouts`
    );
  } else if (total < 3) {
    recommendations.push(
      `Only ${total} admonition(s) found. Add more for key tips, warnings, and notes.`
    );
    diags.info(
      "admonitions",
      file,
      `Low admonition count (${total}) - consider adding more context callouts`
    );
  }

  const commonTypes = ["tip", "warning", "note"];
  for (const t of commonTypes) {
    if (!types[t]) {
      recommendations.push(`No :::${t} found. Consider adding for important ${t}s.`);
    }
  }

  return {
    file,
    stats: { total, byType: types },
    hasAdmonitions: total > 0,
    recommendations,
  };
}

export interface ContentStats {
  codeBlocks: number;
  mermaidBlocks: number;
  admonitions: number;
  admonitionTypes: Record<string, number>;
  references: number;
  footnotes: number;
}

export interface ContentAnalysis {
  file: string;
  stats: ContentStats;
  recommendations: string[];
}

export function analyzeContent(
  markdownContent: string,
  file: string,
  _diags: Diagnostics
): ContentAnalysis {
  const stats: ContentStats = {
    codeBlocks: 0,
    mermaidBlocks: 0,
    admonitions: 0,
    admonitionTypes: {},
    references: 0,
    footnotes: 0,
  };
  const recommendations: string[] = [];

  const codeBlockRegex = /^```(\w+)?/gm;
  const codeMatches = Array.from(markdownContent.matchAll(codeBlockRegex));
  for (const match of codeMatches) {
    stats.codeBlocks++;
    const lang = match[1]?.toLowerCase();
    if (lang === "mermaid") {
      stats.mermaidBlocks++;
    }
  }

  const admonitionRegex = /(:::|!!!)(\w+)/g;
  const admonitionMatches = Array.from(markdownContent.matchAll(admonitionRegex));
  for (const match of admonitionMatches) {
    const type = match[2]?.toLowerCase();
    if (type) {
      stats.admonitions++;
      stats.admonitionTypes[type] = (stats.admonitionTypes[type] || 0) + 1;
    }
  }

  const refRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const refMatches = Array.from(markdownContent.matchAll(refRegex));
  for (const match of refMatches) {
    const url = match[2];
    if (url && !url.startsWith("/") && !url.startsWith("#")) {
      stats.references++;
    }
  }

  const footnoteRegex = /\[\^(\w+)\]/g;
  const footnoteMatches = Array.from(markdownContent.matchAll(footnoteRegex));
  for (const _match of footnoteMatches) {
    stats.footnotes++;
  }

  if (stats.codeBlocks === 0) {
    recommendations.push("No code blocks found - consider adding examples with ``` code blocks");
  }
  if (stats.mermaidBlocks === 0) {
    recommendations.push("No mermaid diagrams - consider adding visualizations with ```mermaid");
  }
  if (stats.admonitions === 0) {
    recommendations.push(
      "No admonitions - add :::tip or !!!tip, :::warning or !!!warning, :::note or !!!note for clarity"
    );
  } else if (stats.admonitions < 2) {
    recommendations.push(
      `Only ${stats.admonitions} admonition(s) - consider adding more for context`
    );
  }

  return {
    file,
    stats,
    recommendations,
  };
}
