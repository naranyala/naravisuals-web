/**
 * Generated Output Tests
 *
 * Verifies that the build output (src/generated/) has correct structure,
 * valid exports, and consistent cross-references.
 */

import { describe, expect, test } from "bun:test";
import { allDocs, sidebarData } from "../src/generated";

describe("generated sidebarData", () => {
  test("is a non-empty array", () => {
    expect(Array.isArray(sidebarData)).toBe(true);
    expect(sidebarData.length).toBeGreaterThan(0);
  });

  test("items have required fields", () => {
    for (const item of sidebarData) {
      expect(item).toHaveProperty("type");
      expect(item).toHaveProperty("label");
      if (item.type === "doc") {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("slug");
      }
      if (item.type === "category") {
        expect(item).toHaveProperty("items");
        expect(Array.isArray(item.items)).toBe(true);
      }
    }
  });

  test("category items contain doc entries", () => {
    const categories = sidebarData.filter((i) => i.type === "category");
    expect(categories.length).toBeGreaterThan(0);
    for (const cat of categories) {
      for (const doc of cat.items) {
        expect(doc).toHaveProperty("type", "doc");
        expect(doc).toHaveProperty("id");
        expect(doc).toHaveProperty("slug");
      }
    }
  });

  test("uncategorized doc entries have correct structure", () => {
    const docs = sidebarData.filter((i) => i.type === "doc");
    for (const doc of docs) {
      expect(doc).toHaveProperty("id");
      expect(doc).toHaveProperty("slug");
      expect(doc).toHaveProperty("label");
    }
  });
});

describe("generated allDocs", () => {
  test("is a non-empty array", () => {
    expect(Array.isArray(allDocs)).toBe(true);
    expect(allDocs.length).toBeGreaterThan(0);
  });

  test("each doc has all required fields", () => {
    for (const doc of allDocs) {
      expect(doc).toHaveProperty("id");
      expect(doc).toHaveProperty("slug");
      expect(doc).toHaveProperty("title");
      expect(doc).toHaveProperty("sidebar_label");
      expect(doc).toHaveProperty("sidebar_position");
      expect(doc).toHaveProperty("category");
      expect(doc).toHaveProperty("description");
      expect(doc).toHaveProperty("content");
      expect(doc).toHaveProperty("toc");
      expect(doc).toHaveProperty("section");
      expect(doc).toHaveProperty("metadata");
      expect(typeof doc.metadata).toBe("object");
    }
  });

  test("doc content is HTML", () => {
    for (const doc of allDocs) {
      if (doc.content.length > 0) {
        expect(doc.content).toMatch(/<[a-z]/i);
      }
    }
  });

  test("TOC entries are valid", () => {
    for (const doc of allDocs) {
      if (doc.toc.length > 0) {
        for (const item of doc.toc) {
          expect(item).toHaveProperty("value");
          expect(item).toHaveProperty("id");
          expect(item).toHaveProperty("level");
          expect([2, 3]).toContain(item.level);
        }
      }
    }
  });

  test("section is docs", () => {
    for (const doc of allDocs) {
      expect(doc.section).toBe("docs");
    }
  });

  test("no duplicate slugs", () => {
    const slugs = allDocs.map((d) => d.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  test("slug matches id", () => {
    for (const doc of allDocs) {
      expect(doc.slug).toBe(doc.id);
    }
  });
});

describe("sidebar-data and allDocs consistency", () => {
  test("every sidebar doc ID exists in allDocs", () => {
    const docIds = new Set(allDocs.map((d) => d.id));

    function checkItem(item: (typeof sidebarData)[0]) {
      if (item.type === "doc") {
        expect(docIds.has(item.id)).toBe(true);
      }
      if (item.type === "category") {
        for (const child of item.items) {
          expect(docIds.has(child.id)).toBe(true);
        }
      }
    }

    for (const item of sidebarData) {
      checkItem(item);
    }
  });

  test("every allDocs entry is referenced in sidebar", () => {
    const sidebarIds = new Set<string>();

    function collectIds(item: (typeof sidebarData)[0]) {
      if (item.type === "doc") {
        sidebarIds.add(item.id);
      }
      if (item.type === "category") {
        for (const child of item.items) {
          sidebarIds.add(child.id);
        }
      }
    }

    for (const item of sidebarData) {
      collectIds(item);
    }

    for (const doc of allDocs) {
      expect(sidebarIds.has(doc.id)).toBe(true);
    }
  });
});

describe("DocEntry type integrity", () => {
  test("first doc is a valid DocEntry", () => {
    const doc = allDocs[0];
    if (!doc) throw new Error("No docs found");
    expect(typeof doc.id).toBe("string");
    expect(typeof doc.slug).toBe("string");
    expect(typeof doc.title).toBe("string");
    expect(typeof doc.sidebar_label).toBe("string");
    expect(typeof doc.sidebar_position).toBe("number");
    expect(typeof doc.category).toBe("string");
    expect(typeof doc.description).toBe("string");
    expect(typeof doc.content).toBe("string");
    expect(Array.isArray(doc.toc)).toBe(true);
    expect(typeof doc.section).toBe("string");
  });

  test("heading IDs in content are valid", () => {
    for (const doc of allDocs) {
      const headingMatches = doc.content.match(/<h[23] id="[^"]*"/g) || [];
      for (const match of headingMatches) {
        expect(match).toMatch(/id="[a-z0-9-]+"/);
      }
    }
  });
});
