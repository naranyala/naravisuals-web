import fs from "node:fs";
import { validateCodeBlockDescriptions } from "./scripts/diagnostics.ts";

const content = fs.readFileSync("docs/01-getting-started/02-installation.md", "utf8");
const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
const mainContent = fmMatch ? fmMatch[2] : content;

const diags = {
  warn: (source, file, msg, detail) => {
    console.log(`WARNING: ${source}, ${file}, ${msg}, ${detail}`);
  },
};

validateCodeBlockDescriptions(mainContent, "02-installation", diags);
