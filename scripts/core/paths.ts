/**
 * Unified path resolution for scripts
 * Single source of truth for project paths
 */

import * as path from "node:path";
import { fileURLToPath } from "node:url";

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(path.dirname(__filename)); // scripts/core/paths.ts -> scripts
const projectRoot = path.dirname(scriptDir); // scripts -> project root

// Project paths
export const paths = {
  // Project root
  root: projectRoot,

  // Common directories
  scripts: scriptDir,
  docs: path.resolve(projectRoot, "docs"),
  src: path.resolve(projectRoot, "src"),
  dist: path.resolve(projectRoot, "dist"),

  // Generated files
  generated: path.resolve(projectRoot, "src", "generated"),
  generatedDocs: path.resolve(projectRoot, "src", "generated", "docs"),

  // Config files
  packageJson: path.resolve(projectRoot, "package.json"),
  biomeJson: path.resolve(projectRoot, "biome.json"),
  tsconfigJson: path.resolve(projectRoot, "tsconfig.json"),
} as const;

export function resolvePath(...segments: string[]): string {
  return path.resolve(paths.root, ...segments);
}

export function ensureDir(dir: string): void {
  const fs = require("node:fs");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
