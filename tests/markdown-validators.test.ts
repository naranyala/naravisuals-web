import { describe, expect, test } from "bun:test";
import {
  codeblockValidator,
  imageValidator,
  linkValidator,
  mermaidValidator,
  structureValidator,
} from "../scripts/plugins/validators";

describe("Markdown Content Validators", () => {
  describe("codeblockValidator", () => {
    test("flags missing descriptions", async () => {
      const content = "```ts\nconst x = 1;\n```";
      const result = await codeblockValidator.validate(content, "test.md");
      expect(result.issues.some((i) => i.message.includes("description"))).toBe(true);
    });

    test("passes with description", async () => {
      const content = "```ts:desc=Testing\nconst x = 1;\n```";
      const result = await codeblockValidator.validate(content, "test.md");
      const errors = result.issues.filter(
        (i) => i.severity === "error" || i.severity === "warning"
      );
      expect(errors.length).toBe(0);
    });
  });

  describe("mermaidValidator", () => {
    test("flags invalid mermaid syntax", async () => {
      const content = "```mermaid\ninvalid syntax here\n```";
      const result = await mermaidValidator.validate(content, "test.md");
      expect(result.issues.length).toBeGreaterThan(0);
    });

    test("passes valid mermaid", async () => {
      const content = "```mermaid\ngraph TD\nA-->B\n```";
      const result = await mermaidValidator.validate(content, "test.md");
      expect(result.issues.some((i) => i.severity === "error")).toBe(false);
    });
  });

  describe("imageValidator", () => {
    test("flags missing alt text", async () => {
      const content = "![](image.png)";
      const result = await imageValidator.validate(content, "test.md");
      expect(result.issues.some((i) => i.message.includes("alt text"))).toBe(true);
    });

    test("flags empty source", async () => {
      const content = "![Alt text]()";
      const result = await imageValidator.validate(content, "test.md");
      expect(result.issues.some((i) => i.message.includes("source"))).toBe(true);
    });

    test("passes valid images", async () => {
      const content = "![A beautiful sunset](sunset.jpg)";
      const result = await imageValidator.validate(content, "test.md");
      expect(result.issues.length).toBe(0);
    });
  });

  describe("structureValidator", () => {
    test("flags inconsistent list markers", async () => {
      const content = "- Item 1\n* Item 2";
      const result = await structureValidator.validate(content, "test.md");
      expect(result.issues.some((i) => i.message.includes("Inconsistent"))).toBe(true);
    });

    test("passes consistent list markers", async () => {
      const content = "- Item 1\n- Item 2";
      const result = await structureValidator.validate(content, "test.md");
      expect(result.issues.length).toBe(0);
    });
  });

  describe("linkValidator", () => {
    test("passes external links", async () => {
      const content = "[Google](https://google.com)";
      const result = await linkValidator.validate(content, "test.md");
      // External links should be ignored by the broken internal link validator
      expect(result.issues.length).toBe(0);
    });
  });

  describe("Header Hierarchy (Manual Logic Check)", () => {
    // This logic resides in Middlewares.ts, testing the regex here
    const checkHierarchy = (content: string) => {
      const headerRegex = /^(#{1,6})\s+/gm;
      let lastLevel = 0;
      let match: RegExpExecArray | null;
      const issues: string[] = [];

      while (true) {
        match = headerRegex.exec(content);
        if (match === null) break;

        const level = match[1].length;
        if (level > lastLevel + 1 && lastLevel > 0) {
          issues.push(`Skipped h${lastLevel} to h${level}`);
        }
        lastLevel = level;
      }
      return issues;
    };

    test("detects skipped header levels", () => {
      const content = "# Title\n### Subtitle";
      const issues = checkHierarchy(content);
      expect(issues).toContain("Skipped h1 to h3");
    });

    test("passes correct hierarchy", () => {
      const content = "# Title\n## Subtitle\n### Details";
      const issues = checkHierarchy(content);
      expect(issues.length).toBe(0);
    });
  });
});
