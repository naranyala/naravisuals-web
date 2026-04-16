#!/usr/bin/env bun
/**
 * Unified Markdown Validator
 *
 * Centralized validation orchestrator using clean, modular infrastructure
 * Runs all registered validators and outputs compact reports
 *
 * Usage:
 *   bun run validate              # Run all validators
 *   bun run validate --strict     # Exit with error on strict failures
 */

import { logger, paths } from "./core/index.ts";
import { runValidation } from "./validation/manager.ts";

async function main() {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");

  logger.section("Unified Markdown Validator", "Quality checks for markdown content");

  const success = await runValidation({ docsDir: paths.docs, strict });

  if (strict && !success) {
    process.exit(1);
  }

  if (!success) {
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error(error.message);
  process.exit(1);
});
