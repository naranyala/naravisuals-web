/**
 * Sidebar tree generation.
 */

import type { DocEntry, SidebarCategoryItem, SidebarItem } from "./types.ts";

export function buildSidebar(docs: DocEntry[]): SidebarItem[] {
  const root: SidebarItem[] = [];

  // Helper to find or create a category in the tree
  function getOrCreateCategory(
    path: string[],
    currentLevel: SidebarItem[],
    doc: DocEntry
  ): SidebarCategoryItem {
    const segment = path[0];
    if (!segment) return { type: "category", label: "Unknown", items: [] } as SidebarCategoryItem;
    const label = segment
      .replace(/^\d{2}-/, "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    let category = currentLevel.find(
      (item) => item.type === "category" && item.label === label
    ) as SidebarCategoryItem;

    if (!category) {
      category = {
        type: "category",
        label,
        items: [],
        link: undefined,
        count: 0,
      } as SidebarCategoryItem;
      currentLevel.push(category);
      // Sort categories by numeric prefix if possible, otherwise by label
      currentLevel.sort((a, b) => {
        if (a.type === "category" && b.type === "category") {
          return a.label.localeCompare(b.label);
        }
        return 0;
      });
    }

    if (path.length === 1) {
      return category;
    }

    return getOrCreateCategory(path.slice(1), category.items, doc);
  }

  // Helper to recursively count documents in a category
  function countDocs(item: SidebarItem): number {
    if (item.type === "doc") return 1;
    if (item.type === "category") {
      return (item as any).items.reduce(
        (acc: number, child: SidebarItem) => acc + countDocs(child),
        0
      );
    }
    return 0;
  }

  function applyCounts(items: SidebarItem[]) {
    for (const item of items) {
      if (item.type === "category") {
        item.count = countDocs(item);
        applyCounts(item.items);
      }
    }
  }

  // Process all docs
  for (const d of docs) {
    if (d.slug === "abstract" || d.slug === "references") continue;

    const slugParts = d.slug.split("/");
    if (slugParts.length === 1) {
      // Root level doc
      root.push({
        type: "doc",
        id: d.id,
        label: d.sidebar_label,
        slug: d.slug,
        date: d.date || null,
      });
    } else {
      // Nested doc
      const categoryPath = slugParts.slice(0, -1);
      const category = getOrCreateCategory(categoryPath, root, d);
      category.items.push({
        type: "doc",
        id: d.id,
        label: d.sidebar_label,
        slug: d.slug,
        category: d.category,
        date: d.date || null,
      });
      category.items.sort((a, b) => (a as any).sidebar_position - (b as any).sidebar_position);
    }
  }

  // Add abstract page as first item
  const abstractDoc = docs.find((d) => d.slug === "abstract");
  if (abstractDoc) {
    root.unshift({
      type: "doc",
      id: abstractDoc.id,
      label: abstractDoc.sidebar_label || "Abstract",
      slug: abstractDoc.slug,
      date: abstractDoc.date || null,
    });
  }

  // Add references page as last item
  const referencesDoc = docs.find((d) => d.slug === "references");
  if (referencesDoc) {
    root.push({
      type: "doc",
      id: referencesDoc.id,
      label: referencesDoc.sidebar_label || "References",
      slug: referencesDoc.slug,
      date: referencesDoc.date || null,
    });
  }

  // Final sort of root items
  root.sort((a, b) => {
    if (a.type === "doc" && a.slug === "abstract") return -1;
    if (b.type === "doc" && b.slug === "abstract") return 1;
    if (a.type === "doc" && a.slug === "references") return 1;
    if (b.type === "doc" && b.slug === "references") return -1;

    return 0;
  });

  applyCounts(root);

  return root;
}
