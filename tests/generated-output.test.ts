/**
 * Generated Output Tests
 *
 * Verifies that the build output (src/generated/) has correct structure,
 * valid exports, and consistent cross-references.
 * Uses shared TypeBox schemas for runtime validation.
 */

import { describe, expect, test } from "bun:test";
import { Value } from "@sinclair/typebox/value";
import { allDocs, sidebarData } from "../src/generated";
import { DocEntrySchema, SidebarItemSchema } from "../src/shared/schemas.ts";

describe("generated sidebarData", () => {
  test("is a non-empty array", () => {
    expect(Array.isArray(sidebarData)).toBe(true);
    expect(sidebarData.length).toBeGreaterThan(0);
  });

  test("items conform to SidebarItemSchema", () => {
    for (const item of sidebarData) {
      expect(
        Value.Check(SidebarItemSchema, item),
        `Item failed validation: ${JSON.stringify(item)}`
      ).toBe(true);
    }
  });

  test("category items contain valid sidebar items", () => {
    const categories = sidebarData.filter((i) => i.type === "category");
    expect(categories.length).toBeGreaterThan(0);
    function validateRecursive(items: (typeof sidebarData)[0][]) {
      for (const item of items) {
        expect(
          Value.Check(SidebarItemSchema, item),
          `Item failed validation: ${JSON.stringify(item)}`
        ).toBe(true);
        if (item.type === "category") {
          validateRecursive(item.items);
        }
      }
    }
    for (const cat of categories) {
      validateRecursive(cat.items);
    }
  });

  test("uncategorized doc entries are valid", () => {
    const docs = sidebarData.filter((i) => i.type === "doc");
    for (const doc of docs) {
      expect(
        Value.Check(SidebarItemSchema, doc),
        `Doc entry failed validation: ${JSON.stringify(doc)}`
      ).toBe(true);
    }
  });
});

describe("generated allDocs", () => {
  test("is a non-empty array", () => {
    expect(Array.isArray(allDocs)).toBe(true);
    expect(allDocs.length).toBeGreaterThan(0);
  });

  test("each doc conforms to DocEntrySchema", () => {
    for (const doc of allDocs) {
      expect(Value.Check(DocEntrySchema, doc), `Doc failed validation: ${doc.id}`).toBe(true);
    }
  });

  test("doc content is HTML", () => {
    for (const doc of allDocs) {
      if (doc.content.length > 0) {
        expect(doc.content).toMatch(/<[a-z]/i);
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
});

describe("sidebar-data and allDocs consistency", () => {
  test("every sidebar doc ID exists in allDocs", () => {
    const docIds = new Set(allDocs.map((d) => d.id));

    function checkItem(item: (typeof sidebarData)[0]) {
      if (item.type === "doc") {
        expect(docIds.has(item.id), `Doc ID ${item.id} not found in allDocs`).toBe(true);
      }
      if (item.type === "category") {
        for (const child of item.items) {
          checkItem(child);
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
          collectIds(child);
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

describe("Content Integrity", () => {
  test("heading IDs in content are valid", () => {
    for (const doc of allDocs) {
      const headingMatches = doc.content.match(/<h[23] id="[^"]*"/g) || [];
      for (const match of headingMatches) {
        expect(match).toMatch(/id="[a-z0-9-]+"/);
      }
    }
  });

  test("TOC IDs match content IDs", () => {
    for (const doc of allDocs) {
      if (!doc.toc) continue;
      for (const item of doc.toc) {
        const idPattern = new RegExp(`id="${item.id}"`);
        expect(
          idPattern.test(doc.content),
          `TOC ID ${item.id} not found in content of ${doc.id}`
        ).toBe(true);
      }
    }
  });

  test("slugs are URL-safe", () => {
    for (const doc of allDocs) {
      expect(doc.slug).toMatch(/^[a-z0-9/-]+$/);
    }
  });
});

describe("Sidebar Structural Integrity", () => {
  test("categories are not empty", () => {
    const categories = sidebarData.filter((i) => i.type === "category");
    for (const cat of categories) {
      expect(cat.items.length, `Category ${cat.label} is empty`).toBeGreaterThan(0);
    }
  });

  test("no duplicate labels at same level", () => {
    function checkDuplicates(items: (typeof sidebarData)[0][]) {
      const labels = new Set();
      for (const item of items) {
        expect(labels.has(item.label), `Duplicate label ${item.label} found`).toBe(false);
        labels.add(item.label);
        if (item.type === "category") {
          checkDuplicates(item.items);
        }
      }
    }
    checkDuplicates(sidebarData);
  });
});
