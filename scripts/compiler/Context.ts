/**
 * Compilation Context
 * Manages shared state, diagnostics, and configuration during a build.
 */

import { colors } from "../core/index.ts";
import type { CompilerConfig, Diagnostic, DiagnosticSeverity, DiagnosticSource } from "./types.ts";

export class CompilationContext {
  private diagnostics: Diagnostic[] = [];
  public readonly config: CompilerConfig;
  public startTime: number = Date.now();

  constructor(config: CompilerConfig) {
    this.config = config;
  }

  report(diag: Diagnostic): void {
    this.diagnostics.push(diag);
  }

  error(
    source: DiagnosticSource,
    file: string,
    message: string,
    detail?: string,
    line?: number
  ): void {
    this.report({ severity: "error", source, file, message, detail, line });
  }

  warn(
    source: DiagnosticSource,
    file: string,
    message: string,
    detail?: string,
    line?: number
  ): void {
    this.report({ severity: "warning", source, file, message, detail, line });
  }

  info(source: DiagnosticSource, file: string, message: string): void {
    this.report({ severity: "info", source, file, message });
  }

  getDiagnostics(): ReadonlyArray<Diagnostic> {
    return this.diagnostics;
  }

  hasErrors(): boolean {
    return this.diagnostics.some((d) => d.severity === "error");
  }

  getSummary() {
    let errors = 0;
    let warnings = 0;
    let info = 0;
    for (const d of this.diagnostics) {
      if (d.severity === "error") errors++;
      else if (d.severity === "warning") warnings++;
      else info++;
    }
    return { errors, warnings, info };
  }

  formatReport(): string {
    if (this.diagnostics.length === 0) return `${colors.green}✓ No issues detected${colors.reset}`;

    const lines: string[] = [];
    const severityIcon: Record<DiagnosticSeverity, string> = {
      error: `${colors.red}✗${colors.reset}`,
      warning: `${colors.yellow}⚠${colors.reset}`,
      info: `${colors.blue}ℹ${colors.reset}`,
    };

    for (const d of this.diagnostics) {
      const icon = severityIcon[d.severity];
      const pos = d.line ? `:${d.line}` : "";
      const header = `${icon} ${colors.bright}[${d.severity.toUpperCase()}]${colors.reset} ${colors.cyan}${d.file}${colors.reset}${pos} (${colors.dim}${d.source}${colors.reset})`;
      lines.push(header);
      lines.push(`   ${d.message}`);
      if (d.detail) lines.push(`   ${colors.dim}→ ${d.detail}${colors.reset}`);
    }

    const { errors, warnings, info } = this.getSummary();
    lines.push("");
    lines.push(
      `${colors.bright}Summary:${colors.reset} ${colors.red}${errors} error(s)${colors.reset}, ${colors.yellow}${warnings} warning(s)${colors.reset}, ${colors.blue}${info} info${colors.reset}`
    );
    return lines.join("\n");
  }
}
