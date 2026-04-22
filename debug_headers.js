
const fs = require('fs');
const content = fs.readFileSync('docs/04-reference/04-migrating-from-docusaurus.md', 'utf8');
const contentWithoutCodeBlocks = content.replace(/`{3,}[\s\S]*?`{3,}/g, '');
const headerRegex = /^(#{1,6})\s+/gm;
let lastLevel = 0;
let match;
while ((match = headerRegex.exec(contentWithoutCodeBlocks)) !== null) {
  const level = match[1].length;
  console.log(`Level ${level}: ${match[0].trim()}`);
  if (level > lastLevel + 1 && lastLevel > 0) {
    console.log(`!!! SKIP DETECTED: h${lastLevel} to h${level}`);
  }
  lastLevel = level;
}
