/**
 * TOC extraction and deduplication.
 */

import type { Token } from "marked";
import type { DocEntry } from "./types.ts";
import { slugifyHeading } from "./utils.ts";

export function extractTOC(tokens: Token[]) {
  const toc: DocEntry["toc"] = [];
  const seenIds = new Set<string>();

  for (const token of tokens) {
    if (token.type === "heading" && (token.depth === 2 || token.depth === 3)) {
      const text = (token as any).text;
      let id = slugifyHeading(text);

      // Handle duplicate IDs in same file
      let suffix = 1;
      const originalId = id;
      while (seenIds.has(id)) {
        id = `${originalId}-${suffix++}`;
      }
      seenIds.add(id);

      toc.push({ value: text, id, level: token.depth });
    }
  }
  return toc;
}
