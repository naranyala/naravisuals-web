#!/usr/bin/env bun

/**
 * CLI Utility: Find the longest line per file in the project
 *
 * Usage:
 *   bun run scripts/longest-line.ts [directory] [--min-length N] [--top N]
 *
 * Options:
 *   directory       Directory to scan (default: current directory)
 *   --min-length N  Only show lines with at least N characters (default: 0)
 *   --top N         Show only top N results (default: all)
 *   --json          Output as JSON instead of table
 *
 * Excluded directories:
 *   node_modules, .git, dist, .next, build, coverage
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Configuration ─────────────────────────────────────────────────

const EXCLUDED_DIRS = new Set(["node_modules", ".git", "dist", ".next", "build", "coverage"]);

const EXCLUDED_EXTENSIONS = new Set([
  ".map",
  ".lock",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".pdf",
]);

// ─── Types ─────────────────────────────────────────────────────────

interface FileResult {
  file: string;
  line: number;
  length: number;
  content: string;
}

interface Options {
  root: string;
  minLength: number;
  top: number | null;
  json: boolean;
}

// ─── Argument Parsing ──────────────────────────────────────────────

function parseArgs(args: string[]): Options {
  const options: Options = {
    root: ".",
    minLength: 0,
    top: null,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--min-length" && i + 1 < args.length) {
      options.minLength = parseInt(args[++i], 10);
    } else if (arg === "--top" && i + 1 < args.length) {
      options.top = parseInt(args[++i], 10);
    } else if (arg === "--json") {
      options.json = true;
    } else if (!arg.startsWith("-")) {
      options.root = arg;
    }
  }

  return options;
}

// ─── File Scanning ─────────────────────────────────────────────────

function shouldExcludeDirectory(name: string): boolean {
  return EXCLUDED_DIRS.has(name);
}

function shouldExcludeFile(name: string): boolean {
  const ext = path.extname(name).toLowerCase();
  return EXCLUDED_EXTENSIONS.has(ext);
}

function scanDirectory(dir: string, results: FileResult[], minLength: number, rootDir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!shouldExcludeDirectory(entry.name)) {
        scanDirectory(fullPath, results, minLength, rootDir);
      }
    } else if (entry.isFile()) {
      if (shouldExcludeFile(entry.name)) continue;

      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        const lines = content.split("\n");

        let maxLine = "";
        let maxLineNum = 1;

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].length > maxLine.length) {
            maxLine = lines[i];
            maxLineNum = i + 1;
          }
        }

        if (maxLine.length >= minLength) {
          results.push({
            file: path.relative(rootDir, fullPath),
            line: maxLineNum,
            length: maxLine.length,
            content: maxLine.length > 120 ? `${maxLine.slice(0, 120)}…` : maxLine,
          });
        }
      } catch {
        // Skip files we can't read (permissions, binary, etc.)
      }
    }
  }
}

// ─── Output Formatting ─────────────────────────────────────────────

function formatTable(results: FileResult[]) {
  if (results.length === 0) {
    console.log("No results found.");
    return;
  }

  const colFile = Math.max(35, ...results.map((r) => r.file.length));
  const colLine = Math.max(6, ...results.map((r) => String(r.line).length));
  const colLen = Math.max(8, ...results.map((r) => String(r.length).length));

  const header =
    "File".padEnd(colFile) +
    "  " +
    "Line".padStart(colLine) +
    "  " +
    "Length".padStart(colLen) +
    "  Content";

  const separator =
    "─".repeat(colFile) +
    "  " +
    "─".repeat(colLine) +
    "  " +
    "─".repeat(colLen) +
    "  " +
    "─".repeat(60);

  console.log(`\n📏 Longest lines per file (min: ${options.minLength} chars)\n`);
  console.log(header);
  console.log(separator);

  for (const r of results) {
    console.log(
      r.file.padEnd(colFile) +
        "  " +
        String(r.line).padStart(colLine) +
        "  " +
        String(r.length).padStart(colLen) +
        "  " +
        r.content
    );
  }

  console.log(`\n${results.length} files scanned\n`);
}

function formatJSON(results: FileResult[]) {
  console.log(JSON.stringify(results, null, 2));
}

// ─── Main ──────────────────────────────────────────────────────────

const rawArgs = process.argv.slice(2);
const options = parseArgs(rawArgs);

// Normalize root path
options.root = path.resolve(options.root);

if (!fs.existsSync(options.root)) {
  console.error(`Error: Directory "${options.root}" does not exist`);
  process.exit(1);
}

console.log(`🔍 Scanning ${options.root}...`);

const results: FileResult[] = [];
scanDirectory(options.root, results, options.minLength, options.root);

// Sort by length descending
results.sort((a, b) => b.length - a.length);

// Apply --top limit
const finalResults = options.top ? results.slice(0, options.top) : results;

// Output
if (options.json) {
  formatJSON(finalResults);
} else {
  formatTable(finalResults);
}
