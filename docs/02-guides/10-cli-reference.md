---
title: CLI Reference
description: Complete guide to the docts unified command-line interface
sidebar_label: CLI Reference
sidebar_position: 12
---

# CLI Reference

:::tip CLI Workflow
Use `docts dev` for development with HMR. For faster iteration after content changes, use `docts docs` to regenerate documentation only (skips the rspack build).
:::

The `docts` CLI is a unified command-line interface for the entire SSG documentation site generator. It handles everything from development to production deployment.

## Installation

The CLI is built into the project and can be run in two ways:

```bash:desc=Two methods to run the docts CLI: via npm script with bun run, or direct execution after making the script executable with chmod.
# Via npm script
bun run docts <command>

# Direct execution (after chmod +x)
./scripts/cli.mts <command>
```

## Available Commands

### Development

#### `docts dev`

Start the development server with Hot Module Replacement (HMR).

```mermaid:desc=State diagram showing the docts dev server lifecycle: it starts with docs regeneration, then rspack dev server with HMR, enters watch state for file changes, hot-reloads on changes, and handles graceful shutdown.
state-viz
{
  "Start" -> "Docs Regenerating"
  "Docs Regenerating" -> "Rspack Dev Server"
  "Rspack Dev Server" -> "HMR Watch State"
  "HMR Watch State" -> "Hot Reload" : File changed
  "Hot Reload" -> "HMR Watch State"
  "HMR Watch State" -> "Graceful Shutdown" : Ctrl+C
}
```

```bash:desc=Start the rspack dev server with HMR on default port 3000 or custom port. Auto-detects port conflicts and increments to next available port.
# Default port (3000)
docts dev

# Custom port
docts dev -p 8080
docts dev --port 8080
```

**What it does:**
1. Regenerates documentation from markdown files
2. Starts rspack dev server with HMR enabled
3. Watches for file changes and hot-reloads
4. **Auto-detects port conflicts** and increments to next available port

**Port Detection:**
If the specified port (default 3000) is already in use, the CLI will automatically find the next available port (3001, 3002, etc.) and display a warning message.

### Building

#### `docts build`

Build the project for production.

```bash:desc=Production build command with optional flags to skip lint checks (--no-lint), fail on lint errors (--strict), or preserve dist directory (--no-clean) for faster rebuilds.
# Standard build
docts build

# Skip lint checks (faster)
docts build --no-lint

# Strict mode (fail on any lint errors)
docts build --strict

# Skip cleaning dist (faster rebuild)
docts build --no-clean
```

**What it does:**
1. Cleans `dist/` directory (unless `--no-clean`)
2. Regenerates documentation from markdown
3. Runs lint checks (unless `--no-lint`)
4. Runs rspack production build
5. Shows build summary with timing and file sizes

### Serving

#### `docts start`

Serve the production build from `dist/`.

```bash:desc=Start the production static file server on default or custom port. Requires running docts build first to generate the dist/ directory.
# Default port
docts start

# Custom port
docts start -p 8080
```

**Requirements:** Must run `docts build` first.

**Port Detection:** Automatically finds an available port if the specified one is in use.

#### `docts preview`

Build and serve in one command. Perfect for testing production locally.

```bash:desc=Combined build and serve command for quick production testing. Supports custom port and build flags like --no-lint for faster execution.
# Build + serve on default port
docts preview

# Build + serve on custom port
docts preview -p 8080

# Build without lint
docts preview --no-lint
```

**What it does:**
1. Runs full production build
2. Starts static file server with SPA fallback
3. Serves on specified port
4. **Auto-detects port conflicts** and uses next available port

### Documentation

#### `docts docs`

Regenerate documentation only (faster than full build).

```bash:desc=Fast documentation regeneration without full production build. Use when only markdown files changed for quick iteration during content writing.
docts docs
```

**Use when:**
- You only changed markdown files
- You want fast iteration during writing
- You're testing markdown features

### Code Quality

#### `docts lint`

Check code quality with Biome.

```bash:desc=Run Biome linter to check code quality and formatting. Use --fix or lint:fix to automatically resolve fixable issues.
# Check only
docts lint

# Auto-fix issues
docts lint:fix
docts lint --fix
```

### Testing

#### `docts test`

Run the test suite.

```bash:desc=Execute the test suite with Bun test. Supports watch mode for development (--watch) and coverage reporting (--coverage).
# Run all tests
docts test

# Watch mode
docts test --watch

# With coverage
docts test --coverage
```

### Maintenance

#### `docts clean`

Clean all build artifacts.

```bash:desc=Remove all build artifacts including dist/ and coverage/ directories. Use before fresh builds to ensure clean state.
docts clean
```

**What it removes:**
- `dist/` (production build)
- `coverage/` (test coverage)

#### `docts info`

Show project information.

```bash:desc=Display project metadata including name, version, documentation file count, build status, dependencies, and available CLI commands.
docts info
```

**Shows:**
- Project name and version
- Documentation file count
- Build status
- Dependencies
- Available commands

### Help

#### `docts --help`

Show help message with all commands and options.

```bash:desc=Display CLI help documentation listing all available commands, flags, and usage examples. Both long and short flag forms supported.
docts --help
docts -h
```

#### `docts version`

Show the CLI version.

```bash:desc=Print the current version number of the docts CLI. Supports both --version and -v flags.
docts --version
docts -v
```

## Command Options

| Option | Alias | Applies To | Description |
|--------|-------|------------|-------------|
| `--port <n>` | `-p` | `dev`, `start`, `preview` | Specify port number (default: 3000) |
| `--no-lint` | — | `build`, `preview` | Skip lint checks during build |
| `--strict` | — | `build` | Fail build on lint errors |
| `--no-clean` | — | `build` | Skip cleaning dist directory |
| `--watch` | — | `test` | Run tests in watch mode |
| `--coverage` | — | `test` | Generate coverage report |
| `--help` | `-h` | Any | Show help message |
| `--version` | `-v` | Any | Show version |

## Common Workflows

### Writing Documentation

```bash:desc=Fast iteration workflow for documentation writing: start dev server with HMR for live updates, or use docs command for quick regeneration only.
# Fast iteration during writing
docts dev

# Or just regenerate docs
docts docs
```

### Testing Production Build

```bash:desc=Test production build locally: use preview for combined build+serve, or separate build and start commands for more control over the process.
# Full build + preview
docts preview

# Or separate
docts build
docts start -p 3000
```

### CI/CD Pipeline

```bash:desc=CI/CD workflow using strict build mode to fail on any issues, with fallback to skip lint for speed, followed by test execution with coverage reporting.
# Strict build (fail on any issues)
docts build --strict

# Or skip lint for speed
docts build --no-lint

# Run tests
docts test --coverage
```

### Debugging

```bash:desc=Debug workflow: check project info with info command, then perform clean rebuild to resolve stale state or unexpected build artifacts.
# Check project info
docts info

# Clean and rebuild
docts clean
docts build
```

## Command Aliases

The CLI supports several command aliases:

| Primary | Aliases |
|---------|---------|
| `dev` | `serve` |
| `build` | `bundle` |
| `lint` | `check` |
| `lint:fix` | `--fix` flag |
| `test` | `tests` |
| `info` | `status` |
| `docs` | `docs:build` |

## Exit Codes

| Code | Meaning |
|------|----------|
| `0` | Success |
| `1` | Failure (build error, lint failure, test failure) |
