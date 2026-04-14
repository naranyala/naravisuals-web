#!/usr/bin/env node
/**
 * Production server for the built dist/ folder.
 * Uses `serve` to serve static files with SPA fallback.
 *
 * Usage: node server/prod-server.mjs
 * Or:    bun run start
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "..", "dist");

const port = process.env.PORT || 3000;

console.log(`🚀 Serving production build from ${distPath}`);

const serve = spawn("npx", ["serve", distPath, "-p", String(port), "-s"], {
  stdio: "inherit",
  env: process.env,
});

serve.on("close", (code) => {
  console.log(`Serve process exited with code ${code}`);
  process.exit(code ?? 0);
});

serve.on("error", (err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down...");
  serve.kill("SIGTERM");
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down...");
  serve.kill("SIGTERM");
});
