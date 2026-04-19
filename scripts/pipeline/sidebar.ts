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
          catPrefixes[d.category] = prefixMatch ? parseInt(prefixMatch[1], 10) : 999;
        } else {
          catPrefixes[d.category] = 999;
        }
      }
      grouped[d.category].push(d);
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
      date: welcomeDoc.date,
    });
  }

  for (const d of uncategorized.sort((a, b) => a.sidebar_position - b.sidebar_position)) {
    if (d.slug === "welcome") continue;
    sidebar.push({
      type: "doc",
      id: d.id,
      label: d.sidebar_label,
      slug: d.slug,
      date: d.date,
    });
  }

  // Sort categories by their folder numeric prefix
  const sortedCats = catOrder
    .filter((c) => c !== "blog")
    .sort((a, b) => (catPrefixes[a] || 999) - (catPrefixes[b] || 999));

  for (const cat of sortedCats) {
    const items = (grouped[cat] || []).sort((a, b) => a.sidebar_position - b.sidebar_position);
    const label = cat
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    sidebar.push({
      type: "category",
      label,
      link: items[0] ? { type: "doc", id: items[0].id } : undefined,
      items: items.map((d) => ({
        type: "doc" as const,
        id: d.id,
        label: d.sidebar_label,
        slug: d.slug,
        category: d.category,
        date: d.date,
      })),
    });
  }

  if (catOrder.includes("blog")) {
    const items = (grouped.blog || []).sort((a, b) => a.sidebar_position - b.sidebar_position);
    sidebar.push({
      type: "category",
      label: "📝 Blog",
      link: items[0] ? { type: "doc", id: items[0].id } : undefined,
      items: items.map((d) => ({
        type: "doc" as const,
        id: d.id,
        label: d.sidebar_label,
        slug: d.slug,
        category: "blog",
        date: d.date,
      })),
    });
  }

  return sidebar;
}
