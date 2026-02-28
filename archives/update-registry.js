#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const libDir = './src/lib';

// Scan for component folders
const folders = readdirSync(libDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

console.log('Found folders:', folders);

// Generate imports and component registry
let imports = '';
let registry = '';

folders.sort().forEach((folder) => {
  const folderPath = join(libDir, folder);
  const files = readdirSync(folderPath)
    .filter((file) => file.endsWith('.vue'))
    .sort();

  files.forEach((file) => {
    const componentName = file.replace('.vue', '');
    const importName = componentName.replace(/[^a-zA-Z0-9]/g, '');

    // Add import
    imports += `import ${importName} from './${folder}/${file}';\n`;

    // Add to registry
    registry += `  '${folder}/${file}': ${importName},\n`;
  });
});

const template = `// Auto-generated component registry - Run: node update-registry.js
${imports.trim()}

const componentModules = {
${registry.trim()}
};

export default componentModules;
`;

// Update ComponentRegistry.vue
const currentFile = readFileSync(join(libDir, 'ComponentRegistry.vue'), 'utf8');

// Extract the imports section and replace
const startMarker =
  '// Auto-scan components from folders - eager imports to avoid warnings';
const endMarker = 'const componentModules = {';

const startIdx = currentFile.indexOf(startMarker);
const endIdx = currentFile.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const before = currentFile.substring(0, startIdx);
  const after = currentFile.substring(endIdx);

  const newImports = `// Auto-scan components from folders - eager imports to avoid warnings
${imports.trim()}

`;

  const newFile = before + newImports + after;
  writeFileSync(join(libDir, 'ComponentRegistry.vue'), newFile);

  console.log('✅ ComponentRegistry.vue updated successfully!');
  console.log(
    `📁 Found ${folders.length} folders with component imports updated.`,
  );
} else {
  console.error('❌ Could not find markers in ComponentRegistry.vue');
}
