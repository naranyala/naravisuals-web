/**
 * ErrorBoundary Component Tests
 */

import { describe, expect, mock, spyOn, test } from "bun:test";
import { render } from "@testing-library/react";
import { createElement as h } from "react";
import { ErrorBoundary } from "../src/ErrorBoundary";

// Helper: component that throws during render
function BrokenComponent() {
  throw new Error("Test render error");
}

function WorkingComponent() {
  return h("div", { "data-testid": "working" }, "All good");
}

describe("ErrorBoundary", () => {
  test("renders children when no error", () => {
    const { getByTestId, getByText } = render(h(ErrorBoundary, null, h(WorkingComponent)));
    expect(getByTestId("working")).toBeTruthy();
    expect(getByText("All good")).toBeTruthy();
  });

  test("catches render error and shows fallback", () => {
    const spy = spyOn(console, "error").mockImplementation(() => {});

    const { getByText, getByRole } = render(h(ErrorBoundary, null, h(BrokenComponent)));

    expect(getByText("Something went wrong")).toBeTruthy();
    expect(getByText("Test render error")).toBeTruthy();
    expect(getByRole("button", { name: /try again/i })).toBeTruthy();

    spy.mockRestore();
  });

  test("custom fallback is used when provided", () => {
    const spy = spyOn(console, "error").mockImplementation(() => {});

    const customFallback = h("div", { "data-testid": "custom" }, "Custom error!");
    const fallbackFn = mock(() => customFallback);

    const { getByTestId, getByText } = render(
      h(ErrorBoundary, { fallback: fallbackFn as any }, h(BrokenComponent))
    );

    expect(fallbackFn).toHaveBeenCalled();
    expect(getByTestId("custom")).toBeTruthy();
    expect(getByText("Custom error!")).toBeTruthy();

    spy.mockRestore();
  });
});
