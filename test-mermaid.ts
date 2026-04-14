import * as fs from "node:fs";

const md = fs.readFileSync("docs/guides/build-system.md", "utf-8");
console.log("=== First 200 chars of mermaid block ===");
const mermaidMatch = md.match(/```mermaid\n([\s\S]*?)```/);
if (mermaidMatch) {
  console.log(mermaidMatch[0].slice(0, 200));
}
