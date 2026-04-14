/**
 * Service Container & Service Implementation Tests
 */

import { beforeEach, describe, expect, mock, test } from "bun:test";
import { createAppConfig, createContainer, defaultContainer } from "../src/services/container";
import {
  createMockDom,
  createMockRouter,
  createMockStorage,
  createMockTheme,
  type MockDom,
  type MockRouter,
} from "../src/services/mocks";

// ─── Container ────────────────────────────────────────────────────────────

describe("createContainer", () => {
  test("creates all services by default", () => {
    const c = createContainer();
    expect(c.storage).toBeDefined();
    expect(c.router).toBeDefined();
    expect(c.dom).toBeDefined();
    expect(c.theme).toBeDefined();
    expect(c.config).toBeDefined();
  });

  test("accepts service overrides", () => {
    const m = createMockStorage();
    const c = createContainer({ storage: m });
    expect(c.storage).toBe(m);
  });

  test("accepts config overrides", () => {
    const c = createContainer({
      config: {
        siteTitle: "Custom",
        repoEditUrl: "https://example.com",
        mobileBreakpoint: 600,
        tocBreakpoint: 900,
        routes: { docs: "documentation" },
      },
    });
    expect(c.config.siteTitle).toBe("Custom");
    expect(c.config.mobileBreakpoint).toBe(600);
    expect(c.config.routes.docs).toBe("documentation");
  });

  test("config merges with defaults", () => {
    const c = createContainer({ config: { siteTitle: "Custom" } });
    expect(c.config.siteTitle).toBe("Custom");
    expect(c.config.repoEditUrl).toBe("https://github.com/your-org/your-repo/edit/main");
    expect(c.config.mobileBreakpoint).toBe(800);
  });
});

describe("defaultContainer", () => {
  test("exports a pre-configured container", () => {
    expect(defaultContainer.storage).toBeDefined();
    expect(defaultContainer.router).toBeDefined();
    expect(defaultContainer.dom).toBeDefined();
    expect(defaultContainer.theme).toBeDefined();
    expect(defaultContainer.config).toBeDefined();
  });
});

// ─── Storage (mock) ──────────────────────────────────────────────────────

describe("Storage Service", () => {
  let s: ReturnType<typeof createMockStorage>;
  beforeEach(() => {
    s = createMockStorage();
  });

  test("setItem / getItem", () => {
    s.setItem("k", "v");
    expect(s.getItem("k")).toBe("v");
  });
  test("returns null for missing key", () => {
    expect(s.getItem("missing")).toBeNull();
  });
  test("removeItem", () => {
    s.setItem("k", "v");
    s.removeItem("k");
    expect(s.getItem("k")).toBeNull();
  });
  test("clear", () => {
    s.setItem("a", "1");
    s.setItem("b", "2");
    s.clear();
    expect(s.getItem("a")).toBeNull();
  });
  test("isolated stores", () => {
    const s1 = createMockStorage();
    const s2 = createMockStorage();
    s1.setItem("k", "v");
    expect(s2.getItem("k")).toBeNull();
  });
});

// ─── Router (mock) ───────────────────────────────────────────────────────

describe("Router Service", () => {
  let r: MockRouter;
  beforeEach(() => {
    r = createMockRouter();
  });

  test("initial path is /", () => {
    expect(r.getCurrentPath()).toBe("/");
  });
  test("pushState updates path", () => {
    r.pushState({}, "", "/docs/test");
    expect(r.getCurrentPath()).toBe("/docs/test");
  });
  test("replaceState updates path", () => {
    r.replaceState({}, "", "/replaced");
    expect(r.getCurrentPath()).toBe("/replaced");
  });
  test("buildUrl", () => {
    expect(r.buildUrl("docs", "test/slug")).toBe("/docs/test/slug");
  });
  test("onPopState returns unsubscribe fn", () => {
    const unsub = r.onPopState(() => {});
    expect(unsub).toBeInstanceOf(Function);
  });
  test("callback fires on navigation", () => {
    const cb = mock();
    r.onPopState(cb);
    r._simulateNavigation("/docs/new");
    expect(cb).toHaveBeenCalled();
  });
  test("unsubscribe prevents callback", () => {
    const cb = mock();
    const unsub = r.onPopState(cb);
    unsub();
    r._simulateNavigation("/docs/x");
    expect(cb).not.toHaveBeenCalled();
  });
  test("multiple listeners", () => {
    const a = mock();
    const b = mock();
    r.onPopState(a);
    r.onPopState(b);
    r._simulateNavigation("/x");
    expect(a).toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });
});

// ─── DOM (mock) ───────────────────────────────────────────────────────────

describe("DOM Service", () => {
  let d: MockDom;
  beforeEach(() => {
    d = createMockDom();
  });

  test("viewport default 1024", () => {
    expect(d.getViewportWidth()).toBe(1024);
  });
  test("viewport can be changed", () => {
    d._setViewportWidth(500);
    expect(d.getViewportWidth()).toBe(500);
  });
  test("body overflow tracking", () => {
    d.setBodyOverflow("hidden");
    expect(d._getBodyOverflow()).toBe("hidden");
    d.setBodyOverflow("");
    expect(d._getBodyOverflow()).toBe("");
  });
  test("scrollTo no-op", () => {
    expect(() => d.scrollTo(0, 0)).not.toThrow();
  });
  test("onResize callback fires", () => {
    const cb = mock();
    d.onResize(cb);
    d._simulateResize();
    expect(cb).toHaveBeenCalled();
  });
  test("onKeydown callback fires", () => {
    const cb = mock();
    d.onKeydown(cb);
    d._simulateKeydown("Escape");
    expect(cb).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ key: "Escape" }));
  });
  test("getElementById returns null", () => {
    expect(d.getElementById("root")).toBeNull();
  });
  test("querySelectorAll empty", () => {
    expect(d.querySelectorAll(".x").length).toBe(0);
  });
});

// ─── Theme (mock) ─────────────────────────────────────────────────────────

describe("Theme Service", () => {
  let storage: ReturnType<typeof createMockStorage>;
  let theme: ReturnType<typeof createMockTheme>;
  beforeEach(() => {
    storage = createMockStorage();
    theme = createMockTheme(storage);
  });

  test("default is light", () => {
    expect(theme.getInitialTheme()).toBe(false);
  });
  test("reads dark from storage", () => {
    storage.setItem("theme", "dark");
    expect(theme.getInitialTheme()).toBe(true);
  });
  test("reads light from storage", () => {
    storage.setItem("theme", "light");
    expect(theme.getInitialTheme()).toBe(false);
  });
  test("toggleTheme flips value", () => {
    expect(theme.toggleTheme(false)).toBe(true);
    expect(theme.toggleTheme(true)).toBe(false);
  });
  test("toggleTheme persists", () => {
    theme.toggleTheme(false);
    expect(storage.getItem("theme")).toBe("dark");
  });
  test("applyTheme no-op", () => {
    expect(() => theme.applyTheme(true)).not.toThrow();
  });
});

// ─── App Config ───────────────────────────────────────────────────────────

describe("App Config", () => {
  test("defaults", () => {
    const c = createAppConfig();
    expect(c.siteTitle).toBe("Docs");
    expect(c.repoEditUrl).toBe("https://github.com/your-org/your-repo/edit/main");
    expect(c.mobileBreakpoint).toBe(800);
    expect(c.tocBreakpoint).toBe(1100);
    expect(c.routes.docs).toBe("docs");
  });
  test("overrides merge with defaults", () => {
    const c = createAppConfig({
      siteTitle: "My Docs",
      routes: { docs: "guides" },
    });
    expect(c.siteTitle).toBe("My Docs");
    expect(c.routes.docs).toBe("guides");
    expect(c.mobileBreakpoint).toBe(800);
  });
});

// ─── Service Integration (isolated, no shared state) ─────────────────────

describe("Service Integration", () => {
  test("mock services work together", () => {
    const storage = createMockStorage();
    const theme = createMockTheme(storage);
    theme.toggleTheme(false);
    expect(storage.getItem("theme")).toBe("dark");
    expect(theme.getInitialTheme()).toBe(true);
  });

  test("container services are connected", () => {
    const storage = createMockStorage();
    const container = createContainer({ storage });
    // Theme was created with this same storage reference in createContainer
    container.theme.toggleTheme(false);
    expect(storage.getItem("theme")).toBe("dark");
  });
});
