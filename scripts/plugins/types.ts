/**
 * Markdown Plugin Interface
 *
 * Plugins can transform markdown content before or after
 * the markdown-to-HTML conversion step in the build pipeline.
 *
 * Pipeline:
 *   raw .md → preProcess() → marked → postProcess() → docs-data.ts
 */

export interface MarkdownPlugin {
  /** Unique plugin name */
  name: string;

  /**
   * Run BEFORE marked converts markdown to HTML.
   * Use this to transform markdown syntax into something else,
   * or to inject custom markdown syntax.
   */
  preProcess?(md: string): string;

  /**
   * Run AFTER marked converts markdown to HTML.
   * Use this to transform HTML output, replace code blocks,
   * or inject scripts/styles.
   */
  postProcess?(html: string): string | Promise<string>;
}

/**
 * Markdown Validator Plugin Interface
 *
 * Validators analyze markdown content for enrichment metrics,
 * quality checks, and recommendations.
 *
 * They run independently of the build pipeline and can be
 * invoked via `bun run validate` commands.
 */

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  severity: ValidationSeverity;
  file: string;
  line?: number;
  message: string;
  detail?: string;
}

export interface ValidationResult {
  /** Number of items checked */
  checked: number;
  /** Issues found */
  issues: ValidationIssue[];
  /** Statistics for reporting */
  stats?: Record<string, number>;
}

export interface MarkdownValidator {
  /** Unique validator name */
  name: string;

  /** Human-readable label */
  label: string;

  /**
   * Validate a single markdown file.
   * Returns validation result with issues and stats.
   */
  validate(content: string, filePath: string): ValidationResult | Promise<ValidationResult>;

  /**
   * Whether validation should fail the build.
   * Use for critical checks (e.g., required descriptions).
   */
  isStrict?: boolean;
}
