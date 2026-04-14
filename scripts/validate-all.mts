/**
 * Unified Markdown Validator
 *
 * Runs all registered validators from the plugin system.
 * Provides comprehensive content quality checks.
 *
 * Usage:
 *   bun run scripts/validate-all.mts          # Run all validators
 *   bun run scripts/validate-all.mts --strict # Exit on first strict failure
 *   bun run scripts/validate-all.mts --stats  # Show only summary stats
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { validators } from "./plugins/validators/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT, "docs");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

const WIDTH = 80;

function formatHeader(title: string, subtitle?: string): string {
  const border = colors.cyan + "─".repeat(WIDTH) + colors.reset;
  const padding = " ".repeat(Math.max(0, (WIDTH - title.length) / 2));
  const header = `${colors.cyan}${colors.bright}${padding}${title}${colors.reset}\n`;
  return subtitle
    ? `${border}\n${header}${colors.dim}${padding}${subtitle}${colors.reset}\n${border}`
    : `${border}\n${header}${border}`;
}

function formatSectionHeader(label: string, icon: string): string {
  const border = colors.magenta + "═".repeat(WIDTH) + colors.reset;
  return `\n${border}\n${colors.bright}${icon}  ${label}${colors.reset}\n${border}\n`;
}

function _formatProgressBar(current: number, total: number, label: string): string {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filled = Math.round((current / total) * barLength);
  const empty = barLength - filled;
  const bar = colors.green + "█".repeat(filled) + colors.dim + "░".repeat(empty) + colors.reset;
  return `  ${bar} ${colors.bright}${percentage}%${colors.reset} ${colors.dim}(${current}/${total} ${label})${colors.reset}`;
}

function formatSeverityBadge(severity: string): string {
  switch (severity) {
    case "error":
      return `${colors.red}${colors.bright}[ERROR]${colors.reset}`;
    case "warning":
      return `${colors.yellow}${colors.bright}[WARN]${colors.reset}`;
    case "info":
      return `${colors.cyan}${colors.bright}[INFO]${colors.reset}`;
    default:
      return `[${severity}]`;
  }
}

function formatStatusBadge(pass: boolean, strict: boolean): string {
  if (pass && !strict) {
    return `${colors.green}${colors.bright}✓ PASS${colors.reset}`;
  }
  if (pass && strict) {
    return `${colors.green}${colors.bright}✓ PASS${colors.reset} ${colors.dim}(strict clean)${colors.reset}`;
  }
  return `${colors.red}${colors.bright}✗ FAIL${colors.reset} ${colors.red}(strict)${colors.reset}`;
}

function formatMetric(label: string, value: string, highlight = false): string {
  const color = highlight ? colors.bright : colors.dim;
  return `  ${color}${label.padEnd(20)}${colors.reset} ${value}`;
}

interface ValidationSummary {
  validator: string;
  label: string;
  filesChecked: number;
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  strictIssues: number;
  pass: boolean;
}

function getValidatorIcon(index: number): string {
  const icons = ["📝", "📊", "📚", "🔗", "🖼️", "📏"];
  return icons[index] || "✓";
}

function scanMarkdownFiles(baseDir: string): { content: string; relPath: string }[] {
  const files: { content: string; relPath: string }[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const content = fs.readFileSync(full, "utf-8");
        const relPath = path.relative(ROOT, full);
        files.push({ content, relPath });
      }
    }
  }

  walk(baseDir);
  return files;
}

interface LLMActionItem {
  priority: "high" | "medium" | "low";
  action: string;
  file: string;
  reason: string;
  howToFix: string;
  estimatedEffort: "quick" | "moderate" | "extensive";
}

function runLLMValidator(_showStatsOnly: boolean, strictMode: boolean) {
  const files = scanMarkdownFiles(DOCS_DIR);
  const summaries: ValidationSummary[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalInfos = 0;
  const allActionItems: LLMActionItem[] = [];

  for (const validator of validators) {
    let filesChecked = 0;
    let totalIssues = 0;
    let strictIssues = 0;
    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;

    for (const file of files) {
      const result = validator.validate(file.content, file.relPath);
      filesChecked++;
      totalIssues += result.issues.length;

      for (const issue of result.issues) {
        if (issue.severity === "error") {
          errorCount++;
          totalErrors++;
          if (validator.isStrict) strictIssues++;

          // Convert errors to LLM action items
          allActionItems.push({
            priority: "high",
            action: "fix_error",
            file: issue.file,
            reason: issue.message,
            howToFix: issue.detail || "See validator documentation",
            estimatedEffort: "quick",
          });
        } else if (issue.severity === "warning") {
          warningCount++;
          totalWarnings++;

          allActionItems.push({
            priority: "medium",
            action: "address_warning",
            file: issue.file,
            reason: issue.message,
            howToFix: issue.detail || "Review and improve",
            estimatedEffort: "moderate",
          });
        } else if (issue.severity === "info") {
          infoCount++;
          totalInfos++;

          allActionItems.push({
            priority: "low",
            action: "consider_enrichment",
            file: issue.file,
            reason: issue.message,
            howToFix: issue.detail || "Add content for clarity",
            estimatedEffort: "moderate",
          });
        }
      }
    }

    summaries.push({
      validator: validator.name,
      label: validator.label,
      filesChecked,
      totalIssues,
      errorCount,
      warningCount,
      infoCount,
      strictIssues,
      pass: strictIssues === 0,
    });
  }

  // Output LLM-friendly structured format
  console.log("<!-- VALIDATION_START -->");
  console.log("");
  console.log("## 📊 Validation Results");
  console.log("");

  // Summary
  const hasStrictFailure = summaries.some((s) => !s.pass);
  const totalIssues = totalErrors + totalWarnings + totalInfos;

  console.log("### Status");
  console.log("");
  console.log(`- **Total files scanned:** ${files.length}`);
  console.log(`- **Total issues found:** ${totalIssues}`);
  console.log(`- **Errors (must fix):** ${totalErrors}`);
  console.log(`- **Warnings (should fix):** ${totalWarnings}`);
  console.log(`- **Info (consider fixing):** ${totalInfos}`);
  console.log(`- **Strict validation:** ${hasStrictFailure ? "❌ FAILED" : "✅ PASSED"}`);
  console.log("");

  // Action items for LLM
  if (allActionItems.length > 0) {
    console.log("### 🎯 Recommended Actions for LLM-Code-Agent");
    console.log("");
    console.log(
      "The following actions are recommended to improve the markdown content. " +
        "Execute these tasks in priority order (high → medium → low)."
    );
    console.log("");

    // Group by priority
    const highPriority = allActionItems.filter((a) => a.priority === "high");
    const mediumPriority = allActionItems.filter((a) => a.priority === "medium");
    const lowPriority = allActionItems.filter((a) => a.priority === "low");

    if (highPriority.length > 0) {
      console.log("#### 🔴 HIGH PRIORITY (Must Fix)");
      console.log("");
      console.log(
        `**${highPriority.length} action(s)** - These will cause build failures or affect content quality.`
      );
      console.log("");

      // Group by action type
      const actionGroups: Record<string, typeof highPriority> = {};
      for (const item of highPriority) {
        if (!actionGroups[item.action]) actionGroups[item.action] = [];
        actionGroups[item.action].push(item);
      }

      for (const [action, items] of Object.entries(actionGroups)) {
        console.log(`**Action:** ${action.replace(/_/g, " ")}`);
        console.log(`**Affected files:** ${items.length}`);
        console.log("");

        // Group files by section for batch processing
        const sectionGroups: Record<string, string[]> = {};
        for (const item of items) {
          const section = item.file.split("/").slice(0, 2).join("/");
          if (!sectionGroups[section]) sectionGroups[section] = [];
          sectionGroups[section].push(item.file);
        }

        for (const [section, sectionFiles] of Object.entries(sectionGroups)) {
          console.log(`  ${section}:`);
          for (const file of sectionFiles.slice(0, 5)) {
            console.log(`    - \`${file}\``);
          }
          if (sectionFiles.length > 5) {
            console.log(`    - ... and ${sectionFiles.length - 5} more`);
          }
        }
        console.log("");

        // Provide context
        if (items.length > 0) {
          console.log(`**Reason:** ${items[0].reason}`);
          console.log(`**How to fix:** ${items[0].howToFix}`);
          console.log("");
        }
      }
    }

    if (mediumPriority.length > 0) {
      console.log("#### 🟡 MEDIUM PRIORITY (Should Fix)");
      console.log("");
      console.log(`**${mediumPriority.length} action(s)** - These improve content quality.`);
      console.log("");

      const uniqueFiles = [...new Set(mediumPriority.map((a) => a.file))];
      console.log(`**Affected files:** ${uniqueFiles.length}`);
      console.log("");

      for (const file of uniqueFiles.slice(0, 10)) {
        console.log(`- \`${file}\``);
      }
      if (uniqueFiles.length > 10) {
        console.log(`- ... and ${uniqueFiles.length - 10} more`);
      }
      console.log("");

      if (mediumPriority.length > 0) {
        console.log(`**Reason:** ${mediumPriority[0].reason}`);
        console.log(`**How to fix:** ${mediumPriority[0].howToFix}`);
        console.log("");
      }
    }

    if (lowPriority.length > 0) {
      console.log("#### 🟢 LOW PRIORITY (Consider Fixing)");
      console.log("");
      console.log(
        `**${lowPriority.length} action(s)** - These are enrichment suggestions for better clarity.`
      );
      console.log("");

      const uniqueFiles = [...new Set(lowPriority.map((a) => a.file))];
      console.log(`**Affected files:** ${uniqueFiles.length}`);
      console.log("");

      for (const file of uniqueFiles.slice(0, 10)) {
        console.log(`- \`${file}\``);
      }
      if (uniqueFiles.length > 10) {
        console.log(`- ... and ${uniqueFiles.length - 10} more`);
      }
      console.log("");

      if (lowPriority.length > 0) {
        console.log(`**Reason:** ${lowPriority[0].reason}`);
        console.log(`**How to fix:** ${lowPriority[0].howToFix}`);
        console.log("");
      }
    }

    // Next steps for LLM
    console.log("### 🤖 Next Steps for LLM-Code-Agent");
    console.log("");
    console.log("Based on the validation results, the LLM-code-agent should:");
    console.log("");

    if (highPriority.length > 0) {
      console.log(
        "1. **Fix errors first** - Address all HIGH PRIORITY items to ensure build success"
      );
    }
    if (mediumPriority.length > 0) {
      console.log("2. **Improve warnings** - Address MEDIUM PRIORITY items for better quality");
    }
    if (lowPriority.length > 0) {
      console.log(
        "3. **Enrich content** - Consider LOW PRIORITY enrichment suggestions for clarity"
      );
    }

    console.log("");
    console.log("Use `bun run validate` to verify fixes after making changes.");
    console.log("");
  } else {
    console.log("### ✅ No Actions Needed");
    console.log("");
    console.log("All validations passed. No enrichment or fixes required at this time.");
    console.log("");
  }

  // Structured JSON data for programmatic use
  console.log("<!-- VALIDATION_JSON_START -->");
  console.log("```json");
  console.log(
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          totalFiles: files.length,
          totalIssues,
          errors: totalErrors,
          warnings: totalWarnings,
          info: totalInfos,
          strictPass: !hasStrictFailure,
        },
        validators: summaries.map((s) => ({
          name: s.validator,
          label: s.label,
          filesChecked: s.filesChecked,
          totalIssues: s.totalIssues,
          errorCount: s.errorCount,
          warningCount: s.warningCount,
          infoCount: s.infoCount,
          strictIssues: s.strictIssues,
          pass: s.pass,
        })),
        actionItems: allActionItems,
      },
      null,
      2
    )
  );
  console.log("```");
  console.log("<!-- VALIDATION_JSON_END -->");
  console.log("");
  console.log("<!-- VALIDATION_END -->");

  // Exit code
  if (strictMode && hasStrictFailure) {
    process.exit(1);
  }
}

function runValidators() {
  const args = process.argv.slice(2);
  const showStatsOnly = args.includes("--stats");
  const strictMode = args.includes("--strict");
  const llmMode = args.includes("--llm") || args.includes("--json");

  if (llmMode) {
    runLLMValidator(showStatsOnly, strictMode);
  } else {
    runHumanValidator(showStatsOnly, strictMode);
  }
}

function runHumanValidator(showStatsOnly: boolean, strictMode: boolean) {
  console.log(formatHeader("🔍 Unified Markdown Validator", "Quality checks for markdown content"));
  console.log(
    `\n${colors.bright}Validators:${colors.reset} ${validators.map((v) => v.label).join(" → ")}\n`
  );

  const files = scanMarkdownFiles(DOCS_DIR);
  console.log(
    `${colors.dim}Scanning ${files.length} markdown files in ${DOCS_DIR}${colors.reset}\n`
  );

  const summaries: ValidationSummary[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalInfos = 0;

  for (let vIndex = 0; vIndex < validators.length; vIndex++) {
    const validator = validators[vIndex];
    console.log(formatSectionHeader(validator.label, getValidatorIcon(vIndex)));

    let filesChecked = 0;
    let totalIssues = 0;
    let strictIssues = 0;
    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;
    const filesWithIssues: string[] = [];
    const fileIssueDetails: Array<{ file: string; issues: any[] }> = [];

    for (const file of files) {
      const result = validator.validate(file.content, file.relPath);
      filesChecked++;

      if (result.issues.length > 0) {
        totalIssues += result.issues.length;
        filesWithIssues.push(file.relPath);
        fileIssueDetails.push({ file: file.relPath, issues: result.issues });

        for (const issue of result.issues) {
          if (issue.severity === "error") {
            errorCount++;
            totalErrors++;
            if (validator.isStrict) strictIssues++;
          } else if (issue.severity === "warning") {
            warningCount++;
            totalWarnings++;
          } else if (issue.severity === "info") {
            infoCount++;
            totalInfos++;
          }
        }

        if (!showStatsOnly) {
          for (const issue of result.issues) {
            const badge = formatSeverityBadge(issue.severity);
            const lineInfo = issue.line ? `${colors.dim}:${issue.line}${colors.reset}` : "";
            const fileDisplay = `${colors.dim}${issue.file}${colors.reset}${lineInfo}`;

            console.log(`  ${badge}  ${fileDisplay}`);
            console.log(`         ${issue.message}`);
            if (issue.detail) {
              console.log(`         ${colors.dim}→ ${issue.detail}${colors.reset}`);
            }
            console.log("");
          }
        }
      }
    }

    const pass = strictIssues === 0;
    summaries.push({
      validator: validator.name,
      label: validator.label,
      filesChecked,
      totalIssues,
      errorCount,
      warningCount,
      infoCount,
      strictIssues,
      pass,
    });

    if (!showStatsOnly) {
      console.log(colors.dim + "─".repeat(WIDTH) + colors.reset);
    }

    console.log(formatMetric("Files checked:", `${filesChecked}`, true));
    console.log(formatMetric("Total issues:", `${totalIssues}`, totalIssues > 0));
    console.log(formatMetric("  Errors:", `${errorCount}`, errorCount > 0));
    console.log(formatMetric("  Warnings:", `${warningCount}`, warningCount > 0));
    console.log(formatMetric("  Info:", `${infoCount}`, false));

    if (validator.isStrict) {
      console.log(formatMetric("Strict issues:", `${strictIssues}`, strictIssues > 0));
    }

    const statusText = pass ? "PASS" : "FAIL";
    const statusColor = pass ? colors.green : colors.red;
    console.log(
      formatMetric("Status:", `${statusColor}${colors.bright}${statusText}${colors.reset}`, !pass)
    );

    if (filesWithIssues.length > 0 && !showStatsOnly) {
      console.log(
        `\n${colors.bright}Files with issues:${colors.reset} ${filesWithIssues.length}\n`
      );
      for (const f of filesWithIssues.slice(0, 15)) {
        console.log(`  ${colors.dim}•${colors.reset} ${f}`);
      }
      if (filesWithIssues.length > 15) {
        console.log(`  ${colors.dim}... and ${filesWithIssues.length - 15} more${colors.reset}`);
      }
    }
    console.log("");
  }

  // Overall summary
  console.log(formatHeader("📊 Overall Summary"));

  console.log("");
  let hasStrictFailure = false;

  const maxLabelLength = Math.max(...summaries.map((s) => s.label.length));

  for (const summary of summaries) {
    const labelPadded = summary.label.padEnd(maxLabelLength + 2);
    const statusBadge = formatStatusBadge(summary.pass, summary.strictIssues > 0);
    const issueBreakdown =
      summary.totalIssues > 0
        ? `${colors.dim}(${summary.errorCount} errors, ${summary.warningCount} warnings, ${summary.infoCount} info)${colors.reset}`
        : `${colors.green}(clean)${colors.reset}`;

    console.log(`  ${labelPadded} ${statusBadge}  ${issueBreakdown}`);

    if (!summary.pass) hasStrictFailure = true;
  }

  console.log(`\n${colors.dim}${"─".repeat(WIDTH)}${colors.reset}`);

  const totalIssues = totalErrors + totalWarnings + totalInfos;
  console.log(
    `\n  ${colors.bright}Total Issues:${colors.reset} ${totalIssues}  ${colors.dim}|${colors.reset}  ${colors.red}${totalErrors} errors${colors.reset}  ${colors.dim}|${colors.reset}  ${colors.yellow}${totalWarnings} warnings${colors.reset}  ${colors.dim}|${colors.reset}  ${colors.cyan}${totalInfos} info${colors.reset}`
  );

  const validatorsCount = validators.length;
  const passedCount = summaries.filter((s) => s.pass).length;
  const failedCount = validatorsCount - passedCount;

  console.log(
    `\n  ${colors.bright}Validators:${colors.reset} ${validatorsCount} total  ${colors.dim}|${colors.reset}  ${colors.green}${passedCount} passed${colors.reset}  ${colors.dim}|${colors.reset}  ${failedCount > 0 ? colors.red : colors.green}${failedCount} failed${colors.reset}`
  );

  // Exit code
  console.log(`\n${colors.dim}${"═".repeat(WIDTH)}${colors.reset}\n`);

  if (strictMode && hasStrictFailure) {
    console.log(
      `${colors.red}${colors.bright}✗ Build failed due to strict validation errors${colors.reset}\n`
    );
    process.exit(1);
  }

  if (totalErrors > 0) {
    console.log(
      `${colors.yellow}${colors.bright}⚠ Build succeeded but has ${totalErrors} error(s) to fix${colors.reset}\n`
    );
  } else {
    console.log(`${colors.green}${colors.bright}✓ All validations passed!${colors.reset}\n`);
  }
}

runValidators();
