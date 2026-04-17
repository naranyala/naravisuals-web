import fs from "node:fs";
import { validateCodeBlockDescriptions } from "./scripts/diagnostics.ts";

const content = fs.readFileSync("docs/00-welcome.md", "utf8");
const _lines = content.split("\n");
const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
const mainContent = fmMatch ? fmMatch[2] : content;

console.log("Testing 00-welcome.md");
console.log("Main content length:", mainContent.split("\n").length);

const diags = {
  warn: (source, file, msg, detail) => {
    console.log(`WARNING: ${source}, ${file}, ${msg}, ${detail}`);
  },
};

validateCodeBlockDescriptions(mainContent, "00-welcome", diags);
