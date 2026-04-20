/**
 * Diagnostics Module Tests
 *
 * Tests the build-time diagnostics: error/warning collection,
 * frontmatter validation, slug uniqueness, and internal link checking.
 */

import { beforeEach, describe, expect, test } from "bun:test";
import {
  Diagnostics,
  validateFrontmatter,
  validateInternalLinks,
  validateUniqueSlugs,
} from "../scripts/diagnostics.ts";

// ─── Diagnostics Class ──────────────────────────────────────────────

describe("Diagnostics", () => {
  let diags: Diagnostics;
  beforeEach(() => {
    diags = new Diagnostics();
  });

  test("starts empty", () => {
    expect(diags.all()).toHaveLength(0);
    expect(diags.hasErrors()).toBe(false);
    expect(diags.summary()).toEqual({ errors: 0, warnings: 0, info: 0 });
  });

  test("records error", () => {
    diags.error("frontmatter", "test.md", "Missing title");
    expect(diags.all()).toHaveLength(1);
    expect(diags.hasErrors()).toBe(true);
    expect(diags.errors()).toHaveLength(1);
    const errors = diags.errors();
    expect(errors[0]?.severity).toBe("error");
  });

  test("records warning", () => {
    diags.warn("links", "test.md", "Broken link");
    expect(diags.warnings()).toHaveLength(1);
    expect(diags.hasErrors()).toBe(false);
  });

  test("records info", () => {
    diags.info("build", "test.md", "File processed");
    expect(diags.all()).toHaveLength(1);
    const all = diags.all();
    expect(all[0]?.severity).toBe("info");
  });

  test("stores detail", () => {
    diags.error("plugin", "test.md", "Plugin failed", "Syntax error");
    const errors = diags.errors();
    const d = errors[0];
    if (!d) throw new Error("No error found");
    expect(d.detail).toBe("Syntax error");
  });

  test("merge combines diagnostics", () => {
    const other = new Diagnostics();
    other.error("frontmatter", "a.md", "Missing title");
    other.warn("links", "b.md", "Broken link");
    diags.merge(other);
    expect(diags.all()).toHaveLength(2);
  });

  test("clear removes all", () => {
    diags.error("frontmatter", "test.md", "Missing title");
    diags.clear();
    expect(diags.all()).toHaveLength(0);
  });

  test("summary counts correctly", () => {
    diags.error("frontmatter", "a.md", "Error 1");
    diags.error("frontmatter", "b.md", "Error 2");
    diags.warn("links", "c.md", "Warning 1");
    diags.info("build", "d.md", "Info 1");
    expect(diags.summary()).toEqual({ errors: 2, warnings: 1, info: 1 });
  });

  test("format returns human-readable string", () => {
    diags.error("frontmatter", "test.md", "Missing title");
    const formatted = diags.format();
    expect(formatted).toContain("ERROR");
    expect(formatted).toContain("test.md");
    expect(formatted).toContain("Missing title");
    expect(formatted).toContain("Summary:");
  });

  test("toJSON returns array", () => {
    diags.error("frontmatter", "test.md", "Missing title");
    const json = diags.toJSON();
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(1);
    expect(json[0]?.message).toBe("Missing title");
  });
});

// ─── Frontmatter Validation ─────────────────────────────────────────

describe("validateFrontmatter", () => {
  test("no errors when title and description present", () => {
    const diags = new Diagnostics();
    validateFrontmatter({ title: "Hello", description: "World" }, "test.md", diags);
    expect(diags.errors()).toHaveLength(0);
    expect(diags.warnings()).toHaveLength(0);
  });

  test("error when title is missing", () => {
    const diags = new Diagnostics();
    validateFrontmatter({ description: "World" }, "test.md", diags);
    expect(diags.errors()).toHaveLength(1);
    const errors = diags.errors();
    expect(errors[0]?.message).toContain("title");
  });

  test("warning when description is missing", () => {
    const diags = new Diagnostics();
    validateFrontmatter({ title: "Hello" }, "test.md", diags);
    expect(diags.warnings()).toHaveLength(1);
    const warnings = diags.warnings();
    expect(warnings[0]?.message).toContain("description");
  });

  test("both errors and warnings when both missing", () => {
    const diags = new Diagnostics();
    validateFrontmatter({}, "test.md", diags);
    expect(diags.errors()).toHaveLength(1);
    expect(diags.warnings()).toHaveLength(1);
  });
});

// ─── Slug Uniqueness ────────────────────────────────────────────────

describe("validateUniqueSlugs", () => {
  test("no errors for unique slugs", () => {
    const diags = new Diagnostics();
    validateUniqueSlugs(
      [
        { id: "a", slug: "docs/a" },
        { id: "b", slug: "docs/b" },
      ],
      diags
    );
    expect(diags.hasErrors()).toBe(false);
  });

  test("error for duplicate slugs", () => {
    const diags = new Diagnostics();
    validateUniqueSlugs(
      [
        { id: "a", slug: "docs/a" },
        { id: "b", slug: "docs/a" },
      ],
      diags
    );
    expect(diags.errors()).toHaveLength(1);
    const errors = diags.errors();
    expect(errors[0]?.message).toContain("docs/a");
  });

  test("multiple duplicates reported", () => {
    const diags = new Diagnostics();
    validateUniqueSlugs(
      [
        { id: "a", slug: "docs/x" },
        { id: "b", slug: "docs/x" },
        { id: "c", slug: "docs/y" },
        { id: "d", slug: "docs/y" },
      ],
      diags
    );
    expect(diags.errors()).toHaveLength(2);
  });

  test("no slugs is fine", () => {
    const diags = new Diagnostics();
    validateUniqueSlugs([], diags);
    expect(diags.hasErrors()).toBe(false);
  });
});

// ─── Internal Link Validation ───────────────────────────────────────

describe("validateInternalLinks", () => {
  test("no warnings for valid links", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set(["a", "b"]);
    const content = "See [page A](/docs/a) and [page B](/docs/b#section)";
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    expect(diags.warnings()).toHaveLength(0);
  });

  test("warning for broken link", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set(["a"]);
    const content = "See [missing](/docs/missing-page)";
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    expect(diags.warnings()).toHaveLength(1);
    const warnings = diags.warnings();
    expect(warnings[0]?.message).toContain("missing-page");
  });

  test("ignores external links", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set<string>();
    const content = "See [Google](https://google.com)";
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    expect(diags.all()).toHaveLength(0);
  });

  test("ignores anchor-only links", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set<string>();
    const content = "See [section](#my-section)";
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    expect(diags.all()).toHaveLength(0);
  });

  test("handles multiple broken links", () => {
    const diags = new Diagnostics();
    const knownSlugs = new Set(["docs/a"]);
    const content = "[x](/docs/x) and [y](/docs/y)";
    validateInternalLinks(content, knownSlugs, "test.md", diags);
    expect(diags.warnings()).toHaveLength(2);
  });
});
