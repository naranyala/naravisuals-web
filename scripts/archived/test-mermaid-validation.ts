/**
 * Quick test script for Mermaid validation
 * Run with: bun run scripts/test-mermaid-validation.ts
 */

import { validateMermaidContent } from "./plugins/validators/mermaid-content.ts";

const testCases = [
  {
    name: "Empty diagram",
    content: "",
    shouldFail: true,
  },
  {
    name: "HTML entity pattern",
    content: "graph TD;\nA-->B;\nB-->C&#x26;D;",
    shouldFail: true,
  },
  {
    name: "Double-encoded ampersand",
    content: "graph TD;\nA&amp;&amp;B-->C;",
    shouldFail: true,
  },
  {
    name: "Hex escape sequence",
    content: "graph TD;\nA-->B\\x26C;",
    shouldFail: true,
  },
  {
    name: "Empty quotes",
    content: 'graph TD;\nA[""]-->B;',
    shouldFail: true,
  },
  {
    name: "Quotes with special chars only",
    content: 'graph TD;\nA["&&*^%"]-->B;',
    shouldFail: true,
  },
  {
    name: "Unbalanced brackets",
    content: "graph TD;\nA[Node-->B;",
    shouldFail: true,
  },
  {
    name: "Missing diagram type",
    content: "A-->B;\nB-->C;",
    shouldFail: true,
  },
  {
    name: "Invalid diagram type",
    content: "invalidType TD;\nA-->B;",
    shouldFail: true,
  },
  {
    name: "Valid flowchart",
    content: `graph TD;
  A[Start]-->B{Decision};
  B-->|Yes|C[Action];
  B-->|No|D[End];`,
    shouldFail: false,
  },
  {
    name: "Valid with HTML entities in quotes (allowed)",
    content: 'graph TD;\nA["Use &amp; carefully"]-->B;',
    shouldFail: false,
  },
  {
    name: "Valid sequence diagram",
    content: `sequenceDiagram
  Alice->>John: Hello John, how are you?
  John-->>Alice: Great!`,
    shouldFail: false,
  },
  {
    name: "Valid class diagram",
    content: `classDiagram
  class Animal {
    +String name
    +eat()
  }`,
    shouldFail: false,
  },
  {
    name: "Valid quoted text with unicode",
    content: 'graph TD;\nA["中文标签"]-->B["日本語"];',
    shouldFail: false,
  },
];

console.log("Testing Mermaid validation...\n");

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  const errors = validateMermaidContent(testCase.content);
  const didFail = errors.length > 0;
  const success = didFail === testCase.shouldFail;

  if (success) {
    console.log(`✓ ${testCase.name}`);
    passed++;
  } else {
    console.log(`✗ ${testCase.name}`);
    console.log(`  Expected: ${testCase.shouldFail ? "FAIL" : "PASS"}`);
    console.log(`  Got: ${didFail ? "FAIL" : "PASS"}`);
    if (errors.length > 0) {
      console.log(`  Errors:`, errors);
    }
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
