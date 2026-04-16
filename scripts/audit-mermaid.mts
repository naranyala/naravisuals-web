import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { validateMermaidContent } from "./plugins/validators/mermaid-content";

function getFiles(dir: string): string[] {
  let results: string[] = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (file.endsWith(".md")) {
      results.push(filePath);
    }
  }
  return results;
}

const docsDir = join(process.cwd(), "docs");
const files = getFiles(docsDir);

console.log(`Scanning ${files.length} markdown files...`);

let totalDiagrams = 0;
let failedDiagrams = 0;

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const mermaidBlocks = content.match(/```mermaid\s*([\s\S]*?)\s*```/g);

  if (!mermaidBlocks) continue;

  mermaidBlocks.forEach((block, index) => {
    totalDiagrams++;
    const source = block.replace(/```mermaid\s*([\s\S]*?)\s*```/, "$1").trim();
    const result = validateMermaidContent(source);

    if (result.length > 0) {
      failedDiagrams++;
      console.log(`\n❌ File: ${file} (Block ${index + 1})`);
      console.log(`Source:\n${source}`);
      console.log(`Errors:`);
      result.forEach((err) => console.log(` - ${err.message}: ${err.detail}`));
    }
  });
}

console.log(`\n--- Audit Complete ---`);
console.log(`Total Diagrams: ${totalDiagrams}`);
console.log(`Failed: ${failedDiagrams}`);
console.log(
  `Success Rate: ${(((totalDiagrams - failedDiagrams) / totalDiagrams) * 100).toFixed(2)}%`
);
