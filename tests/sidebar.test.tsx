/**
 * Sidebar Component Tests
 */

import { describe, expect, mock, test } from "bun:test";
import { Sidebar } from "../src/features/navigation/Sidebar";
import { renderWithServices } from "./test-utils";

const mockSidebar = [
  {
    type: "category" as const,
    label: "Getting Started",
    link: { type: "doc", id: "intro" },
    items: [
      { type: "doc" as const, id: "intro", label: "Introduction", slug: "intro" },
      { type: "doc" as const, id: "setup", label: "Setup", slug: "setup" },
    ],
  },
  {
    type: "doc" as const,
    id: "standalone",
    label: "Standalone Doc",
    slug: "standalone",
  },
];

describe("Sidebar", () => {
  test("renders categories", () => {
    renderWithServices(<Sidebar sidebar={mockSidebar} currentSlug="intro" onNavigate={mock()} />);
    expect(document.querySelector(".sidebar-category-label")?.textContent).toBe("Getting Started");
  });

  test("renders doc items within category", () => {
    renderWithServices(<Sidebar sidebar={mockSidebar} currentSlug="intro" onNavigate={mock()} />);
    const labels = document.querySelectorAll(".sidebar-link-label");
    const texts = Array.from(labels).map((l) => l.textContent);
    expect(texts).toContain("Introduction");
    expect(texts).toContain("Setup");
  });

  test("marks active item", () => {
    renderWithServices(<Sidebar sidebar={mockSidebar} currentSlug="setup" onNavigate={mock()} />);
    const active = document.querySelectorAll(".sidebar-link.active");
    expect(active.length).toBe(1);
    expect(active[0]?.textContent).toContain("Setup");
  });

  test("calls onNavigate when clicking a link", () => {
    const nav = mock();
    renderWithServices(<Sidebar sidebar={mockSidebar} currentSlug="intro" onNavigate={nav} />);
    const labels = document.querySelectorAll(".sidebar-link-label");
    const setupLabel = Array.from(labels).find((l) => l.textContent === "Setup");
    if (setupLabel) {
      const link = setupLabel.closest(".sidebar-link");
      if (link) (link as HTMLElement).click();
      expect(nav).toHaveBeenCalledWith("setup");
    }
  });

  test("renders standalone doc items", () => {
    renderWithServices(
      <Sidebar sidebar={mockSidebar} currentSlug="standalone" onNavigate={mock()} />
    );
    const labels = document.querySelectorAll(".sidebar-link-label");
    const texts = Array.from(labels).map((l) => l.textContent);
    expect(texts).toContain("Standalone Doc");
  });

  test("empty sidebar renders without error", () => {
    renderWithServices(<Sidebar sidebar={[]} currentSlug="" onNavigate={mock()} />);
    const content = document.querySelector(".sidebar-tree-view");
    expect(content?.children.length).toBe(0);
  });
});
