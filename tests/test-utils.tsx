/**
 * Test utilities and helpers
 */

if (typeof window !== "undefined" && !window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(performance.now()), 16) as any;
  };
}

if (typeof window !== "undefined" && !window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };
}

import {
  cleanup,
  type RenderOptions,
  type RenderResult,
  render,
  screen,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { StoreProvider } from "../src/core/store";
import {
  type ContainerOptions,
  createContainer,
  type ServiceContainer,
  ServicesProvider,
} from "../src/services";
import {
  createMockDom,
  createMockRouter,
  createMockStorage,
  createMockTheme,
} from "../src/services/mocks";

// ─── Test Render ──────────────────────────────────────────────────────────

interface TestRenderOptions {
  containerOptions?: ContainerOptions;
  renderOptions?: Omit<RenderOptions, "wrapper">;
}

/**
 * Render a component with the DI provider using mock services.
 * Returns the container (ServiceContainer) plus all testing-library queries.
 * Use `document.querySelector()` for DOM queries since container from
 * testing-library can be inconsistent in jsdom/bun.
 */
export function renderWithServices(
  ui: ReactNode,
  options: TestRenderOptions = {}
): RenderResult & { services: ServiceContainer } {
  const storage = createMockStorage();
  const container = createContainer({
    storage,
    router: createMockRouter(),
    dom: createMockDom(),
    ...options.containerOptions,
  });
  container.theme = createMockTheme(storage);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ServicesProvider container={container}>
        <StoreProvider>{children}</StoreProvider>
      </ServicesProvider>
    );
  }

  const result = render(ui, {
    wrapper: Wrapper,
    ...options.renderOptions,
  });

  return { ...result, services: container };
}

// Re-export for convenience
export { cleanup, screen };

// ─── Mock Data ────────────────────────────────────────────────────────────

export const mockDocEntry = {
  id: "test/doc",
  slug: "test/doc",
  title: "Test Document",
  description: "A test document",
  sidebar_label: "Test Doc",
  sidebar_position: 1,
  section: "docs",
  category: "test",
  content: "<h1>Test Document</h1><p>Test content</p>",
  toc: [
    { value: "Test Document", id: "test-document", level: 1 },
    { value: "Section One", id: "section-one", level: 2 },
    { value: "Section Two", id: "section-two", level: 2 },
  ],
};

export const mockSidebarData = [
  {
    type: "category" as const,
    label: "Test Category",
    link: { type: "doc", id: "test/doc" },
    items: [
      { type: "doc" as const, id: "test/doc", label: "Test Doc", slug: "test/doc" },
      { type: "doc" as const, id: "test/doc-two", label: "Test Doc Two", slug: "test/doc-two" },
    ],
  },
];
