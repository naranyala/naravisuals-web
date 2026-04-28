#!/usr/bin/env bun

/**
 * SSG Documentation CLI
 *
 * Unified command-line interface for the rspack React ShikiJS documentation site generator.
 * Handles everything from development to production deployment.
 *
 * Usage:
 *   ssg dev              Start development server with hot reload
 *   ssg build            Build for production
 *   ssg start            Serve production build
 *   ssg preview          Build + serve production locally
 *   ssg docs             Regenerate documentation only
 *   ssg lint             Check code quality
 *   ssg lint:fix         Auto-fix lint issues
 *   ssg test             Run test suite
 *   ssg clean            Clean build artifacts
 *   ssg info             Show project information
 */

import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import net from "node:net";
import path, { join } from "node:path";
import glob from "fast-glob";
import { match, P } from "ts-pattern";

import { c, colors } from "./core/index.ts";
import { Logger } from "./core/logger.ts";
import { paths } from "./core/paths.ts";

const logger = new Logger();
const projectRoot = paths.root;
process.env.PROJECT_NAME = path.basename(projectRoot);

function banner() {
  logger.raw("", colors.cyan);
  logger.raw("╔═══════════════════════════════════════════════════╗", colors.cyan);
  logger.raw("║                                                   ║", colors.cyan);
  logger.raw("║   SSG Documentation Site Generator                ║", colors.cyan);
  logger.raw("║   rspack + React + ShikiJS                        ║", colors.cyan);
  logger.raw("║                                                   ║", colors.cyan);
  logger.raw("╚═══════════════════════════════════════════════════╝", colors.cyan);
  logger.raw("", colors.cyan);
}

function runCommand(command: string, args: string[], options: any = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.silent ? "pipe" : "inherit",
      env: { ...process.env, ...options.env },
      cwd: options.cwd || projectRoot,
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    if (options.onOutput) {
      child.stdout?.on("data", options.onOutput);
      child.stderr?.on("data", options.onOutput);
    }
  });
}

/**
 * Check if a port is available
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

/**
 * Find an available port starting from the given port
 */
async function findAvailablePort(startPort: number, maxAttempts = 10): Promise<number> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const port = startPort + attempt;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  // If all attempts fail, return 0 (OS will assign random port)
  return 0;
}

async function cmdTypeCheck() {
  logger.step("Running TypeScript type checks...");
  try {
    await runCommand("bunx", ["tsc", "--noEmit"]);
    logger.success("Type checks passed");
  } catch (_error) {
    logger.warn("TypeScript type checks failed, but continuing build...");
  }
}

// ─── Commands ──────────────────────────────────────────────────────────────

async function cmdDev(options: any) {
  banner();

  const port = options.port || 3000;

  logger.info("Starting development server...");
  logger.info("Hot Module Replacement (HMR) enabled");
  logger.info(`Port: ${port}`);
  logger.blank();

  try {
    // Step 0: Build docs (validation happens in CI/build, not during dev)
    // Dev mode skips validation to allow rapid iteration
    logger.step("Building documentation...");
    await runCommand("bun", ["run", "scripts/build-docs.mts"]);
    logger.success("Documentation built");

    // Step 0.5: Type Check
    if (!options.skipTypeCheck) {
      await cmdTypeCheck();
    }

    // Step 2: Start rspack dev server
    logger.step("Starting rspack dev server...");
    logger.blank();
    logger.raw(`Waiting for file changes...${colors.reset}`);
    logger.blank();

    // Pass port as CLI argument, not just env var
    await runCommand("bun", ["run", "rspack", "serve", "--port", String(port)], {
      env: { ...process.env, PROJECT_NAME: path.basename(projectRoot) },
    });
  } catch (error: any) {
    logger.error(`Development server failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdBuild(options: any) {
  banner();
  logger.info("Building for production...");
  logger.blank();

  const startTime = Date.now();

  try {
    // Step 1: Clean dist
    if (!options.skipClean) {
      logger.step("Cleaning dist directory...");
      await runCommand("rm", ["-rf", "dist"]);
      logger.success("Dist cleaned");
    }

    // Step 1.5: Clean generated files to avoid stale artifacts (Crucial for CI consistency)
    if (!options.skipClean) {
      logger.step("Cleaning generated directory...");
      await runCommand("rm", ["-rf", join(projectRoot, "src/generated")]);
      logger.success("Generated files cleaned");
    }

    // Step 2: Build docs
    logger.step("Building documentation...");
    await runCommand("bun", ["run", "scripts/build-docs.mts"]);
    logger.success("Documentation built");

    // Step 2.5: Type Check
    if (!options.skipTypeCheck) {
      await cmdTypeCheck();
    }

    // Step 3: Lint (optional)
    if (!options.skipLint) {
      logger.step("Running lint checks...");
      try {
        await runCommand("bunx", ["biome", "check", "."]);
        logger.success("Lint checks passed");
      } catch {
        if (options.strict) {
          logger.error("Lint checks failed. Use --no-strict to continue anyway.");
          process.exit(1);
        }
        logger.warn("Lint issues found, continuing build...");
      }
    }

    // Step 4: Production build
    logger.step("Running rspack production build...");
    await runCommand("bun", ["run", "rspack", "build"], {
      env: { NODE_ENV: "production" },
    });
    logger.success("Production bundle created");

    // Step 5: Copy third-party libraries
    logger.step("Copying third-party libraries...");
    try {
      await runCommand("bun", ["run", "scripts/copy-libs.mts"]);
      logger.success("Libraries copied to dist/");
    } catch {
      logger.warn("Failed to copy libraries (using CopyRspackPlugin fallback)");
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.blank();
    logger.raw(`${colors.bgGreen} BUILD COMPLETE ${colors.reset}`);
    logger.raw(`Build completed in ${duration}s${colors.reset}`);
    logger.raw(`Output: dist/${colors.reset}`);
    logger.blank();

    // Show build stats
    if (existsSync(join(projectRoot, "dist"))) {
      const files = readdirSync(join(projectRoot, "dist"));
      const jsFiles = files.filter((f) => f.endsWith(".js"));
      const totalSize = jsFiles.reduce((acc, file) => {
        const stat = Bun.file(join(projectRoot, "dist", file));
        return acc + stat.size;
      }, 0);

      logger.info(`Generated ${files.length} files (${(totalSize / 1024).toFixed(1)} KB)`);
    }
  } catch (error: any) {
    logger.error(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdStart(options: any) {
  banner();

  const port = options.port || 3000;

  // Check if dist exists
  if (!existsSync(join(projectRoot, "dist"))) {
    logger.error("Production build not found. Run 'docts build' first.");
    logger.info("Or use 'docts preview' to build and serve in one command.");
    process.exit(1);
  }

  logger.info(`Serving production build on port ${port}...`);
  logger.info("Static files with SPA fallback");
  logger.blank();

  try {
    await runCommand("npx", ["serve", "dist", "-p", String(port), "-s"]);
  } catch (error: any) {
    logger.error(`Server failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdPreview(options: any) {
  banner();
  logger.info("Build + Preview mode");
  logger.blank();

  try {
    // Build first
    await cmdBuild(options);

    logger.blank();
    logger.step("Starting preview server...");
    logger.blank();
    logger.raw(`Press Ctrl+C to stop${colors.reset}`);
    logger.blank();

    // Then serve with port detection
    const startPort = Number(options.port) || Number(process.env.PORT) || 3000;
    const port = await findAvailablePort(startPort);

    if (port !== startPort) {
      logger.warn(`Port ${startPort} is in use, using port ${port} instead`);
    }

    logger.info(`Serving on port ${port}...`);
    logger.blank();

    await runCommand("npx", ["serve", "dist", "-p", String(port), "-s"]);
  } catch (error: any) {
    logger.error(`Preview failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdDocs(options: any = {}) {
  banner();
  logger.info("Regenerating documentation...");
  logger.blank();

  try {
    // Validate before building
    if (!options.skipValidation) {
      logger.info("Validating content...");
      try {
        await runCommand("bun", ["run", "validate:strict"]);
        logger.success("All validations passed");
      } catch (_error) {
        logger.error("Strict validation failed. Please fix the issues before building.");
        logger.info("Run 'bun run validate' to see details");
        logger.info("Use --skip-validation to bypass this check");
        process.exit(1);
      }
    }

    await runCommand("bun", ["run", "scripts/build-docs.mts"]);
    logger.success("Documentation regenerated");
    logger.blank();
    logger.info("Output: src/generated/");

    // Count docs
    const docsDir = join(projectRoot, "docs");
    if (existsSync(docsDir)) {
      const docs = glob.sync("**/*.md", { cwd: docsDir });
      logger.info(`Found ${docs.length} markdown files`);
    }
  } catch (error: any) {
    logger.error(`Docs build failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdLint(options: any) {
  banner();
  logger.info("Checking code quality...");
  logger.blank();

  try {
    if (options.fix) {
      await runCommand("bunx", ["biome", "check", "--write", "."]);
      logger.success("Lint issues auto-fixed");
    } else {
      const args = ["biome", "check", "."];
      // Biome doesn't have a --strict flag in the same way, but we can treat warnings as errors
      // if we want. By default 'check' fails on errors.
      await runCommand("bunx", args);
      logger.success("All checks passed");
    }
  } catch (error) {
    if (!options.fix) {
      logger.error("Lint issues found. Run 'docts lint:fix' to auto-fix.");
    }
    throw error;
  }
}

async function cmdTest(options: any) {
  banner();
  logger.info("Running test suite...");
  logger.blank();

  try {
    const args = ["test"];
    if (options.watch) args.push("--watch");
    if (options.coverage) args.push("--coverage");

    await runCommand("bun", args);

    if (options.coverage) {
      logger.blank();
      logger.info("Coverage report: coverage/index.html");
    }
  } catch (error: any) {
    logger.error(`Tests failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdClean() {
  banner();
  logger.info("Cleaning build artifacts...");
  logger.blank();

  try {
    await runCommand("rm", ["-rf", "dist"]);
    logger.success("dist/ cleaned");

    await runCommand("rm", ["-rf", "coverage"]);
    logger.success("coverage/ cleaned");

    logger.blank();
    logger.success("Clean complete");
  } catch (error: any) {
    logger.error(`Clean failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdInfo() {
  banner();
  logger.raw(`Project Information${colors.reset}`);
  logger.blank();

  // Read package.json
  const pkgPath = join(projectRoot, "package.json");
  if (!existsSync(pkgPath)) {
    logger.error("package.json not found. Are you in the project root?");
    process.exit(1);
  }

  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

  logger.raw(`Name:${colors.reset}        ${pkg.name || "N/A"}`);
  logger.raw(`Version:${colors.reset}     ${pkg.version || "N/A"}`);
  logger.blank();

  // Count docs
  const docsDir = join(projectRoot, "docs");
  let docCount = 0;

  if (existsSync(docsDir)) {
    docCount = glob.sync("**/*.md", { cwd: docsDir }).length;
  }

  logger.raw(`Documentation:${colors.reset}`);
  logger.raw(`  Docs:  ${docCount} files`);
  logger.blank();

  // Check build status
  const distExists = existsSync(join(projectRoot, "dist"));
  logger.raw(`Build:${colors.reset}`);
  logger.raw(
    `  Status:  ${distExists ? `${colors.green}Built${colors.reset}` : `${colors.yellow}Not built${colors.reset}`}`
  );

  if (distExists) {
    const files = readdirSync(join(projectRoot, "dist"));
    logger.raw(`  Files:   ${files.length}`);
  }
  logger.blank();

  // Dependencies
  logger.raw(`Dependencies:${colors.reset}`);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const keyDeps = ["react", "marked", "shiki", "mermaid", "@rspack/core", "@biomejs/biome"];
  for (const dep of keyDeps) {
    if (deps[dep]) {
      logger.raw(`  ${dep.padEnd(20)} ${deps[dep]}`);
    }
  }
  logger.blank();

  // Scripts
  logger.raw(`Available Commands:${colors.reset}`);
  if (pkg.scripts) {
    const commands = [
      ["docts dev", "Start development server"],
      ["docts build", "Build for production"],
      ["docts start", "Serve production build"],
      ["docts preview", "Build + serve in one command"],
      ["docts docs", "Regenerate documentation"],
      ["docts lint", "Check code quality"],
      ["docts lint:fix", "Auto-fix lint issues"],
      ["docts test", "Run test suite"],
      ["docts clean", "Clean build artifacts"],
      ["docts info", "Show project information"],
    ];

    for (const entry of commands) {
      if (!entry) continue;
      const [cmd, desc] = entry;
      logger.raw(`  ${(cmd || "").padEnd(18)} ${desc}`);
    }
  }
  logger.blank();
}

function showHelp() {
  banner();
  logger.raw(`Usage:${colors.reset}`);
  logger.raw("  docts <command> [options]");
  logger.blank();
  logger.raw(`Commands:${colors.reset}`);
  logger.blank();
  logger.raw(
    `  ${colors.green}dev${colors.reset}              Start development server with hot reload`
  );
  logger.raw(`  ${colors.green}build${colors.reset}            Build for production`);
  logger.raw(`  ${colors.green}start${colors.reset}            Serve production build`);
  logger.raw(`  ${colors.green}preview${colors.reset}          Build + serve production locally`);
  logger.raw(`  ${colors.green}docs${colors.reset}             Regenerate documentation only`);
  logger.raw(`  ${colors.green}lint${colors.reset}             Check code quality`);
  logger.raw(`  ${colors.green}lint:fix${colors.reset}         Auto-fix lint issues`);
  logger.raw(`  ${colors.green}test${colors.reset}             Run test suite`);
  logger.raw(`  ${colors.green}clean${colors.reset}            Clean build artifacts`);
  logger.raw(`  ${colors.green}info${colors.reset}             Show project information`);
  logger.blank();
  logger.raw(`Options:${colors.reset}`);
  logger.blank();
  logger.raw("  --port, -p <port>    Specify port number (default: 3000)");
  logger.raw("  --no-lint            Skip lint checks during build");
  logger.raw("  --skip-validation    Skip codeblock description validation");
  logger.raw("  --strict             Fail build on lint errors");
  logger.raw("  --watch              Watch mode (for tests)");
  logger.raw("  --coverage           Generate coverage report");
  logger.raw("  --help, -h           Show this help message");
  logger.raw("  --version, -v        Show version");
  logger.raw("  --rust, -r           Use Rust implementation (requires build)");
  logger.blank();
  logger.raw(`Examples:${colors.reset}`);
  logger.blank();
  logger.raw("  docts dev                    # Start dev server on port 3000");
  logger.raw("  docts dev -p 8080            # Start dev server on port 8080");
  logger.raw("  docts build                  # Full production build");
  logger.raw("  docts build --no-lint        # Build without lint");
  logger.raw("  docts preview                # Build + preview locally");
  logger.raw("  docts test --coverage        # Run tests with coverage");
  logger.blank();
}

function showVersion() {
  const pkgPath = join(projectRoot, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    logger.raw(`SSG Documentation Generator v${pkg.version || "0.1.0"}`);
  } else {
    logger.raw("SSG Documentation Generator v0.1.0");
  }
}

// ─── Parse Arguments ───────────────────────────────────────────────────────

function parseArgs(argv: any) {
  const args: {
    command: string;
    port: string | null;
    fix: boolean;
    watch: boolean;
    coverage: boolean;
    skipLint: boolean;
    skipClean: boolean;
    skipValidation: boolean;
    skipTypeCheck: boolean;
    strict: boolean;
    useRust: boolean;
  } = {
    command: argv[2] || "help",
    port: null,
    fix: false,
    watch: false,
    coverage: false,
    skipLint: false,
    skipClean: false,
    skipValidation: false,
    skipTypeCheck: false,
    strict: false,
    useRust: false,
  };

  for (let i = 3; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--port" || arg === "-p") {
      args.port = argv[++i];
    } else if (arg === "--rust" || arg === "-r") {
      args.useRust = true;
    } else if (arg === "-rust") {
      logger.warn(
        "The '-rust' flag is deprecated. Please use the standard '--rust' or '-r' instead."
      );
      args.useRust = true;
    } else if (arg === "--no-lint") {
      args.skipLint = true;
    } else if (arg === "--no-type-check" || arg === "--skip-type-check") {
      args.skipTypeCheck = true;
    } else if (arg === "--skip-validation") {
      args.skipValidation = true;
    } else if (arg === "--strict") {
      args.strict = true;
    } else if (arg === "--fix") {
      args.fix = true;
    } else if (arg === "--watch") {
      args.watch = true;
    } else if (arg === "--coverage") {
      args.coverage = true;
    } else if (arg === "--no-clean") {
      args.skipClean = true;
    } else if (arg === "--help" || arg === "-h") {
      showHelp();
      process.exit(0);
    } else if (arg === "--version" || arg === "-v") {
      showVersion();
      process.exit(0);
    }
  }

  return args;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);

  // Unified command dispatcher using ts-pattern
  const command = match(args.command)
    .with(P.union("dev", "serve"), () => "dev")
    .with(P.union("build", "bundle"), () => "build")
    .with("start", () => "start")
    .with("preview", () => "preview")
    .with(P.union("docs", "docs:build"), () => "docs")
    .with(P.union("lint", "check"), () => "lint")
    .with("lint:fix", () => "lint")
    .with(P.union("typecheck", "type-check"), () => "typecheck")
    .with(P.union("test", "tests"), () => "test")
    .with("clean", () => "clean")
    .with(P.union("info", "status"), () => "info")
    .with("version", () => "version")
    .otherwise(() => "help");

  // Detect lint:fix
  if (args.command === "lint:fix" || args.fix) {
    args.fix = true;
  }

  // Handle port detection for relevant commands
  let port = null;
  if (["dev", "start", "preview"].includes(command)) {
    const startPort = Number(args.port) || Number(process.env.PORT) || 3000;
    port = await findAvailablePort(startPort);
    if (port !== startPort) {
      logger.warn(`Port ${startPort} is in use, using port ${port} instead`);
    }
    args.port = String(port);
  }

  if (args.useRust) {
    const rustBinary = join(projectRoot, "scripts-rs/target/release/scripts-rs");
    const debugBinary = join(projectRoot, "scripts-rs/target/debug/scripts-rs");
    const binary = existsSync(rustBinary)
      ? rustBinary
      : existsSync(debugBinary)
        ? debugBinary
        : null;

    if (!binary) {
      logger.error("Rust binary not found. Please build it first:");
      logger.info("cd scripts-rs && cargo build --release");
      process.exit(1);
    }

    logger.info(`Using Rust implementation: ${c(binary, "dim")}`);

    // Forward command and arguments to Rust binary
    // We explicitly pass the detected port if we found one
    const rustArgs = [command];

    // Add other flags
    if (args.skipClean) rustArgs.push("--skip-clean");
    if (args.skipLint) rustArgs.push("--skip-lint");
    if (args.strict) rustArgs.push("--strict");
    if (args.skipValidation) rustArgs.push("--skip-validation");
    if (args.fix) rustArgs.push("--fix");
    if (args.watch) rustArgs.push("--watch");
    if (args.coverage) rustArgs.push("--coverage");
    if (port) {
      rustArgs.push("--port");
      rustArgs.push(String(port));
    }

    try {
      await runCommand(binary, rustArgs);
      process.exit(0);
    } catch (_error: any) {
      process.exit(1);
    }
  }

  try {
    await match(command)
      .with("dev", () => cmdDev(args))
      .with("build", () => cmdBuild(args))
      .with("start", () => cmdStart(args))
      .with("preview", () => cmdPreview(args))
      .with("docs", () => cmdDocs())
      .with("lint", () => cmdLint(args))
      .with("typecheck", () => cmdTypeCheck())
      .with("test", () => cmdTest(args))
      .with("clean", () => cmdClean())
      .with("info", () => cmdInfo())
      .with("version", async () => showVersion())
      .otherwise(async () => showHelp());
  } catch (error: any) {
    if (error.code === "ENOENT") {
      logger.error(`Command not found: ${args.command}`);
      logger.info("Run 'docts --help' for available commands");
    } else {
      logger.error(`Unexpected error: ${error.message}`);
    }
    process.exit(1);
  }
}

main();
