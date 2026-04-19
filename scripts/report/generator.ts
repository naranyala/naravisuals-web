/**
 * Unified report generation for validators and build analysis
 * Single source of truth for all documentation quality reporting
 */

import { c, colors, line } from "../core/colors.ts";

export interface ValidationIssue {
  severity: "error" | "warning" | "info";
  file: string;
  line?: number;
  message: string;
  detail?: string;
}

export interface ValidatorReport {
  validator: string;
  label: string;
  filesChecked: number;
  issues: ValidationIssue[];
  pass: boolean;
  stats?: Record<string, number | string>;
}

export class ReportGenerator {
  private reports: ValidatorReport[] = [];
  private sections: { title: string; subtitle?: string; content: string[] }[] = [];
  private totalErrors = 0;
  private totalWarnings = 0;
  private totalInfos = 0;

  addReport(report: ValidatorReport): void {
    this.reports.push(report);

    for (const issue of report.issues) {
      if (issue.severity === "error") this.totalErrors++;
      else if (issue.severity === "warning") this.totalWarnings++;
      else if (issue.severity === "info") this.totalInfos++;
    }
  }

  addSection(title: string, subtitle?: string): (line: string) => void {
    const content: string[] = [];
    this.sections.push({ title, subtitle, content });
    return (l: string) => content.push(l);
  }

  print(): void {
    // 1. Print formal validation issues
    for (const report of this.reports) {
      if (report.issues.length === 0) continue;

      for (const issue of report.issues) {
        const badge = this.formatBadge(issue.severity);
        const lineInfo = issue.line ? c(`:${issue.line}`, "dim") : "";
        const fileDisplay = c(issue.file, "dim") + lineInfo;

        console.log(`${badge}  ${fileDisplay}`);
        console.log(`       ${issue.message}`);
        if (issue.detail) {
          console.log(`       ${c("→", "dim")} ${c(issue.detail, "dim")}`);
        }
        console.log("");
      }
    }

    // 2. Print analysis sections
    for (const section of this.sections) {
      console.log(c(`\n${section.title}`, "cyan", "bright"));
      if (section.subtitle) console.log(c(section.subtitle, "dim"));
      console.log(line("═", 60, "dim"));

      for (const l of section.content) {
        console.log(l);
      }
    }

    // 3. Print global summary
    const totalIssues = this.totalErrors + this.totalWarnings + this.totalInfos;
    if (totalIssues > 0 || this.reports.length > 0) {
      this.printSummary();
    }
  }

  private formatBadge(severity: string): string {
    switch (severity) {
      case "error":
        return c("[ERROR]", "red", "bright");
      case "warning":
        return c("[WARN]", "yellow", "bright");
      case "info":
        return c("[INFO]", "cyan", "bright");
      default:
        return `[${severity}]`;
    }
  }

  private printSummary(): void {
    console.log("");
    console.log(line("─", 80, "dim"));

    const totalIssues = this.totalErrors + this.totalWarnings + this.totalInfos;
    console.log(
      c(`Total Issues: ${totalIssues}  `, "bright") +
        c(`| ${this.totalErrors} errors `, "red") +
        c(`| ${this.totalWarnings} warnings `, "yellow") +
        c(`| ${this.totalInfos} info`, "cyan")
    );

    if (this.reports.length > 0) {
      const passedCount = this.reports.filter((r) => r.pass).length;
      const failedCount = this.reports.length - passedCount;

      console.log(
        c(`Validators: ${this.reports.length} total  `, "bright") +
          c(`| ${passedCount} passed `, "green") +
          c(`| ${failedCount} failed${colors.reset}`, failedCount > 0 ? "red" : "green")
      );
    }
    console.log("");
  }

  hasErrors(): boolean {
    return this.totalErrors > 0;
  }

  hasStrictFailure(): boolean {
    return this.reports.some((r) => !r.pass);
  }
}
