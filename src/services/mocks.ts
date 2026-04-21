/**
 * Mock Services for Testing and SSR
 *
 * Provides in-memory implementations that don't depend on browser APIs.
 * Useful for unit tests, server-side rendering, or custom environments.
 */

import type { IDomService, IRouterService, IStorageService, IThemeService } from "./container";
import { createEventBusService, type IEventBusService } from "./event-bus";

// ─── Mock Types ───────────────────────────────────────────────────────────

export type MockRouter = IRouterService & {
  _simulateNavigation: (path: string) => void;
};

export type MockDom = IDomService & {
  _setViewportWidth: (width: number) => void;
  _simulateResize: () => void;
  _simulateKeydown: (key: string) => void;
  _getBodyOverflow: () => string;
};

// ─── Mock Storage ─────────────────────────────────────────────────────────

export const createMockStorage = (): IStorageService => {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
};

// ─── Mock Router ──────────────────────────────────────────────────────────

export const createMockRouter = (): MockRouter => {
  let currentPath = "/";
  const popStateListeners: (() => void)[] = [];

  return {
    getCurrentPath: () => currentPath,
    pushState: (_state: unknown, _title: string, url: string) => {
      currentPath = url;
    },
    replaceState: (_state: unknown, _title: string, url: string) => {
      currentPath = url;
    },
    onPopState: (callback: () => void) => {
      popStateListeners.push(callback);
      return () => {
        const idx = popStateListeners.indexOf(callback);
        if (idx !== -1) popStateListeners.splice(idx, 1);
      };
    },
    buildUrl: (prefix: string, slug: string) => `/${prefix}/${slug}`,
    // Test helper: simulate browser navigation
    _simulateNavigation: (path: string) => {
      currentPath = path;
      for (const cb of popStateListeners) {
        cb();
      }
    },
  };
};

// ─── Mock DOM ─────────────────────────────────────────────────────────────

export const createMockDom = (): MockDom => {
  let bodyOverflow = "";
  let viewportWidth = 1024;
  const resizeListeners: (() => void)[] = [];
  const keydownListeners: ((e: KeyboardEvent) => void)[] = [];

  return {
    getScrollY: () => 0,
    scrollTo: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    querySelectorAll: () => ({ length: 0 }) as NodeList,
    getElementById: () => null,
    setBodyOverflow: (value: string) => {
      bodyOverflow = value;
    },
    getViewportWidth: () => viewportWidth,
    onResize: (callback: () => void) => {
      resizeListeners.push(callback);
      return () => {
        const idx = resizeListeners.indexOf(callback);
        if (idx !== -1) resizeListeners.splice(idx, 1);
      };
    },
    onKeydown: (callback: (e: KeyboardEvent) => void) => {
      keydownListeners.push(callback);
      return () => {
        const idx = keydownListeners.indexOf(callback);
        if (idx !== -1) keydownListeners.splice(idx, 1);
      };
    },
    // Test helpers
    _setViewportWidth: (width: number) => {
      viewportWidth = width;
    },
    _simulateResize: () => {
      for (const cb of resizeListeners) {
        cb();
      }
    },
    _simulateKeydown: (key: string) => {
      const event = new KeyboardEvent("keydown", { key });
      for (const cb of keydownListeners) {
        cb(event);
      }
    },
    _getBodyOverflow: () => bodyOverflow,
  };
};

// ─── Mock Theme ───────────────────────────────────────────────────────────

export const createMockTheme = (
  storage: IStorageService,
  events: IEventBusService = createEventBusService()
): IThemeService => {
  let mermaidLoading = false;
  return {
    getInitialTheme: () => {
      return storage.getItem("theme") === "dark";
    },
    applyTheme: () => {},
    toggleTheme: (current: boolean) => {
      const next = !current;
      storage.setItem("theme", next ? "dark" : "light");
      events.emit("theme:change", { theme: next ? "dark" : "light", isDark: next });
      return next;
    },
    getMermaidLoading: () => mermaidLoading,
    setMermaidLoading: (loading: boolean) => {
      mermaidLoading = loading;
      events.emit("mermaid:loading", loading);
    },
    onMermaidLoadingChange: (callback: (loading: boolean) => void) => {
      events.on("mermaid:loading", callback);
      return () => events.off("mermaid:loading", callback);
    },
  };
};
