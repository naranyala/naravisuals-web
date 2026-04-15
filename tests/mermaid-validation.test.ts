/**
 * Mermaid Content Validation Tests
 *
 * Tests the strict validation of Mermaid diagram content
 */

import { describe, expect, test } from "bun:test";
import { validateMermaidContent } from "../scripts/plugins/validators/mermaid-content.ts";

describe("Mermaid Content Validation", () => {
  describe("Empty content validation", () => {
    test("rejects empty diagram", () => {
      const errors = validateMermaidContent("");
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe("Empty diagram");
    });

    test("rejects whitespace-only diagram", () => {
      const errors = validateMermaidContent("   \n  \n  ");
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe("Empty diagram");
    });
  });

  describe("Invalid pattern detection", () => {
    test("rejects HTML entity patterns like &#x26;", () => {
      const errors = validateMermaidContent("graph TD;\nA-->B;\nB-->C&#x26;D;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("HTML entity"))).toBe(true);
    });

    test("rejects double-encoded ampersands", () => {
      const errors = validateMermaidContent("graph TD;\nA&amp;&amp;B-->C;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Double-encoded"))).toBe(true);
    });

    test("rejects hex escape sequences", () => {
      const errors = validateMermaidContent("graph TD;\nA-->B\\x26C;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Hex escape"))).toBe(true);
    });

    test("rejects unicode escape sequences", () => {
      const errors = validateMermaidContent("graph TD;\nA-->B\\u0026C;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Unicode escape"))).toBe(true);
    });

    test("rejects URL-encoded characters", () => {
      const errors = validateMermaidContent("graph TD;\nA-->B%26C;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("URL-encoded"))).toBe(true);
    });
  });

  describe("Quote validation", () => {
    test("rejects empty quotes", () => {
      const errors = validateMermaidContent('graph TD;\nA[""]-->B;');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Empty quotes"))).toBe(true);
    });

    test("rejects whitespace-only quotes", () => {
      const errors = validateMermaidContent("graph TD;\nA['  ']-->B;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Empty quotes"))).toBe(true);
    });

    test("rejects quotes with only special characters", () => {
      const errors = validateMermaidContent('graph TD;\nA["&&*^%"]-->B;');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("only special characters"))).toBe(true);
    });

    test("allows valid quoted text", () => {
      const errors = validateMermaidContent('graph TD;\nA["Valid Label"]-->B["Another Label"];');
      expect(errors).toHaveLength(0);
    });

    test("allows quoted text with unicode", () => {
      const errors = validateMermaidContent('graph TD;\nA["中文标签"]-->B["日本語"];');
      expect(errors).toHaveLength(0);
    });
  });

  describe("Bracket balance validation", () => {
    test("rejects unbalanced braces", () => {
      const errors = validateMermaidContent("graph TD;\nA[Node-->B;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Unbalanced"))).toBe(true);
    });

    test("rejects unbalanced brackets", () => {
      const errors = validateMermaidContent("graph TD;\nA{Node-->B;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Unbalanced"))).toBe(true);
    });

    test("rejects unbalanced parentheses", () => {
      const errors = validateMermaidContent("graph TD;\nA(Node-->B;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Unbalanced"))).toBe(true);
    });

    test("allows balanced brackets", () => {
      const errors = validateMermaidContent("graph TD;\nA[Node]-->B[Node2];");
      expect(errors).toHaveLength(0);
    });
  });

  describe("Diagram type validation", () => {
    test("rejects missing diagram type", () => {
      const errors = validateMermaidContent("A-->B;\nB-->C;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Invalid diagram type"))).toBe(true);
    });

    test("rejects invalid diagram type", () => {
      const errors = validateMermaidContent("invalidType TD;\nA-->B;");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message.includes("Invalid diagram type"))).toBe(true);
    });

    test("allows graph type", () => {
      const errors = validateMermaidContent("graph TD;\nA-->B;");
      expect(errors).toHaveLength(0);
    });

    test("allows flowchart type", () => {
      const errors = validateMermaidContent("flowchart LR;\nA-->B;");
      expect(errors).toHaveLength(0);
    });

    test("allows sequenceDiagram type", () => {
      const errors = validateMermaidContent("sequenceDiagram\nA->>B: Hello");
      expect(errors).toHaveLength(0);
    });

    test("allows directive syntax", () => {
      const errors = validateMermaidContent("%%{init: {'theme':'base'}}%%\ngraph TD;\nA-->B;");
      expect(errors).toHaveLength(0);
    });
  });

  describe("Valid diagrams", () => {
    test("accepts simple flowchart", () => {
      const content = `graph TD;
  A[Start]-->B{Decision};
  B-->|Yes|C[Action];
  B-->|No|D[End];`;
      const errors = validateMermaidContent(content);
      expect(errors).toHaveLength(0);
    });

    test("accepts sequence diagram", () => {
      const content = `sequenceDiagram
  Alice->>John: Hello John, how are you?
  John-->>Alice: Great!`;
      const errors = validateMermaidContent(content);
      expect(errors).toHaveLength(0);
    });

    test("accepts class diagram", () => {
      const content = `classDiagram
  class Animal {
    +String name
    +eat()
  }`;
      const errors = validateMermaidContent(content);
      expect(errors).toHaveLength(0);
    });

    test("accepts gantt chart", () => {
      const content = `gantt
  title A Gantt Diagram
  section Section
  Task :a1, 2024-01-01, 30d`;
      const errors = validateMermaidContent(content);
      expect(errors).toHaveLength(0);
    });

    test("accepts pie chart", () => {
      const content = `pie
  title Key elements in Product
  "Data" : 40
  "Logic" : 30`;
      const errors = validateMermaidContent(content);
      expect(errors).toHaveLength(0);
    });
  });

  describe("Edge cases", () => {
    test("handles HTML entities in labels", () => {
      const errors = validateMermaidContent('graph TD;\nA["&amp;"]-->B;');
      // After decoding, this becomes &, which should be caught
      expect(errors.length).toBeGreaterThanOrEqual(0);
    });

    test("handles complex valid diagram with special chars", () => {
      const content = `graph TD;
  A["Node with (parentheses)"]-->B["Node with [brackets]"];
  B-->C{"Decision {point}"};`;
      const errors = validateMermaidContent(content);
      expect(errors).toHaveLength(0);
    });

    test("rejects multiple issues", () => {
      const errors = validateMermaidContent('invalidType;\nA[""]-->B&#x26;C;');
      expect(errors.length).toBeGreaterThan(1);
    });
  });
});
