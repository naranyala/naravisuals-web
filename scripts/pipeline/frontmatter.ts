/**
 * Frontmatter parsing logic.
 */

export function parseFrontmatter(md: string) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const fm: Record<string, unknown> = {};
  let content = md;

  if (m) {
    content = m[2];
    const fmLines = m[1].split("\n");
    let currentKey: string | null = null;
    let currentList: string[] | null = null;

    for (let i = 0; i < fmLines.length; i++) {
      const line = fmLines[i];

      // Check if this is a list item under the current key
      const listMatch = line.match(/^\s+-\s+(.+)$/);
      if (listMatch && currentKey && currentList !== null) {
        currentList.push(listMatch[1].trim().replace(/^["']|["']$/g, ""));
        continue;
      }

      // Flush previous list if any
      if (currentKey && currentList !== null) {
        fm[currentKey] = currentList;
        currentKey = null;
        currentList = null;
      }

      // Regular key: value line
      const ci = line.indexOf(":");
      if (ci > 0) {
        const key = line.slice(0, ci).trim();
        const rawVal = line.slice(ci + 1).trim().replace(/^["']|["']$/g, "");

        if (rawVal === "") {
          currentKey = key;
          currentList = [];
        } else if (rawVal.startsWith("[")) {
          try {
            const cleaned = rawVal.replace(/^\[|\]$/g, "");
            fm[key] = cleaned.split(",").map((t: string) => t.trim().replace(/^["']|["']$/g, ""));
          } catch {
            fm[key] = rawVal;
          }
        } else {
          fm[key] = rawVal;
        }
      }
    }

    // Flush final list if any
    if (currentKey && currentList !== null) {
      fm[currentKey] = currentList;
    }
  }

  return { fm, content };
}
