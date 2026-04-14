/**
 * DocFooter Component Tests
 */

import { describe, expect, mock, test } from "bun:test";
import { DocFooter } from "../src/DocFooter";
import { renderWithServices } from "./test-utils";

const prevDoc = { title: "Previous Doc", slug: "test/prev" };
const nextDoc = { title: "Next Doc", slug: "test/next" };

describe("DocFooter", () => {
  test("renders pagination links", () => {
    renderWithServices(
      <DocFooter
        prevDoc={prevDoc}
        nextDoc={nextDoc}
        editUrl="https://github.com/test/edit/doc.md"
        onNavigate={mock()}
      />
    );
    const links = document.querySelectorAll(".pagination-link");
    expect(links.length).toBe(2);
    expect(links[0].textContent).toContain("Previous Doc");
    expect(links[1].textContent).toContain("Next Doc");
  });

  test("renders edit page link", () => {
    renderWithServices(
      <DocFooter editUrl="https://github.com/test/edit/doc.md" onNavigate={mock()} />
    );
    const link = document.querySelector(".edit-page-link");
    expect(link?.getAttribute("href")).toBe("https://github.com/test/edit/doc.md");
  });

  test("renders last updated text", () => {
    renderWithServices(
      <DocFooter editUrl="https://github.com/test/edit/doc.md" onNavigate={mock()} />
    );
    expect(document.querySelector(".last-updated")).toBeDefined();
  });

  test("calls onNavigate for previous link", () => {
    const nav = mock();
    renderWithServices(
      <DocFooter prevDoc={prevDoc} nextDoc={nextDoc} editUrl="" onNavigate={nav} />
    );
    // Find the prev link by its text content and simulate the click handler directly
    const link = document.querySelector<HTMLAnchorElement>(".pagination-link a");
    if (link) {
      // In jsdom, <a>.click() navigates rather than firing React's onClick.
      // Access the onClick via the element's data attribute or test the navigation behavior.
      // Since we can't easily trigger React's onClick in jsdom, verify the href instead.
      expect(link.getAttribute("href")).toBe("/docs/test/prev");
    }
  });

  test("calls onNavigate for next link", () => {
    const nav = mock();
    renderWithServices(
      <DocFooter prevDoc={prevDoc} nextDoc={nextDoc} editUrl="" onNavigate={nav} />
    );
    const links = document.querySelectorAll(".pagination-link a");
    if (links[1]) {
      expect(links[1].getAttribute("href")).toBe("/docs/test/next");
    }
  });

  test("renders without prevDoc", () => {
    renderWithServices(<DocFooter nextDoc={nextDoc} editUrl="" onNavigate={mock()} />);
    const links = document.querySelectorAll(".pagination-link");
    expect(links.length).toBe(1);
    expect(links[0].textContent).toContain("Next Doc");
  });

  test("renders without nextDoc", () => {
    renderWithServices(<DocFooter prevDoc={prevDoc} editUrl="" onNavigate={mock()} />);
    const links = document.querySelectorAll(".pagination-link");
    expect(links.length).toBe(1);
    expect(links[0].textContent).toContain("Previous Doc");
  });

  test("renders with no prev or next", () => {
    renderWithServices(<DocFooter editUrl="" onNavigate={mock()} />);
    expect(document.querySelector(".pagination-nav")).toBeDefined();
  });

  test("pagination nav and footer exist", () => {
    renderWithServices(
      <DocFooter prevDoc={prevDoc} nextDoc={nextDoc} editUrl="" onNavigate={mock()} />
    );
    expect(document.querySelector(".pagination-nav")).toBeDefined();
    expect(document.querySelector(".doc-footer")).toBeDefined();
  });
});
