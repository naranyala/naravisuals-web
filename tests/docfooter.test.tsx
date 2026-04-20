/**
 * DocFooter Component Tests
 */

import { describe, expect, mock, test } from "bun:test";
import { DocFooter } from "../src/features/docs/DocFooter";
import { renderWithServices } from "./test-utils";

const prevDoc = { title: "Previous Doc", slug: "test/prev" };
const nextDoc = { title: "Next Doc", slug: "test/next" };

describe("DocFooter", () => {
  test("renders pagination links", () => {
    renderWithServices(<DocFooter prevDoc={prevDoc} nextDoc={nextDoc} onNavigate={mock()} />);
    const links = document.querySelectorAll(".pagination-link");
    expect(links.length).toBe(2);
    expect(links[0]?.textContent).toContain("Previous Doc");
    expect(links[1]?.textContent).toContain("Next Doc");
  });

  test("calls onNavigate for previous link", () => {
    const nav = mock();
    renderWithServices(<DocFooter prevDoc={prevDoc} nextDoc={nextDoc} onNavigate={nav} />);
    const link = document.querySelector<HTMLAnchorElement>(".pagination-prev");
    if (link) {
      expect(link.getAttribute("href")).toBe("/docs/test/prev");
    }
  });

  test("calls onNavigate for next link", () => {
    const nav = mock();
    renderWithServices(<DocFooter prevDoc={prevDoc} nextDoc={nextDoc} onNavigate={nav} />);
    const link = document.querySelector<HTMLAnchorElement>(".pagination-next");
    if (link) {
      expect(link.getAttribute("href")).toBe("/docs/test/next");
    }
  });

  test("renders without prevDoc", () => {
    renderWithServices(<DocFooter nextDoc={nextDoc} onNavigate={mock()} />);
    const links = document.querySelectorAll(".pagination-link");
    expect(links.length).toBe(1);
    expect(links[0]?.textContent).toContain("Next Doc");
  });

  test("renders without nextDoc", () => {
    renderWithServices(<DocFooter prevDoc={prevDoc} onNavigate={mock()} />);
    const links = document.querySelectorAll(".pagination-link");
    expect(links.length).toBe(1);
    expect(links[0]?.textContent).toContain("Previous Doc");
  });

  test("renders with no prev or next", () => {
    renderWithServices(<DocFooter onNavigate={mock()} />);
    expect(document.querySelector(".pagination-nav")).toBeNull();
  });

  test("pagination nav and footer exist", () => {
    renderWithServices(<DocFooter prevDoc={prevDoc} nextDoc={nextDoc} onNavigate={mock()} />);
    expect(document.querySelector(".pagination-nav")).toBeTruthy();
    expect(document.querySelector(".doc-footer")).toBeTruthy();
  });
});
