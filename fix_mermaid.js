const fs = require("node:fs");
const path = require("node:path");

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat?.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (filePath.endsWith(".md")) {
      results.push(filePath);
    }
  });
  return results;
}

const files = getFiles("docs");
let modifiedFiles = 0;
let fixes = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;

  const mermaidBlockRegex = /```mermaid[\s\S]*?```/g;
  content = content.replace(mermaidBlockRegex, (match) => {
    let blockContent = match;

    if (blockContent.includes("<br/>")) {
      blockContent = blockContent.replace(/<br\/>/g, "\\n");
      modified = true;
      fixes++;
    }

    // Using a simpler regex for arrow fix: find ' -> ' and replace with ' --> '
    // Or find '->' and ensure it's not '-->'
    if (blockContent.includes("->")) {
      const newBlockContent = blockContent.replace(/([^-])->([^-])/g, "$1-->$2");
      if (newBlockContent !== blockContent) {
        blockContent = newBlockContent;
        modified = true;
        fixes++;
      }
    }

    return blockContent;
  });

  if (modified) {
    fs.writeFileSync(file, content);
    modifiedFiles++;
  }
});

console.log(`Modified ${modifiedFiles} files with ${fixes} fixes.`);
