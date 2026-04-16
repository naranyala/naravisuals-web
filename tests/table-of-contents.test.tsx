/**
 * TableOfContents Component Tests
 */

import { describe, expect, test } from "bun:test";
import { TableOfContents } from "../src/features/navigation/TableOfContents";
import { renderWithServices } from "./test-utils";

const mockTocItems = [
  { value: "Introduction", id: "introduction", level: 1 },
  { value: "Getting Started", id: "getting-started", level: 2 },
  { value: "Installation", id: "installation", level: 2 },
  { value: "Configuration", id: "configuration", level: 3 },
  { value: "Advanced Usage", id: "advanced-usage", level: 2 },
];

describe("TableOfContents", () => {
  test("renders TOC items as links", () => {
    renderWithServices(<TableOfContents items={mockTocItems} />);
    const links = document.querySelectorAll(".toc-item a");
    const texts = Array.from(links).map((l) => l.textContent);
    expect(texts).toContain("Introduction");
    expect(texts).toContain("Getting Started");
    expect(texts).toContain("Configuration");
  });

  test("renders as list", () => {
    renderWithServices(<TableOfContents items={mockTocItems} />);
    const items = document.querySelectorAll(".toc-item");
    expect(items.length).toBe(mockTocItems.length);
  });

  test("applies level classes", () => {
    renderWithServices(<TableOfContents items={mockTocItems} />);
    expect(document.querySelector(".toc-item-level-2")).toBeDefined();
    expect(document.querySelector(".toc-item-level-3")).toBeDefined();
  });

  test("links to headings via href", () => {
    renderWithServices(<TableOfContents items={mockTocItems} />);
    const links = document.querySelectorAll(".toc-item a");
    const gsLink = Array.from(links).find((l) => l.textContent === "Getting Started");
    expect(gsLink?.getAttribute("href")).toBe("#getting-started");
  });

  test("empty items renders null (empty body)", () => {
    renderWithServices(<TableOfContents items={[]} />);
    // Returns null, so nothing should be in body for this component
    expect(document.querySelector(".toc-item")).toBeNull();
  });

  test("single item renders", () => {
    renderWithServices(<TableOfContents items={[{ value: "Only", id: "only", level: 1 }]} />);
    expect(document.querySelector(".toc-item a")?.textContent).toBe("Only");
  });
});
