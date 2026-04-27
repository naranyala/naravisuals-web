import { describe, expect, test } from "bun:test";
import {
  FuseSearchEngine,
  M31FuzzySearchEngine,
  UFuzzySearchEngine,
} from "../src/features/search/search-engines-impl";
import { allDocs } from "../src/generated";

describe("Local Search Engine Implementations", () => {
  // Mock some docs for consistent testing
  const mockDocs = [
    {
      id: "doc1",
      title: "Introduction to React",
      description: "Learn the basics of React",
      content: "React is a library for building user interfaces.",
      slug: "intro-react",
      toc: [{ value: "Getting Started", id: "start" }],
      tags: ["react", "frontend"],
      section: "docs",
    },
    {
      id: "doc2",
      title: "Advanced TypeScript",
      description: "Mastering TS types",
      content: "TypeScript adds static typing to JavaScript.",
      slug: "advanced-ts",
      toc: [{ value: "Generics", id: "generics" }],
      tags: ["typescript", "programming"],
      section: "docs",
    },
  ];

  // Override allDocs for these tests (hacky but works for unit tests if we can't inject)
  // In a real scenario, we'd pass docs to the constructor
  (allDocs as any).splice(0, allDocs.length, ...mockDocs);

  const engines = [new FuseSearchEngine(), new UFuzzySearchEngine(), new M31FuzzySearchEngine()];

  engines.forEach((engine) => {
    describe(`${engine.name} Search`, () => {
      test("finds document by title", () => {
        const results = engine.search("React");
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].item.id).toBe("doc1");
      });

      test("finds document by description", () => {
        const results = engine.search("Mastering");
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].item.id).toBe("doc2");
      });

      test("finds document by content", () => {
        const results = engine.search("static typing");
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].item.id).toBe("doc2");
      });

      test("finds document by tag", () => {
        const results = engine.search("frontend");
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].item.id).toBe("doc1");
      });

      test("finds document by TOC entry", () => {
        const results = engine.search("Generics");
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].item.id).toBe("doc2");
      });

      test("returns empty array for no matches", () => {
        const results = engine.search("NonExistentWordXYZ");
        expect(results.length).toBe(0);
      });

      test("handles empty query", () => {
        const results = engine.search("");
        // Behavior varies by engine, but it shouldn't crash
        expect(Array.isArray(results)).toBe(true);
      });
    });
  });
});
