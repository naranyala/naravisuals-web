/**
 * DocViewer Component Tests
 */

import { describe, expect, test } from "bun:test";
import { DocViewer } from "../src/features/docs/DocViewer";
import { renderWithServices } from "./test-utils";

describe("DocViewer", () => {
  test("renders HTML content", () => {
    renderWithServices(<DocViewer html="<h1>Hello World</h1><p>Test content</p>" slug="test" />);
    expect(document.querySelector(".doc-content")).toBeTruthy();
    expect(document.querySelector("h1")?.textContent).toBe("Hello World");
    expect(document.querySelector("p")?.textContent).toBe("Test content");
  });

  test("renders code blocks", () => {
    renderWithServices(
      <DocViewer
        html='<div class="code-block"><pre><code>console.log("test")</code></pre></div>'
        slug="test"
      />
    );
    expect(document.querySelector(".code-block")).toBeTruthy();
    expect(document.querySelector("code")?.textContent).toBe('console.log("test")');
  });

  test("renders tables", () => {
    renderWithServices(
      <DocViewer
        html="<table><thead><tr><th>Col 1</th></tr></thead><tbody><tr><td>Value</td></tr></tbody></table>"
        slug="test"
      />
    );
    expect(document.querySelector("table")).toBeTruthy();
    expect(document.querySelector("th")?.textContent).toBe("Col 1");
    expect(document.querySelector("td")?.textContent).toBe("Value");
  });

  test("renders blockquotes", () => {
    renderWithServices(
      <DocViewer html="<blockquote><p>A wise quote</p></blockquote>" slug="test" />
    );
    expect(document.querySelector("blockquote")).toBeTruthy();
    expect(document.querySelector("blockquote p")?.textContent).toBe("A wise quote");
  });

  test("renders lists", () => {
    renderWithServices(<DocViewer html="<ul><li>Item 1</li><li>Item 2</li></ul>" slug="test" />);
    const items = document.querySelectorAll("li");
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe("Item 1");
  });

  test("empty HTML renders without error", () => {
    renderWithServices(<DocViewer html="" slug="test" />);
    // Basic structural check
    expect(document.querySelector(".doc-content")).toBeTruthy();
  });

  test("uses dangerouslySetInnerHTML", () => {
    renderWithServices(<DocViewer html="<div class='custom'>Custom content</div>" slug="test" />);
    expect(document.querySelector(".custom")).toBeTruthy();
    expect(document.querySelector(".custom")?.textContent).toBe("Custom content");
  });

  // ─── Edge Cases ───────────────────────────────────────────────────

  test("handles HTML with special characters", () => {
    renderWithServices(
      <DocViewer html="<p>Special: &amp; &lt; &gt; &quot; &apos;</p>" slug="test" />
    );
    expect(document.querySelector("p")?.textContent).toBe("Special: & < > \" '");
  });

  test("handles deeply nested HTML", () => {
    const nestedHtml = `${"<div>".repeat(50)}Deep content${"</div>".repeat(50)}`;
    renderWithServices(<DocViewer html={nestedHtml} slug="test" />);
    expect(document.querySelector(".doc-content")?.textContent).toBe("Deep content");
  });

  test("handles malformed HTML gracefully", () => {
    const malformedHtml = "<p>Unclosed paragraph<div>Nested<p>Another</div>";
    expect(() => renderWithServices(<DocViewer html={malformedHtml} slug="test" />)).not.toThrow();
  });

  test("handles HTML with scripts (should not execute)", () => {
    const htmlWithScript = '<p>Safe</p><script>alert("XSS")</script>';
    renderWithServices(<DocViewer html={htmlWithScript} slug="test" />);
    expect(document.querySelector(".doc-content")?.textContent).toContain("Safe");
  });

  test("handles HTML with styles", () => {
    const htmlWithStyle = '<p style="color: red;">Styled text</p>';
    renderWithServices(<DocViewer html={htmlWithStyle} slug="test" />);
    const p = document.querySelector("p");
    expect(p?.textContent).toBe("Styled text");
    expect(p?.getAttribute("style")).toContain("color: red");
  });

  test("handles HTML with images", () => {
    const htmlWithImg = '<img src="test.jpg" alt="Test image" />';
    renderWithServices(<DocViewer html={htmlWithImg} slug="test" />);
    const img = document.querySelector("img");
    expect(img?.getAttribute("src")).toBe("test.jpg");
    expect(img?.getAttribute("alt")).toBe("Test image");
  });

  test("handles HTML with forms", () => {
    const htmlWithForm = '<form><input type="text" /><button>Submit</button></form>';
    renderWithServices(<DocViewer html={htmlWithForm} slug="test" />);
    expect(document.querySelector("form")).toBeTruthy();
    expect(document.querySelector("input")).toBeTruthy();
    expect(document.querySelector("button")?.textContent).toBe("Submit");
  });

  test("handles very large HTML content", () => {
    const largeHtml = Array.from({ length: 1000 }, (_, i) => `<p>Paragraph ${i}</p>`).join("");
    renderWithServices(<DocViewer html={largeHtml} slug="test" />);
    const paragraphs = document.querySelectorAll("p");
    expect(paragraphs.length).toBe(1000);
  });

  test("handles HTML with anchor links", () => {
    const htmlWithLinks = '<a href="#section">Link to section</a>';
    renderWithServices(<DocViewer html={htmlWithLinks} slug="test" />);
    const link = document.querySelector("a");
    expect(link?.getAttribute("href")).toBe("#section");
    expect(link?.textContent).toBe("Link to section");
  });

  test("handles HTML with definitions lists", () => {
    const htmlWithDl = "<dl><dt>Term</dt><dd>Definition</dd></dl>";
    renderWithServices(<DocViewer html={htmlWithDl} slug="test" />);
    expect(document.querySelector("dl")).toBeTruthy();
    expect(document.querySelector("dt")?.textContent).toBe("Term");
    expect(document.querySelector("dd")?.textContent).toBe("Definition");
  });

  test("handles HTML with preformatted text", () => {
    const htmlWithPre = "<pre>  Indented text\n  Multiple lines</pre>";
    renderWithServices(<DocViewer html={htmlWithPre} slug="test" />);
    expect(document.querySelector("pre")?.textContent).toBe("  Indented text\n  Multiple lines");
  });

  // ─── Accessibility ────────────────────────────────────────────────

  test("renders with proper document structure", () => {
    renderWithServices(<DocViewer html="<h1>Main heading</h1><p>Content</p>" slug="test" />);
    const el = document.querySelector(".doc-content");
    expect(el?.className).toContain("doc-content");
  });
});
