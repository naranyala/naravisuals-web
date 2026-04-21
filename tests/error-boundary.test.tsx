/**
 * ErrorBoundary Component Tests
 */

import { describe, expect, mock, spyOn, test } from "bun:test";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { ErrorBoundary } from "../src/core/error-handling/ErrorBoundary";

// Helper: component that throws during render
function BrokenComponent(): ReactNode {
  throw new Error("Test render error");
}

function WorkingComponent(): ReactNode {
  return <div data-testid="working">All good</div>;
}

describe("ErrorBoundary", () => {
  test("renders children when no error", () => {
    const { getByTestId, getByText } = render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );
    expect(getByTestId("working")).toBeTruthy();
    expect(getByText("All good")).toBeTruthy();
  });

  test("catches render error and shows fallback", () => {
    const spy = spyOn(console, "error").mockImplementation(() => {});

    const { getByText, getByRole } = render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(getByText(/application error/i)).toBeTruthy();
    expect(getByText("Test render error")).toBeTruthy();
    expect(getByRole("button", { name: /reload page/i })).toBeTruthy();

    spy.mockRestore();
  });

  test("custom fallback is used when provided", () => {
    const spy = spyOn(console, "error").mockImplementation(() => {});

    const fallbackFn = mock((error: Error) => (
      <div data-testid="custom">Custom error: {error.message}</div>
    ));

    const { getByTestId, getByText } = render(
      <ErrorBoundary fallback={fallbackFn as any}>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(fallbackFn).toHaveBeenCalled();
    expect(getByTestId("custom")).toBeTruthy();
    expect(getByText(/custom error/i)).toBeTruthy();

    spy.mockRestore();
  });
});
