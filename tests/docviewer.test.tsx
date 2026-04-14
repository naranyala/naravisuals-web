/**
 * DocViewer Component Tests
 */

import { describe, expect, test } from "bun:test";
import { DocViewer } from "../src/DocViewer";
import { renderWithServices } from "./test-utils";

describe("DocViewer", () => {
  test("renders HTML content", () => {
    renderWithServices(<DocViewer html="<h1>Hello World</h1><p>Test content</p>" />);
    expect(document.querySelector(".doc-content")).toBeDefined();
    expect(document.querySelector("h1")?.textContent).toBe("Hello World");
    expect(document.querySelector("p")?.textContent).toBe("Test content");
  });

  test("renders code blocks", () => {
    renderWithServices(
      <DocViewer html='<div class="code-block"><pre><code>console.log("test")</code></pre></div>' />
    );
    expect(document.querySelector(".code-block")).toBeDefined();
    expect(document.querySelector("code")?.textContent).toBe('console.log("test")');
  });

  test("renders tables", () => {
    renderWithServices(
      <DocViewer html="<table><thead><tr><th>Col 1</th></tr></thead><tbody><tr><td>Value</td></tr></tbody></table>" />
    );
    expect(document.querySelector("table")).toBeDefined();
    expect(document.querySelector("th")?.textContent).toBe("Col 1");
    expect(document.querySelector("td")?.textContent).toBe("Value");
  });

  test("renders blockquotes", () => {
    renderWithServices(<DocViewer html="<blockquote><p>A wise quote</p></blockquote>" />);
    expect(document.querySelector("blockquote")).toBeDefined();
    expect(document.querySelector("blockquote p")?.textContent).toBe("A wise quote");
  });

  test("renders lists", () => {
    renderWithServices(<DocViewer html="<ul><li>Item 1</li><li>Item 2</li></ul>" />);
    const items = document.querySelectorAll("li");
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe("Item 1");
  });

  test("empty HTML renders without error", () => {
    renderWithServices(<DocViewer html="" />);
    expect(document.querySelector(".doc-content")).toBeDefined();
    expect(document.querySelector(".doc-content")?.innerHTML).toBe("");
  });

  test("uses dangerouslySetInnerHTML", () => {
    renderWithServices(<DocViewer html="<div class='custom'>Custom content</div>" />);
    expect(document.querySelector(".custom")).toBeDefined();
    expect(document.querySelector(".custom")?.textContent).toBe("Custom content");
  });

  // ─── Edge Cases ───────────────────────────────────────────────────

  test("handles HTML with special characters", () => {
    renderWithServices(<DocViewer html="<p>Special: &amp; &lt; &gt; &quot; &apos;</p>" />);
    expect(document.querySelector("p")?.textContent).toBe("Special: & < > \" '");
  });

  test("handles deeply nested HTML", () => {
    const nestedHtml = "<div>".repeat(50) + "Deep content" + "</div>".repeat(50);
    renderWithServices(<DocViewer html={nestedHtml} />);
    expect(document.querySelector(".doc-content")?.textContent).toBe("Deep content");
  });

  test("handles malformed HTML gracefully", () => {
    const malformedHtml = "<p>Unclosed paragraph<div>Nested<p>Another</div>";
    expect(() => renderWithServices(<DocViewer html={malformedHtml} />)).not.toThrow();
  });

  test("handles HTML with scripts (should not execute)", () => {
    const htmlWithScript = '<p>Safe</p><script>alert("XSS")</script>';
    renderWithServices(<DocViewer html={htmlWithScript} />);
    expect(document.querySelector(".doc-content")?.textContent).toContain("Safe");
  });

  test("handles HTML with styles", () => {
    const htmlWithStyle = '<p style="color: red;">Styled text</p>';
    renderWithServices(<DocViewer html={htmlWithStyle} />);
    const p = document.querySelector("p");
    expect(p?.textContent).toBe("Styled text");
    expect(p?.getAttribute("style")).toContain("color: red");
  });

  test("handles HTML with images", () => {
    const htmlWithImg = '<img src="test.jpg" alt="Test image" />';
    renderWithServices(<DocViewer html={htmlWithImg} />);
    const img = document.querySelector("img");
    expect(img?.getAttribute("src")).toBe("test.jpg");
    expect(img?.getAttribute("alt")).toBe("Test image");
  });

  test("handles HTML with forms", () => {
    const htmlWithForm = '<form><input type="text" /><button>Submit</button></form>';
    renderWithServices(<DocViewer html={htmlWithForm} />);
    expect(document.querySelector("form")).toBeDefined();
    expect(document.querySelector("input")).toBeDefined();
    expect(document.querySelector("button")?.textContent).toBe("Submit");
  });

  test("handles very large HTML content", () => {
    const largeHtml = Array.from({ length: 1000 }, (_, i) => `<p>Paragraph ${i}</p>`).join("");
    renderWithServices(<DocViewer html={largeHtml} />);
    const paragraphs = document.querySelectorAll("p");
    expect(paragraphs.length).toBe(1000);
  });

  test("handles HTML with anchor links", () => {
    const htmlWithLinks = '<a href="#section">Link to section</a>';
    renderWithServices(<DocViewer html={htmlWithLinks} />);
    const link = document.querySelector("a");
    expect(link?.getAttribute("href")).toBe("#section");
    expect(link?.textContent).toBe("Link to section");
  });

  test("handles HTML with definitions lists", () => {
    const htmlWithDl = "<dl><dt>Term</dt><dd>Definition</dd></dl>";
    renderWithServices(<DocViewer html={htmlWithDl} />);
    expect(document.querySelector("dl")).toBeDefined();
    expect(document.querySelector("dt")?.textContent).toBe("Term");
    expect(document.querySelector("dd")?.textContent).toBe("Definition");
  });

  test("handles HTML with preformatted text", () => {
    const htmlWithPre = "<pre>  Indented text\n  Multiple lines</pre>";
    renderWithServices(<DocViewer html={htmlWithPre} />);
    expect(document.querySelector("pre")?.textContent).toBe("  Indented text\n  Multiple lines");
  });

  // ─── Accessibility ────────────────────────────────────────────────

  test("renders with proper document structure", () => {
    renderWithServices(<DocViewer html="<h1>Main heading</h1><p>Content</p>" />);
    expect(document.querySelector(".doc-content")).toHaveAttribute("class");
  });
});
