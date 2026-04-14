/**
 * Copy third-party libraries from node_modules to dist/
 * Run this after the rspack build completes.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DIST = path.resolve(ROOT, "dist");

const filesToCopy = [
  // MathJax
  {
    from: "node_modules/mathjax-full/es5/tex-svg.js",
    to: "mathjax/tex-svg.js",
  },
  {
    from: "node_modules/mathjax-full/es5/startup.js",
    to: "mathjax/startup.js",
    optional: true,
  },
  {
    from: "node_modules/mathjax-full/es5/core.js",
    to: "mathjax/core.js",
    optional: true,
  },

  // Mermaid
  {
    from: "node_modules/mermaid/dist/mermaid.min.js",
    to: "mermaid/mermaid.min.js",
  },
  {
    from: "node_modules/mermaid/dist/mermaid.min.js.map",
    to: "mermaid/mermaid.min.js.map",
    optional: true,
  },
];

function copyFile(relativeFrom: string, relativeTo: string, optional = false) {
  const fromPath = path.resolve(ROOT, relativeFrom);
  const toPath = path.resolve(DIST, relativeTo);

  if (!fs.existsSync(fromPath)) {
    if (optional) {
      console.log(`⏭️  Skipping (not found): ${relativeFrom}`);
      return;
    }
    throw new Error(`Source file not found: ${fromPath}`);
  }

  // Ensure destination directory exists
  fs.mkdirSync(path.dirname(toPath), { recursive: true });

  fs.copyFileSync(fromPath, toPath);
  console.log(`✓ Copied: ${relativeFrom} → dist/${relativeTo}`);
}

console.log("📦 Copying third-party libraries to dist/...\n");

for (const { from, to, optional } of filesToCopy) {
  copyFile(from, to, optional);
}

console.log("\n✨ Done!");
