/**
 * Build-Time Diagnostics
 *
 * Structured error/warning collection for the markdown build pipeline.
 * Catches: broken frontmatter, invalid YAML, duplicate slugs, broken
 * internal links, plugin failures, missing required fields, and admonition analysis.
 */

export type DiagnosticSeverity = "error" | "warning" | "info";
export type DiagnosticSource =
  | "frontmatter"
  | "links"
  | "slugs"
  | "plugin"
  | "content"
  | "build"
  | "admonitions";

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
    if (this.items.length === 0) return "✓ No diagnostics";

    const lines: string[] = [];
    const severityIcon: Record<DiagnosticSeverity, string> = {
      error: "✗",
      warning: "⚠",
      info: "ℹ",
    };

    for (const d of this.items) {
      const icon = severityIcon[d.severity];
      const pos = d.line ? `:${d.line}` : "";
      const header = `${icon} [${d.severity.toUpperCase()}] ${d.file}${pos} (${d.source})`;
      lines.push(header);
      lines.push(`   ${d.message}`);
      if (d.detail) lines.push(`   → ${d.detail}`);
    }

    const { errors, warnings, info } = this.summary();
    lines.push("");
    lines.push(`Summary: ${errors} error(s), ${warnings} warning(s), ${info} info`);
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
  // Match markdown links: [text](/path)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  let brokenCount = 0;

  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[2];
    const text = match[1];
    // Only validate internal doc links
    if (!href.startsWith("/docs/")) continue;

    // Strip query params, anchor fragments, and leading slash to get the slug
    // e.g. /docs/guides/configuration?ref=test#section → docs/guides/configuration
    const cleanHref = href.split("?")[0].split("#")[0].replace(/^\//, "");

    if (!knownSlugs.has(cleanHref)) {
      brokenCount++;
      diags.warn(
        "links",
        file,
        `Broken link: "${text}" → "${href}"`,
        `Slug "${cleanHref}" not found. Available slugs: ${Array.from(knownSlugs).sort().join(", ")}`
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

/**
 * Analyze admonitions in markdown content.
 * Returns stats and recommendations for content enrichment.
 * Works on raw markdown (before HTML conversion).
 */
export function analyzeAdmonitions(
  markdownContent: string,
  file: string,
  diags: Diagnostics
): AdmonitionAnalysis {
  // Use simpler pattern that matches :::type anywhere in a line (more reliable)
  const admonitionRegex = /:::(\w+)/g;
  const types: Record<string, number> = {};
  let match: RegExpExecArray | null;
  let total = 0;

  while ((match = admonitionRegex.exec(markdownContent)) !== null) {
    const type = match[1].toLowerCase();
    types[type] = (types[type] || 0) + 1;
    total++;
  }

  const recommendations: string[] = [];

  if (total === 0) {
    recommendations.push(
      "No admonitions found. Consider adding :::tip, :::warning, :::note for clarity."
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

  // Check for missing common types
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

  // Count code blocks (```language)
  const codeBlockRegex = /^```(\w+)?/gm;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(markdownContent)) !== null) {
    stats.codeBlocks++;
    // Check if it's a mermaid block
    if (match[1]?.toLowerCase() === "mermaid") {
      stats.mermaidBlocks++;
    }
  }

  // Count admonitions (:::type)
  const admonitionRegex = /:::(\w+)/g;
  while ((match = admonitionRegex.exec(markdownContent)) !== null) {
    const type = match[1].toLowerCase();
    stats.admonitions++;
    stats.admonitionTypes[type] = (stats.admonitionTypes[type] || 0) + 1;
  }

  // Count references [text][url] or [text](url)
  const refRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  while ((match = refRegex.exec(markdownContent)) !== null) {
    // Only count if it looks like a reference (not internal link)
    if (!match[2].startsWith("/") && !match[2].startsWith("#")) {
      stats.references++;
    }
  }

  // Count footnotes [^1] or [^note]:
  const footnoteRegex = /\[\^(\w+)\]/g;
  while ((match = footnoteRegex.exec(markdownContent)) !== null) {
    stats.footnotes++;
  }

  // Add recommendations based on stats
  if (stats.codeBlocks === 0) {
    recommendations.push("No code blocks found - consider adding examples with ``` code blocks");
  }
  if (stats.mermaidBlocks === 0) {
    recommendations.push("No mermaid diagrams - consider adding visualizations with ```mermaid");
  }
  if (stats.admonitions === 0) {
    recommendations.push("No admonitions - add :::tip, :::warning, :::note for clarity");
  } else if (stats.admonitions < 2) {
    recommendations.push(
      `Only ${stats.admonitions} admonition(s) - consider adding more for context`
    );
  }
  if (stats.references === 0) {
    recommendations.push(
      "No external references - consider adding links to documentation or resources"
    );
  }
  if (stats.footnotes === 0) {
    recommendations.push("No footnotes - consider adding [^1] for additional notes and citations");
  }

  return {
    file,
    stats,
    recommendations,
  };
}
