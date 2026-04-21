/**
 * Frontmatter parsing utilities.
 */

export function parseFrontmatter(md: string) {
  // Handle both \n and \r\n line endings, and empty frontmatter blocks
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n?---\r?\n?([\s\S]*)$/);
  const fm: Record<string, any> = {};
  let content = md;

  if (m && m[1] !== undefined && m[2] !== undefined) {
    content = m[2];
    const fmLines = m[1].split("\n");
    let currentKey: string | null = null;
    let currentList: string[] | null = null;

    for (let i = 0; i < fmLines.length; i++) {
      const line = fmLines[i];
      if (line === undefined) continue;

      const listMatch = line.match(/^\s+-\s+(.+)$/);
      if (listMatch && listMatch[1] !== undefined && currentKey && currentList !== null) {
        currentList.push(listMatch[1].trim().replace(/^["']|["']$/g, ""));
        continue;
      }

      if (currentKey && currentList !== null) {
        fm[currentKey] = currentList;
        currentKey = null;
        currentList = null;
      }

      const ci = line.indexOf(":");
      if (ci > 0) {
        const key = line.slice(0, ci).trim();
        const rawVal = line
          .slice(ci + 1)
          .trim()
          .replace(/^["']|["']$/g, "");

        if (rawVal === "") {
          currentKey = key;
          currentList = [];
        } else if (rawVal.startsWith("[")) {
          try {
            fm[key] = JSON.parse(rawVal);
          } catch {
            fm[key] = rawVal.split(",").map((t) => t.trim().replace(/["']/g, ""));
          }
        } else {
          fm[key] = rawVal;
        }
      }
    }

    if (currentKey && currentList !== null) {
      fm[currentKey] = currentList;
    }
  }
  return { fm, content };
}
