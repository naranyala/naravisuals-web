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

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import net from "node:net";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(join(__filename, ".."));
const projectRoot = process.cwd();

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlue: "\x1b[44m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgRed: "\x1b[41m",
};

function log(message = "", color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logError(message) {
  log(`✖ ${message}`, colors.red);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

function logWarn(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logStep(message) {
  log(`\n${colors.bright}${colors.cyan}▸ ${message}${colors.reset}`);
}

function banner() {
  log("", colors.cyan);
  log("╔═══════════════════════════════════════════════════╗", colors.cyan);
  log("║                                                   ║", colors.cyan);
  log("║   SSG Documentation Site Generator                ║", colors.cyan);
  log("║   rspack + React + ShikiJS                        ║", colors.cyan);
  log("║                                                   ║", colors.cyan);
  log("╚═══════════════════════════════════════════════════╝", colors.cyan);
  log("", colors.cyan);
}

function runCommand(command, args, options = {}) {
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

function _runCommandSync(command, args) {
  return spawnSync(command, args, {
    stdio: "pipe",
    cwd: projectRoot,
    shell: true,
    env: { ...process.env },
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

// ─── Commands ──────────────────────────────────────────────────────────────

async function cmdDev(options) {
  banner();

  const startPort = Number(options.port) || 3000;
  const port = await findAvailablePort(startPort);

  if (port !== startPort) {
    logWarn(`Port ${startPort} is in use, using port ${port} instead`);
  }

  logInfo("Starting development server...");
  logInfo("Hot Module Replacement (HMR) enabled");
  logInfo(`Port: ${port}`);
  log("");

  try {
    // Step 0: Build docs (validation happens in CI/build, not during dev)
    // Dev mode skips validation to allow rapid iteration
    logStep("Building documentation...");
    await runCommand("bun", ["run", "scripts/build-docs.mts"]);
    logSuccess("Documentation built");

    // Step 2: Start rspack dev server
    logStep("Starting rspack dev server...");
    log("");
    log(`${colors.dim}Waiting for file changes...${colors.reset}`);
    log("");

    // Pass port as CLI argument, not just env var
    await runCommand("bunx", ["rspack", "serve", "--port", String(port)]);
  } catch (error) {
    logError(`Development server failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdBuild(options) {
  banner();
  logInfo("Building for production...");
  log("");

  const startTime = Date.now();

  try {
    // Step 1: Clean dist
    if (!options.skipClean) {
      logStep("Cleaning dist directory...");
      await runCommand("rm", ["-rf", "dist"]);
      logSuccess("Dist cleaned");
    }

    // Step 2: Build docs
    logStep("Building documentation...");
    await runCommand("bun", ["run", "scripts/build-docs.mts"]);
    logSuccess("Documentation built");

    // Step 3: Lint (optional)
    if (!options.skipLint) {
      logStep("Running lint checks...");
      try {
        await runCommand("bunx", ["biome", "check", "."]);
        logSuccess("Lint checks passed");
      } catch {
        if (options.strict) {
          logError("Lint checks failed. Use --no-strict to continue anyway.");
          process.exit(1);
        }
        logWarn("Lint issues found, continuing build...");
      }
    }

    // Step 4: Production build
    logStep("Running rspack production build...");
    await runCommand("bunx", ["rspack", "build"], {
      env: { NODE_ENV: "production" },
    });
    logSuccess("Production bundle created");

    // Step 5: Copy third-party libraries
    logStep("Copying third-party libraries...");
    try {
      await runCommand("bun", ["run", "scripts/copy-libs.mts"]);
      logSuccess("Libraries copied to dist/");
    } catch {
      logWarn("Failed to copy libraries (using CopyRspackPlugin fallback)");
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log("");
    log(`${colors.bright}${colors.bgGreen} BUILD COMPLETE ${colors.reset}`);
    log(`${colors.green}Build completed in ${duration}s${colors.reset}`);
    log(`${colors.green}Output: dist/${colors.reset}`);
    log("");

    // Show build stats
    if (existsSync(join(projectRoot, "dist"))) {
      const files = readdirSync(join(projectRoot, "dist"));
      const jsFiles = files.filter((f) => f.endsWith(".js"));
      const totalSize = jsFiles.reduce((acc, file) => {
        const stat = Bun.file(join(projectRoot, "dist", file));
        return acc + stat.size;
      }, 0);

      logInfo(`Generated ${files.length} files (${(totalSize / 1024).toFixed(1)} KB)`);
    }
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdStart(options) {
  banner();

  const startPort = Number(options.port) || Number(process.env.PORT) || 3000;
  const port = await findAvailablePort(startPort);

  if (port !== startPort) {
    logWarn(`Port ${startPort} is in use, using port ${port} instead`);
  }

  // Check if dist exists
  if (!existsSync(join(projectRoot, "dist"))) {
    logError("Production build not found. Run 'docts build' first.");
    logInfo("Or use 'docts preview' to build and serve in one command.");
    process.exit(1);
  }

  logInfo(`Serving production build on port ${port}...`);
  logInfo("Static files with SPA fallback");
  log("");

  try {
    await runCommand("npx", ["serve", "dist", "-p", String(port), "-s"]);
  } catch (error) {
    logError(`Server failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdPreview(options) {
  banner();
  logInfo("Build + Preview mode");
  log("");

  try {
    // Build first
    await cmdBuild(options);

    log("");
    logStep("Starting preview server...");
    log("");
    log(`${colors.dim}Press Ctrl+C to stop${colors.reset}`);
    log("");

    // Then serve with port detection
    const startPort = Number(options.port) || Number(process.env.PORT) || 3000;
    const port = await findAvailablePort(startPort);

    if (port !== startPort) {
      logWarn(`Port ${startPort} is in use, using port ${port} instead`);
    }

    logInfo(`Serving on port ${port}...`);
    log("");

    await runCommand("npx", ["serve", "dist", "-p", String(port), "-s"]);
  } catch (error) {
    logError(`Preview failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdDocs(options = {}) {
  banner();
  logInfo("Regenerating documentation...");
  log("");

  try {
    // Validate before building
    if (!options.skipValidation) {
      logInfo("Validating content...");
      try {
        await runCommand("bun", ["run", "validate:strict"]);
        logSuccess("All validations passed");
      } catch (_error) {
        logError("Strict validation failed. Please fix the issues before building.");
        logInfo("Run 'bun run validate' to see details");
        logInfo("Use --skip-validation to bypass this check");
        process.exit(1);
      }
    }

    await runCommand("bun", ["run", "scripts/build-docs.mts"]);
    logSuccess("Documentation regenerated");
    log("");
    logInfo("Output: src/generated/");

    // Count docs
    const docsDir = join(projectRoot, "docs");
    if (existsSync(docsDir)) {
      const docs = readdirSync(docsDir, { recursive: true }).filter(
        (f) => typeof f === "string" && f.endsWith(".md")
      );
      logInfo(`Found ${docs.length} markdown files`);
    }
  } catch (error) {
    logError(`Docs build failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdLint(options) {
  banner();
  logInfo("Checking code quality...");
  log("");

  try {
    if (options.fix) {
      await runCommand("bunx", ["biome", "check", "--write", "."]);
      logSuccess("Lint issues auto-fixed");
    } else {
      await runCommand("bunx", ["biome", "check", "."]);
      logSuccess("All checks passed");
    }
  } catch {
    if (!options.fix) {
      logError("Lint issues found. Run 'docts lint:fix' to auto-fix.");
    }
    process.exit(1);
  }
}

async function cmdTest(options) {
  banner();
  logInfo("Running test suite...");
  log("");

  try {
    const args = ["test"];
    if (options.watch) args.push("--watch");
    if (options.coverage) args.push("--coverage");

    await runCommand("bun", args);

    if (options.coverage) {
      log("");
      logInfo("Coverage report: coverage/index.html");
    }
  } catch (error) {
    logError(`Tests failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdClean() {
  banner();
  logInfo("Cleaning build artifacts...");
  log("");

  try {
    await runCommand("rm", ["-rf", "dist"]);
    logSuccess("dist/ cleaned");

    await runCommand("rm", ["-rf", "coverage"]);
    logSuccess("coverage/ cleaned");

    log("");
    logSuccess("Clean complete");
  } catch (error) {
    logError(`Clean failed: ${error.message}`);
    process.exit(1);
  }
}

async function cmdInfo() {
  banner();
  log(`${colors.bright}Project Information${colors.reset}`);
  log("");

  // Read package.json
  const pkgPath = join(projectRoot, "package.json");
  if (!existsSync(pkgPath)) {
    logError("package.json not found. Are you in the project root?");
    process.exit(1);
  }

  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

  log(`${colors.bright}Name:${colors.reset}        ${pkg.name || "N/A"}`);
  log(`${colors.bright}Version:${colors.reset}     ${pkg.version || "N/A"}`);
  log("");

  // Count docs
  const docsDir = join(projectRoot, "docs");
  const blogDir = join(projectRoot, "blog");
  let docCount = 0;
  let blogCount = 0;

  if (existsSync(docsDir)) {
    docCount = readdirSync(docsDir, { recursive: true }).filter(
      (f) => typeof f === "string" && f.endsWith(".md")
    ).length;
  }

  if (existsSync(blogDir)) {
    blogCount = readdirSync(blogDir, { recursive: true }).filter(
      (f) => typeof f === "string" && f.endsWith(".md")
    ).length;
  }

  log(`${colors.bright}Documentation:${colors.reset}`);
  log(`  Docs:  ${docCount} files`);
  log(`  Blog:  ${blogCount} files`);
  log("");

  // Check build status
  const distExists = existsSync(join(projectRoot, "dist"));
  log(`${colors.bright}Build:${colors.reset}`);
  log(
    `  Status:  ${distExists ? `${colors.green}Built${colors.reset}` : `${colors.yellow}Not built${colors.reset}`}`
  );

  if (distExists) {
    const files = readdirSync(join(projectRoot, "dist"));
    log(`  Files:   ${files.length}`);
  }
  log("");

  // Dependencies
  log(`${colors.bright}Dependencies:${colors.reset}`);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const keyDeps = ["react", "marked", "shiki", "mermaid", "@rspack/core", "@biomejs/biome"];
  for (const dep of keyDeps) {
    if (deps[dep]) {
      log(`  ${dep.padEnd(20)} ${deps[dep]}`);
    }
  }
  log("");

  // Scripts
  log(`${colors.bright}Available Commands:${colors.reset}`);
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

    for (const [cmd, desc] of commands) {
      log(`  ${cmd.padEnd(18)} ${desc}`);
    }
  }
  log("");
}

function showHelp() {
  banner();
  log(`${colors.bright}Usage:${colors.reset}`);
  log("  docts <command> [options]");
  log("");
  log(`${colors.bright}Commands:${colors.reset}`);
  log("");
  log(`  ${colors.green}dev${colors.reset}              Start development server with hot reload`);
  log(`  ${colors.green}build${colors.reset}            Build for production`);
  log(`  ${colors.green}start${colors.reset}            Serve production build`);
  log(`  ${colors.green}preview${colors.reset}          Build + serve production locally`);
  log(`  ${colors.green}docs${colors.reset}             Regenerate documentation only`);
  log(`  ${colors.green}lint${colors.reset}             Check code quality`);
  log(`  ${colors.green}lint:fix${colors.reset}         Auto-fix lint issues`);
  log(`  ${colors.green}test${colors.reset}             Run test suite`);
  log(`  ${colors.green}clean${colors.reset}            Clean build artifacts`);
  log(`  ${colors.green}info${colors.reset}             Show project information`);
  log("");
  log(`${colors.bright}Options:${colors.reset}`);
  log("");
  log("  --port, -p <port>    Specify port number (default: 3000)");
  log("  --no-lint            Skip lint checks during build");
  log("  --skip-validation    Skip codeblock description validation");
  log("  --strict             Fail build on lint errors");
  log("  --watch              Watch mode (for tests)");
  log("  --coverage           Generate coverage report");
  log("  --help, -h           Show this help message");
  log("  --version, -v        Show version");
  log("");
  log(`${colors.bright}Examples:${colors.reset}`);
  log("");
  log("  docts dev                    # Start dev server on port 3000");
  log("  docts dev -p 8080            # Start dev server on port 8080");
  log("  docts build                  # Full production build");
  log("  docts build --no-lint        # Build without lint");
  log("  docts preview                # Build + preview locally");
  log("  docts test --coverage        # Run tests with coverage");
  log("");
}

function showVersion() {
  const pkgPath = join(projectRoot, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    log(`SSG Documentation Generator v${pkg.version || "0.1.0"}`);
  } else {
    log("SSG Documentation Generator v0.1.0");
  }
}

// ─── Parse Arguments ───────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    command: argv[2] || "help",
    port: null,
    fix: false,
    watch: false,
    coverage: false,
    skipLint: false,
    skipClean: false,
    skipValidation: false,
    strict: false,
  };

  for (let i = 3; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--port" || arg === "-p") {
      args.port = argv[++i];
    } else if (arg === "--no-lint") {
      args.skipLint = true;
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

  // Map command aliases
  const commandMap = {
    dev: "dev",
    serve: "dev",
    build: "build",
    bundle: "build",
    start: "start",
    preview: "preview",
    docs: "docs",
    "docs:build": "docs",
    lint: "lint",
    "lint:fix": "lint",
    check: "lint",
    test: "test",
    tests: "test",
    clean: "clean",
    info: "info",
    status: "info",
    version: "version",
    help: "help",
  };

  const command = commandMap[args.command] || "help";

  // Detect lint:fix
  if (args.command === "lint:fix" || args.fix) {
    args.fix = true;
  }

  try {
    switch (command) {
      case "dev":
        await cmdDev(args);
        break;
      case "build":
        await cmdBuild(args);
        break;
      case "start":
        await cmdStart(args);
        break;
      case "preview":
        await cmdPreview(args);
        break;
      case "docs":
        await cmdDocs();
        break;
      case "lint":
        await cmdLint(args);
        break;
      case "test":
        await cmdTest(args);
        break;
      case "clean":
        await cmdClean();
        break;
      case "info":
        await cmdInfo();
        break;
      default:
        showHelp();
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      logError(`Command not found: ${args.command}`);
      logInfo("Run 'docts --help' for available commands");
    } else {
      logError(`Unexpected error: ${error.message}`);
    }
    process.exit(1);
  }
}

main();
