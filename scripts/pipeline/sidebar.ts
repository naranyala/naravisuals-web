/**
 * Sidebar tree generation.
 */

import type { DocEntry, SidebarItem } from "./types.ts";

export function buildSidebar(docs: DocEntry[]): SidebarItem[] {
  const catOrder: string[] = [];
  const catPrefixes: Record<string, number> = {};
  const grouped: Record<string, DocEntry[]> = {};
  const uncategorized: DocEntry[] = [];

  for (const d of docs) {
    if (d.category) {
      if (!grouped[d.category]) {
        grouped[d.category] = [];
        catOrder.push(d.category);
        if (d.original_category) {
          const prefixMatch = d.original_category.match(/^(\d{2})/);
          catPrefixes[d.category] =
            prefixMatch && prefixMatch[1] !== undefined ? parseInt(prefixMatch[1], 10) : 999;
        } else {
          catPrefixes[d.category] = 999;
        }
      }
      grouped[d.category]!.push(d);
    } else {
      uncategorized.push(d);
    }
  }

  const sidebar: SidebarItem[] = [];

  // Add welcome page as first item (before categories)
  const welcomeDoc = docs.find((d) => d.slug === "welcome");
  if (welcomeDoc) {
    sidebar.push({
      type: "doc",
      id: welcomeDoc.id,
      label: welcomeDoc.sidebar_label || "Welcome",
      slug: welcomeDoc.slug,
      date: welcomeDoc.date || null,
    });
  }

  for (const d of uncategorized.sort((a, b) => a.sidebar_position - b.sidebar_position)) {
    if (d.slug === "welcome") continue;
    sidebar.push({
      type: "doc",
      id: d.id,
      label: d.sidebar_label,
      slug: d.slug,
      date: d.date || null,
    });
  }

  // Sort categories by their folder numeric prefix
  const sortedCats = catOrder.sort((a, b) => (catPrefixes[a] || 999) - (catPrefixes[b] || 999));

  for (const cat of sortedCats) {
    const items = grouped[cat] || [];
    if (items.length === 0) continue;

    const sortedItems = items.sort((a, b) => a.sidebar_position - b.sidebar_position);
    const label = cat
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const firstItem = sortedItems[0];

    sidebar.push({
      type: "category",
      label,
      link:
        firstItem && firstItem.id !== undefined
          ? { type: "doc", id: firstItem.id }
          : undefined,
      items: sortedItems.map((d) => ({
        type: "doc" as const,
        id: d.id,
        label: d.sidebar_label,
        slug: d.slug,
        category: d.category,
        date: d.date || null,
      })),
    });
  }

  return sidebar;
}
