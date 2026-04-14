#!/bin/bash

# Mermaid Validation Demo
# Shows how the validation catches real issues

echo "=================================="
echo "Mermaid Validation Demo"
echo "=================================="
echo ""

# Create a test file with valid and invalid diagrams
cat > /tmp/test-mermaid.md << 'EOF'
# Test Mermaid Validation

## Valid Diagram ✅

```mermaid:desc=A valid flowchart with proper syntax.
graph TD
  A[Start]-->B{Decision}
  B-->|Yes|C[Action]
  B-->|No|D[End]
```

## Invalid: Empty Quotes ❌

```mermaid:desc=Diagram with empty quotes that will fail validation.
graph TD
  A[""]-->B[""]
```

## Invalid: HTML Entity ❌

```mermaid:desc=Diagram with HTML entity that will fail validation.
graph TD
  A-->B&#x26;C
```

## Invalid: Wrong Type ❌

```mermaid:desc=Diagram with invalid type that will fail validation.
package
  A --> B
```

## Valid: Unicode Labels ✅

```mermaid:desc=Valid diagram with unicode labels.
graph TD
  A["开始"]-->B["结束"]
```
EOF

echo "Test file created: /tmp/test-mermaid.md"
echo ""
echo "Running validation..."
echo ""

# Run the validator on the test file
bun run -e "
import { validateMermaidContent } from './scripts/plugins/validators/mermaid-content.ts';
import * as fs from 'fs';

const content = fs.readFileSync('/tmp/test-mermaid.md', 'utf-8');
const lines = content.split('\n');
let inMermaidBlock = false;
let diagramLines = [];
let blockNum = 0;
let desc = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const fenceMatch = line.match(/^\`\`\`(\w+)?(.*)$/);
  
  if (fenceMatch && !inMermaidBlock && fenceMatch[1]?.toLowerCase() === 'mermaid') {
    inMermaidBlock = true;
    diagramLines = [];
    blockNum++;
    desc = fenceMatch[2] || '';
  } else if (inMermaidBlock && line.match(/^\`\`\`\s*$/)) {
    const diagram = diagramLines.join('\n').trim();
    const errors = validateMermaidContent(diagram);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Block #' + blockNum + ': ' + (desc.substring(0, 50) || 'No description'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (errors.length === 0) {
      console.log('✅ VALID\n');
    } else {
      console.log('❌ INVALID - ' + errors.length + ' error(s):\n');
      for (const err of errors) {
        console.log('  • ' + err.message);
        console.log('    → ' + err.detail + '\n');
      }
    }
    
    inMermaidBlock = false;
  } else if (inMermaidBlock) {
    diagramLines.push(line);
  }
}
"

echo ""
echo "=================================="
echo "Demo Complete"
echo "=================================="

# Cleanup
rm -f /tmp/test-mermaid.md
