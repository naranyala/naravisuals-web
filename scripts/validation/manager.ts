/**
 * Unified Validation Manager
 * Orchestrates all validators and produces compact reports
 * Single entry point for all validation operations
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { logger, paths } from "../core/index.ts";
import { validators } from "../plugins/validators/index.ts";
import { ReportGenerator } from "../report/generator.ts";

export interface ValidatorOptions {
  docsDir?: string;
  strict?: boolean;
}

export class ValidationManager {
  private docsDir: string;

  constructor(options: ValidatorOptions = {}) {
    this.docsDir = options.docsDir || paths.docs;
  }

  /**
   * Scan all markdown files in the docs directory
   */
  private scanMarkdownFiles(): Array<{ content: string; relPath: string }> {
    const files: Array<{ content: string; relPath: string }> = [];

    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          const content = fs.readFileSync(fullPath, "utf-8");
          const relPath = path.relative(paths.root, fullPath);
          files.push({ content, relPath });
        }
      }
    };

    walk(this.docsDir);
    return files;
  }

  /**
   * Run all validators and return reports
   */
  async validate(): Promise<ReportGenerator> {
    const files = this.scanMarkdownFiles();
    const report = new ReportGenerator();

    logger.group(`Validating ${files.length} markdown files`);

    for (const validator of validators) {
      let filesChecked = 0;
      let strictIssues = 0;
      const validatorIssues: Array<{
        severity: "error" | "warning" | "info";
        file: string;
        line?: number;
        message: string;
        detail?: string;
      }> = [];

      for (const file of files) {
        const result = await validator.validate(file.content, file.relPath);
        filesChecked++;

        for (const issue of result.issues) {
          if (issue.severity === "error" && validator.isStrict) {
            strictIssues++;
          }
          validatorIssues.push(issue);
        }
      }

      const pass = strictIssues === 0;
      report.addReport({
        validator: validator.name,
        label: validator.label,
        filesChecked,
        issues: validatorIssues,
        pass,
      });
    }

    logger.success(`Validation complete`);
    return report;
  }
}

/**
 * Run validation and output results
 */
export async function runValidation(options?: ValidatorOptions): Promise<boolean> {
  const manager = new ValidationManager(options);
  const report = await manager.validate();

  logger.blank();
  report.print();
  logger.blank();

  if (options?.strict && report.hasStrictFailure()) {
    logger.error("Strict validation failed");
    return false;
  }

  if (report.hasErrors()) {
    logger.error("Validation has errors");
    return false;
  }

  logger.success("All validations passed");
  return true;
}
