/**
 * Test setup for bun test with testing-library + jsdom
 */

import * as testingLibrary from "@testing-library/react";
import { JSDOM } from "jsdom";
import "@testing-library/jest-dom";

// ─── JSDOM Setup ───────────────────────────────────────────────────────────

function createDom() {
  return new JSDOM("<!DOCTYPE html><html><body><div id='root'></div></body></html>", {
    url: "http://localhost/docs/intro",
    pretendToBeVisual: true,
  });
}

let dom = createDom();
const { window } = dom;

// Attach to globalThis
(globalThis as any).window = window;
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

// ─── window mocks ─────────────────────────────────────────────────────────

Object.defineProperty(window, "matchMedia", {
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

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "scrollY", {
  writable: true,
  value: 0,
});

Object.defineProperty(window, "innerWidth", {
  writable: true,
  value: 1024,
});

Object.defineProperty(window, "history", {
  writable: true,
  value: {
    pushState: () => {},
    replaceState: () => {},
  },
});

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

function attachLocalStorage() {
  Object.defineProperty(window, "localStorage", { value: localStorageMock, configurable: true });
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    configurable: true,
  });
}

attachLocalStorage();

// ─── Cleanup between tests ────────────────────────────────────────────────

afterEach(() => {
  // Unmount any rendered React trees
  testingLibrary.cleanup();

  // Reset JSDOM to fresh state
  dom = createDom();
  (globalThis as any).window = dom.window;
  (globalThis as any).document = dom.window.document;

  // Re-attach mocks to fresh window
  attachLocalStorage();
  Object.defineProperty(dom.window, "matchMedia", {
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
  Object.defineProperty(dom.window, "scrollTo", { writable: true, value: () => {} });
  Object.defineProperty(dom.window, "scrollY", { writable: true, value: 0 });
  Object.defineProperty(dom.window, "innerWidth", { writable: true, value: 1024 });
  Object.defineProperty(dom.window, "history", {
    writable: true,
    value: { pushState: () => {}, replaceState: () => {} },
  });
  Object.defineProperty(dom.window, "localStorage", {
    value: {
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
      length: Object.keys(store).length,
      key: (i: number) => Object.keys(store)[i] ?? null,
    },
  });
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
