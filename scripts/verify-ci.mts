#!/usr/bin/env bun
/**
 * CI Mirror Verification
 *
 * Simulates the Cloudflare build environment to catch "ghost" type errors
 * and generation failures before they hit the cloud.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { colors } from "./core/index.ts";
import { Logger } from "./core/logger.ts";
import { paths } from "./core/paths.ts";

const logger = new Logger();
const projectRoot = paths.root;

async function run(command: string, args: string[]) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      cwd: projectRoot,
      shell: true,
    });
    child.on("close", (code) => {
      code === 0 ? resolve(code) : reject(new Error(`Command ${command} failed with ${code}`));
    });
  });
}

async function main() {
  logger.raw("🚀 Starting CI-Mirror Verification", colors.cyan);
  logger.blank();

  try {
    // 1. Wipe generated files to ensure we aren't relying on stale artifacts
    logger.step("Step 1: Wiping generated artifacts...");
    const genDir = join(projectRoot, "src/generated");
    if (existsSync(genDir)) {
      rmSync(genDir, { recursive: true, force: true });
    }
    mkdirSync(genDir, { recursive: true });
    logger.success("Clean slate achieved.");

    // 2. Regenerate documentation
    logger.step("Step 2: Regenerating documentation...");
    await run("bun", ["run", "scripts/cli.mts", "docs"]);
    logger.success("Documentation regenerated.");

    // 3. Strict Type Check
    logger.step("Step 3: Running strict TypeScript check...");
    // We use --noEmit and ensure it's checking the whole project including generated
    await run("bunx", ["tsc", "--noEmit"]);
    logger.success("Type check passed.");

    // 4. Lint Check
    logger.step("Step 4: Running Biome lint check...");
    await run("bunx", ["biome", "check", "."]);
    logger.success("Lint check passed.");

    logger.blank();
    logger.raw("✅ CI-Mirror Verification Successful!", colors.green);
    logger.info("Your code is safe to push to Cloudflare.");
  } catch (error: any) {
    logger.blank();
    logger.raw("❌ CI-Mirror Verification Failed!", colors.red);
    logger.error(error.message);
    process.exit(1);
  }
}

main();
