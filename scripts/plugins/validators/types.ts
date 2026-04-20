/**
 * Validator Type Definitions
 *
 * Shared interfaces for markdown validators.
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
  stats?: Record<string, any>;
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
