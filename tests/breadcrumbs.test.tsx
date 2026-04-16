/**
 * Breadcrumbs Component Tests
 */

import { describe, expect, test } from "bun:test";
import { within } from "@testing-library/react";
import { Breadcrumbs } from "../src/features/navigation/Breadcrumbs";
import { renderWithServices } from "./test-utils";

describe("Breadcrumbs", () => {
  test("renders breadcrumb items", () => {
    const { container } = renderWithServices(
      <Breadcrumbs items={[{ label: "Guides" }, { label: "Getting Started" }]} />
    );
    const currents = within(container).getAllByText("Getting Started");
    expect(currents.length).toBeGreaterThan(0);
  });

  test("renders links with href", () => {
    const { container } = renderWithServices(
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Current" }]} />
    );
    const link = within(container).getByText("Home");
    expect(link.getAttribute("href")).toBe("/");
  });

  test("current item rendered as span not link", () => {
    const { container } = renderWithServices(
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Current" }]} />
    );
    const current = within(container).getByText("Current");
    expect(current.tagName.toLowerCase()).toBe("span");
  });

  test("renders correct number of items", () => {
    const { container } = renderWithServices(
      <Breadcrumbs items={[{ label: "A" }, { label: "B" }, { label: "C" }]} />
    );
    // Breadcrumbs always includes "Docs" as first li, plus the passed items
    const items = within(container).getAllByRole("listitem");
    expect(items.length).toBe(4); // 1 (Docs) + 3 (items)
  });

  test("single item renders", () => {
    const { container } = renderWithServices(<Breadcrumbs items={[{ label: "Only Item" }]} />);
    const current = within(container).getByText("Only Item");
    expect(current).toBeDefined();
  });

  test("empty items renders navigation wrapper", () => {
    const { container } = renderWithServices(<Breadcrumbs items={[]} />);
    expect(within(container).getByRole("navigation")).toBeDefined();
  });

  test("has navigation role", () => {
    const { container } = renderWithServices(
      <Breadcrumbs items={[{ label: "A" }, { label: "B" }]} />
    );
    expect(within(container).getByRole("navigation")).toBeDefined();
  });
});
