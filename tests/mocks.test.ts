/**
 * Mock Services Tests
 */

import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  createMockDom,
  createMockRouter,
  createMockStorage,
  createMockTheme,
  type MockDom,
  type MockRouter,
} from "../src/services/mocks";

describe("Mock Storage", () => {
  let s: ReturnType<typeof createMockStorage>;
  beforeEach(() => {
    s = createMockStorage();
  });

  test("stores and retrieves", () => {
    s.setItem("name", "John");
    expect(s.getItem("name")).toBe("John");
  });
  test("multiple keys", () => {
    s.setItem("a", "1");
    s.setItem("b", "2");
    expect(s.getItem("a")).toBe("1");
    expect(s.getItem("b")).toBe("2");
  });
  test("overwrites", () => {
    s.setItem("k", "old");
    s.setItem("k", "new");
    expect(s.getItem("k")).toBe("new");
  });
});

describe("Mock Router", () => {
  let r: MockRouter;
  beforeEach(() => {
    r = createMockRouter();
  });

  test("tracks path", () => {
    expect(r.getCurrentPath()).toBe("/");
    r.pushState({}, "", "/docs/x");
    expect(r.getCurrentPath()).toBe("/docs/x");
  });
  test("simulateNavigation updates path", () => {
    r._simulateNavigation("/docs/nav");
    expect(r.getCurrentPath()).toBe("/docs/nav");
  });
  test("fire listeners on navigation", () => {
    const cb1 = mock();
    const cb2 = mock();
    r.onPopState(cb1);
    r.onPopState(cb2);
    r._simulateNavigation("/new");
    expect(cb1).toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
  });
  test("unsubscribe removes only that listener", () => {
    const a = mock();
    const b = mock();
    const unsubA = r.onPopState(a);
    r.onPopState(b);
    unsubA();
    r._simulateNavigation("/x");
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });
});

describe("Mock DOM", () => {
  let d: MockDom;
  beforeEach(() => {
    d = createMockDom();
  });

  test("viewport default 1024", () => {
    expect(d.getViewportWidth()).toBe(1024);
  });
  test("set viewport width", () => {
    d._setViewportWidth(500);
    expect(d.getViewportWidth()).toBe(500);
  });
  test("overflow tracking", () => {
    d.setBodyOverflow("hidden");
    expect(d._getBodyOverflow()).toBe("hidden");
  });
  test("simulate resize fires callback", () => {
    const cb = mock();
    d.onResize(cb);
    d._simulateResize();
    expect(cb).toHaveBeenCalled();
  });
  test("simulate keydown passes event", () => {
    const cb = mock();
    d.onKeydown(cb);
    d._simulateKeydown("Enter");
    expect(cb).toHaveBeenCalled();
  });
});

describe("Mock Theme", () => {
  let storage: ReturnType<typeof createMockStorage>;
  let theme: ReturnType<typeof createMockTheme>;
  beforeEach(() => {
    storage = createMockStorage();
    theme = createMockTheme(storage);
  });

  test("persists on toggle", () => {
    theme.toggleTheme(false);
    expect(storage.getItem("theme")).toBe("dark");
  });
  test("reads storage state", () => {
    storage.setItem("theme", "dark");
    expect(theme.getInitialTheme()).toBe(true);
  });
});
