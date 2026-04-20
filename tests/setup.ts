/**
 * Test setup for bun test with testing-library + jsdom
 */

import { afterAll, afterEach, beforeAll } from "bun:test";
import * as testingLibrary from "@testing-library/react";
import { JSDOM } from "jsdom";
import "@testing-library/jest-dom";

// ─── JSDOM Setup ───────────────────────────────────────────────────────────

function createDom() {
  const dom = new JSDOM("<!DOCTYPE html><html><body><div id='root'></div></body></html>", {
    url: "http://localhost/docs/intro",
    pretendToBeVisual: true,
  });

  const win = dom.window;

  // Apply mocks to the new window instance
  Object.defineProperty(win, "requestAnimationFrame", {
    writable: true,
    value: (callback: FrameRequestCallback) => {
      return setTimeout(() => callback(performance.now()), 16);
    },
  });

  Object.defineProperty(win, "cancelAnimationFrame", {
    writable: true,
    value: (id: number) => {
      clearTimeout(id);
    },
  });

  Object.defineProperty(win, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  Object.defineProperty(win, "scrollTo", {
    writable: true,
    value: () => {},
  });

  Object.defineProperty(win, "scrollY", {
    writable: true,
    value: 0,
  });

  Object.defineProperty(win, "innerWidth", {
    writable: true,
    value: 1024,
  });

  Object.defineProperty(win, "history", {
    writable: true,
    value: {
      pushState: () => {},
      replaceState: () => {},
    },
  });

  return dom;
}

let dom = createDom();
const { window } = dom;

// Attach to globalThis
(globalThis as any).window = window;
(globalThis as any).requestAnimationFrame = window.requestAnimationFrame;
(globalThis as any).cancelAnimationFrame = window.cancelAnimationFrame;
(globalThis as any).document = window.document;
(globalThis as any).navigator = window.navigator;
(globalThis as any).getComputedStyle = window.getComputedStyle.bind(window);
(globalThis as any).HTMLElement = window.HTMLElement;
(globalThis as any).SVGElement = window.SVGElement;
(globalThis as any).Element = window.Element;
(globalThis as any).Node = window.Node;
(globalThis as any).NodeList = window.NodeList;
(globalThis as any).HTMLCollection = window.HTMLCollection;
(globalThis as any).MutationObserver = window.MutationObserver;
(globalThis as any).IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};
(globalThis as any).KeyboardEvent = window.KeyboardEvent;
(globalThis as any).MouseEvent = window.MouseEvent;
(globalThis as any).DOMParser = window.DOMParser;
(globalThis as any).Range = window.Range;
(globalThis as any).getSelection = window.getSelection.bind(window);

// ─── localStorage mock ────────────────────────────────────────────────────

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, val: string) => {
    store[key] = val;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const k of Object.keys(store)) {
      delete store[k];
    }
  },
  get length() {
    return Object.keys(store).length;
  },
  key: (i: number) => Object.keys(store)[i] ?? null,
};

function attachLocalStorage(win: any) {
  Object.defineProperty(win, "localStorage", { value: localStorageMock, configurable: true });
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    configurable: true,
  });
}

attachLocalStorage(window);

// ─── Cleanup between tests ────────────────────────────────────────────────

afterEach(() => {
  testingLibrary.cleanup();
  dom = createDom();
  const newWindow = dom.window;

  // We need to re-apply the mocks here because a new JSDOM instance was created
  // But createDom already does it.

  (globalThis as any).window = newWindow;
  (globalThis as any).document = newWindow.document;
  attachLocalStorage(newWindow);
});

// ─── Silence console noise ────────────────────────────────────────────────

const origError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = String(args[0] ?? "");
    if (
      msg.includes("ReactDOM.render is no longer supported") ||
      msg.includes("Warning:") ||
      msg.includes("not wrapped in act")
    ) {
      return;
    }
    origError(...args);
  };
});

afterAll(() => {
  console.error = origError;
});
