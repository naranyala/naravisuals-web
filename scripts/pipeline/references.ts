/**
 * Reference Extraction Utility
 */

export interface FootnoteDefinition {
  identifier: string;
  text: string;
  sourceFile: string;
}

export function extractAllFootnotes(tokens: any[], sourceFile: string): FootnoteDefinition[] {
  const footnotes: FootnoteDefinition[] = [];
  const seenIds = new Set<string>();

  function walk(items: any[]) {
    for (const token of items) {
      if (!token || typeof token !== "object") continue;

      // 1. Look for definitions: [^id]: text
      if (token.type === "paragraph" || token.type === "text") {
        const text = token.text || "";
        const defMatch = text.match(/^\[\^([^\]]+)\]:\s*(.+)$/);
        if (defMatch?.[1] && defMatch[2]) {
          const identifier = defMatch[1];
          footnotes.push({
            identifier,
            text: defMatch[2].trim(),
            sourceFile,
          });
          seenIds.add(identifier);
        }
      }

      // 2. Look for inline references: [^id]
      if (token.text && typeof token.text === "string") {
        const refRegex = /\[\^([^\]]+)\](?!=:)/g;
        const matches = Array.from((token.text as string).matchAll(refRegex));
        for (const match of matches) {
          const identifier = match[1];
          if (identifier && !seenIds.has(identifier)) {
            // Found a reference without a definition in THIS block yet
            // We'll keep track of it to ensure it's listed even if definition is missing
            // But we don't want to duplicate if definition is found later in the same file
          }
        }
      }

      if (token.tokens) walk(token.tokens);
      if (token.items) walk(token.items);
    }
  }

  walk(tokens);
  return footnotes;
}

export function generateReferencesMarkdown(footnotes: FootnoteDefinition[]): string {
  if (footnotes.length === 0) {
    return `---
title: References
description: Collected references and citations across the documentation.
sidebar_label: References
sidebar_position: 9999
tags: ["internal", "references", "footnotes"]
---

# References

No references or footnotes found in the documentation.
`;
  }

  // Group by identifier to find shared references
  const byId = footnotes.reduce(
    (acc, fn) => {
      const list = acc[fn.identifier] || [];
      list.push(fn);
      acc[fn.identifier] = list;
      return acc;
    },
    {} as Record<string, FootnoteDefinition[]>
  );

  let md = `---
title: References
description: Collected references and citations across the documentation.
sidebar_label: References
sidebar_position: 9999
tags: ["internal", "references", "footnotes"]
---

# References

This section aggregates all citations and footnotes found throughout the documentation. It serves as a centralized bibliography for the project.

---

`;

  const sortedEntries = Object.entries(byId).sort((a, b) =>
    a[0].localeCompare(b[0], undefined, { numeric: true })
  );

  for (const [id, refs] of sortedEntries) {
    const first = refs[0];
    if (!first) continue;

    md += `### [^${id}]\n\n`;
    md += `> ${first.text}\n\n`;
    md += `**Appears in:**\n`;

    // Unique source files
    const sources = Array.from(new Set(refs.map((r) => r.sourceFile))).sort();
    for (const source of sources) {
      const displayPath = source.replace(/\d{2}-/g, "");
      md += `- [${displayPath}](/docs/${displayPath})\n`;
    }
    md += "\n---\n\n";
  }

  return md;
}
