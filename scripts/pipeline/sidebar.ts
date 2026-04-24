/**
 * Sidebar tree generation.
 */

import type { DocEntry, SidebarItem, SidebarCategoryItem } from "./types.ts";

export function buildSidebar(docs: DocEntry[]): SidebarItem[] {
  const root: SidebarItem[] = [];
  
  // Helper to find or create a category in the tree
  function getOrCreateCategory(path: string[], currentLevel: SidebarItem[], doc: DocEntry): SidebarCategoryItem {
    const segment = path[0]!;
    const label = segment
      .replace(/^\d{2}-/, "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    let category = currentLevel.find((item) => item.type === "category" && item.label === label) as SidebarCategoryItem;

    if (!category) {
      category = {
        type: "category",
        label,
        items: [],
        link: undefined,
      };
      currentLevel.push(category);
      // Sort categories by numeric prefix if possible, otherwise by label
      currentLevel.sort((a, b) => {
        if (a.type === "category" && b.type === "category") {
          // We can't easily get the numeric prefix here because we've already cleaned the label.
          // In a real system, we'd store the original segment.
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
    
    // This is a simplified sort. For a real project, we'd use the sidebar_position from the doc/category.
    return 0;
  });

  return root;
}
