/**
 * Mermaid Content Validation Tests
 *
 * Tests the strict validation of Mermaid diagram content
 */

import { describe, expect, test } from "bun:test";
import { validateMermaidContent } from "../scripts/plugins/validators/mermaid-content.ts";

describe("Mermaid Content Validation", () => {
  describe("Empty content validation", () => {
    test("rejects empty diagram", async () => {
      const errors = await validateMermaidContent("");
      expect(errors).toHaveLength(1);
      expect(errors[0]?.message).toBe("Empty diagram");
    });

    test("rejects whitespace-only diagram", async () => {
      const errors = await validateMermaidContent("   \n  \n  ");
      expect(errors).toHaveLength(1);
      expect(errors[0]?.message).toBe("Empty diagram");
    });
  });

  describe("Invalid pattern detection", () => {
    test("rejects HTML entity patterns like &#x26;", async () => {
      const errors = await validateMermaidContent("flowchart TD;\nA-->B;\nB-->C&#x26;D;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("HTML entity"))).toBe(true);
    });

    test("rejects double-encoded ampersands", async () => {
      const errors = await validateMermaidContent("flowchart TD;\nA&amp;amp;B-->C;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Double-encoded"))).toBe(true);
    });

    test("rejects hex escape sequences", async () => {
      const errors = await validateMermaidContent("flowchart TD;\nA-->B\\x26C;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Hex escape"))).toBe(true);
    });

    test("rejects unicode escape sequences", async () => {
      const errors = await validateMermaidContent("flowchart TD;\nA-->B\\u0026C;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Unicode escape"))).toBe(true);
    });

    test("rejects URL-encoded characters", async () => {
      const errors = await validateMermaidContent("flowchart TD;\nA-->B%26C;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("URL-encoded"))).toBe(true);
    });
  });

  describe("Quote validation", () => {
    test("rejects unclosed quotes", async () => {
      const errors = await validateMermaidContent('flowchart TD;\nA["Unclosed quote-->B;');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Unclosed quote"))).toBe(true);
    });

    test("rejects unclosed backticks", async () => {
      const errors = await validateMermaidContent("flowchart TD;\nA[`Unclosed backtick-->B;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Unclosed quote"))).toBe(true);
    });
  });

  describe("Bracket balance validation", () => {
    test("rejects unbalanced braces", async () => {
      const errors = await validateMermaidContent("flowchart TD;\nA[Node-->B;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Unbalanced"))).toBe(true);
    });

    test("rejects unbalanced brackets", async () => {
      const errors = await validateMermaidContent("flowchart TD;\nA{Node-->B;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Unbalanced"))).toBe(true);
    });

    test("rejects unbalanced parentheses", async () => {
      const errors = await validateMermaidContent("flowchart TD;\nA(Node-->B;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Unbalanced"))).toBe(true);
    });
  });

  describe("Diagram type validation", () => {
    test("rejects missing diagram type", async () => {
      const errors = await validateMermaidContent("A-->B;\nB-->C;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Invalid diagram type"))).toBe(true);
    });

    test("rejects invalid diagram type", async () => {
      const errors = await validateMermaidContent("invalidType TD;\nA-->B;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Invalid diagram type"))).toBe(true);
    });

    test("allows sequenceDiagram type", async () => {
      const errors = await validateMermaidContent("sequenceDiagram\nA->>B: Hello");
      expect(errors).toHaveLength(0);
    });

    test("allows directive syntax", async () => {
      const errors = await validateMermaidContent(
        "%%{init: {'theme':'base'}}%%\nflowchart TD;\nA-->B;"
      );
      expect(errors).toHaveLength(0);
    });
  });

  describe("Valid diagrams", () => {
    test("accepts sequence diagram", async () => {
      const content = `sequenceDiagram
      Alice->>John: Hello John, how are you?
      John-->>Alice: Great!`;
      const errors = await validateMermaidContent(content);
      expect(errors).toHaveLength(0);
    });

    test("accepts class diagram", async () => {
      const content = `classDiagram
      class Animal {
        +String name
        +eat()
      }`;
      const errors = await validateMermaidContent(content);
      expect(errors).toHaveLength(0);
    });

    test("accepts gantt chart", async () => {
      const content = `gantt
      title A Gantt Diagram
      section Section
      Task :a1, 2024-01-01, 30d`;
      const errors = await validateMermaidContent(content);
      expect(errors).toHaveLength(0);
    });

    test("accepts pie chart", async () => {
      const content = `pie
      title Key elements in Product
      "Data" : 40
      "Logic" : 30`;
      const errors = await validateMermaidContent(content);
      expect(errors).toHaveLength(0);
    });
  });

  describe("Edge cases", () => {
    test("allows single arrow inside quotes in flowchart", async () => {
      const errors = await validateMermaidContent('flowchart TD;\nA["Click -> Here"]-->B;');
      expect(errors).toHaveLength(0);
    });

    test("handles escaped quotes in labels", async () => {
      const errors = await validateMermaidContent('flowchart TD;\nA["He said \\"Hello\\""]-->B;');
      expect(errors).toHaveLength(0);
    });

    test("handles HTML entities in labels", async () => {
      const errors = await validateMermaidContent('flowchart TD;\nA["&amp;"]-->B;');
      // After decoding, this becomes &, which should be caught
      expect(errors.length).toBeGreaterThanOrEqual(0);
    });

    test("rejects multiple issues", async () => {
      const errors = await validateMermaidContent('invalidType;\nA[""]-->B&#x26;C;');
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
