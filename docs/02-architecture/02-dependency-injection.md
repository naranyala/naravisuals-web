---
title: Dependency Injection
description: How the service container wraps browser APIs for testability and flexibility
sidebar_label: Dependency Injection
sidebar_position: 2
tags: [architecture, DI, services]
---

# Dependency Injection

rspack-react-docs uses a lightweight dependency injection pattern to wrap browser APIs. This makes the codebase testable, mockable, and flexible.

## Why DI in a Frontend App?

Direct use of browser APIs creates tight coupling:

```typescript:desc=Tightly coupled - hard to test because it directly calls window.localStorage
function saveTheme(theme: string) {
  localStorage.setItem("theme", theme);
}
```

With DI, the dependency is injected:

```typescript:desc=Loosely coupled - storage can be swapped for testing.
function saveTheme(storage: IStorageService, theme: string) {
  storage.setItem("theme", theme);
}
```

## Service Interfaces

Five services cover all browser API needs:

```mermaid:desc=Class diagram showing the five service interfaces and their methods.
classDiagram
    class IStorageService {
        +getItem(key: string) string
        +setItem(key: string, value: string) void
        +removeItem(key: string) void
        +clear() void
    }

    class IRouterService {
        +getCurrentPath() string
        +pushState(state, title, url) void
        +replaceState(state, title, url) void
        +onPopState(callback) void
        +buildUrl(prefix, slug) string
    }

    class IDomService {
        +getScrollY() number
        +scrollTo(x, y) void
        +setAttribute(el, name, value) void
        +querySelectorAll(selectors) NodeList
        +getViewportWidth() number
        +onResize(callback) void
        +onKeydown(callback) void
        +setBodyOverflow(value) void
    }

    class IThemeService {
        +getInitialTheme() boolean
        +applyTheme(isDark: boolean) void
        +toggleTheme(current: boolean) boolean
        +getMermaidLoading() boolean
        +setMermaidLoading(loading: boolean) void
        +onMermaidLoadingChange(callback) void
    }

    class IAppConfig {
        +siteTitle: string
        +repoEditUrl: string
        +mobileBreakpoint: number
        +tocBreakpoint: number
        +routes: string
    }

    class IEventBusService {
        +emit(type, event) void
        +on(type, handler) void
        +off(type, handler) void
    }

    class ServiceContainer {
        +storage: IStorageService
        +router: IRouterService
        +dom: IDomService
        +theme: IThemeService
        +config: IAppConfig
        +events: IEventBusService
    }

    ServiceContainer --> IStorageService
    ServiceContainer --> IRouterService
    ServiceContainer --> IDomService
    ServiceContainer --> IThemeService
    ServiceContainer --> IAppConfig
    ServiceContainer --> IEventBusService
```

### IStorageService

Wraps `localStorage` with safety checks for SSR and private browsing:

```typescript:desc=Default storage service implementation.
export const createStorageService = (): IStorageService => ({
  getItem: (key) => {
    if (typeof window === "undefined") return null;
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem: (key, value) => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(key, value); } catch {}
  },
  // ...
});
```

### IRouterService

Wraps the History API for SPA routing:

```typescript:desc=Default router service using window.history.
export const createRouterService = (): IRouterService => ({
  getCurrentPath: () => window.location.pathname,
  pushState: (state, title, url) => window.history.pushState(state, title, url),
  onPopState: (callback) => {
    window.addEventListener("popstate", callback);
    return () => window.removeEventListener("popstate", callback);
  },
  buildUrl: (prefix, slug) => `/${prefix}/${slug}`,
});
```

### IDomService

Wraps DOM APIs for viewport, scroll, keyboard, and resize events:

```typescript:desc=Default DOM service wrapping window/document APIs.
export const createDomService = (): IDomService => ({
  getScrollY: () => window.scrollY,
  getViewportWidth: () => window.innerWidth,
  onResize: (callback) => {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
  },
  onKeydown: (callback) => {
    window.addEventListener("keydown", callback);
    return () => window.removeEventListener("keydown", callback);
  },
  setBodyOverflow: (value) => { document.body.style.overflow = value; },
  // ...
});
```

### IThemeService

Manages theme state and utilizes the event bus for status updates:

```typescript:desc=Theme service refactored to use the central event bus.
export const createThemeService = (storage, events): IThemeService => {
  return {
    // ...
    setMermaidLoading: (loading) => {
      mermaidLoading = loading;
      events.emit("mermaid:loading", loading);
    },
    onMermaidLoadingChange: (callback) => {
      return events.on("mermaid:loading", callback);
    },
  };
};
```

### IEventBusService

A central communication channel powered by `mitt`. It decouples UI components from document lifecycle events:

```typescript:desc=Event bus service interface and typed events.
export type AppEvents = {
  "nav:navigate": { target: string };
  "theme:change": { theme: string; isDark: boolean };
  "mermaid:loading": boolean;
  "mermaid:rendered": { slug: string; count: number };
};

export interface IEventBusService {
  emit<K extends keyof AppEvents>(type: K, event: AppEvents[K]): void;
  on<K extends keyof AppEvents>(type: K, handler: (event: AppEvents[K]) => void): () => void;
}
```

### IAppConfig

Simple configuration object with sensible defaults:

```typescript:desc=Default app configuration.
export const createAppConfig = (overrides?): IAppConfig => ({
  siteTitle: "Docs",
  repoEditUrl: "https://github.com/your-org/your-repo/edit/main",
  mobileBreakpoint: 800,
  tocBreakpoint: 1100,
  routes: { docs: "docs" },
  ...overrides,
});
```

## Container Builder

The `createContainer()` factory builds a `ServiceContainer` with all default services:

```typescript:desc=Container builder with dependency wiring.
export function createContainer(options = {}): ServiceContainer {
  const storage = options.storage ?? createStorageService();
  const router = options.router ?? createRouterService();
  const dom = options.dom ?? createDomService();
  const events = options.events ?? createEventBusService();
  const theme = options.theme ?? createThemeService(storage, events);
  const config = createAppConfig(options.config);
  return { storage, router, dom, theme, config, events };
}

export const defaultContainer = createContainer();
```

## React Integration

### ServicesProvider

A React context provider wraps the app tree:

```tsx:desc=ServicesProvider wraps the app in a React context.
<ServicesProvider container={defaultContainer}>
  <App />
</ServicesProvider>
```

### useServices Hook

Components access services via hook:

```tsx:desc=Hook for accessing services in React components.
function App() {
  const services = useServices();
  const currentSlug = services.router.getCurrentPath();
  // ...
}
```

## Testing with Mock Services

Swap real services for mocks in tests:

```typescript:desc=Creating a container with mock services for testing.
const mockStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const testContainer = createContainer({
  storage: mockStorage,
  router: mockRouter,
  dom: mockDom,
});
```

This pattern is used throughout the test suite in `tests/`.
