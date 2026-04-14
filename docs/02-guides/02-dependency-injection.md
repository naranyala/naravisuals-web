---
title: Dependency Injection Container
description: Service architecture, interfaces, and React integration
sidebar_label: DI Container
sidebar_position: 4
---

# Dependency Injection Container

:::note DI Container Purpose
The Dependency Injection (DI) container provides abstraction over browser APIs (storage, router, DOM, theme) making components testable and framework-agnostic.
:::

## Service Interfaces

The DI container defines 5 service interfaces with default implementations:

```mermaid:desc=Class diagram showing the 5 service interfaces (IStorageService, IRouterService, IDomService, IThemeService, IAppConfig) and their relationships with the DI container.
classDiagram
    class DIContainer {
        +storage: IStorageService
        +router: IRouterService
        +dom: IDomService
        +theme: IThemeService
        +config: IAppConfig
        +get(name) Service
    }
    
    class IStorageService {
        <<interface>>
        +getItem(key) string
        +setItem(key, value) void
        +removeItem(key) void
    }
    
    class IRouterService {
        <<interface>>
        +pushState(url) void
        +onNavigate(callback) void
        +getCurrentPath() string
    }
    
    class IDomService {
        <<interface>>
        +scrollToTop() void
        +onResize(callback) void
        +onKeydown(callback) void
    }
    
    class IThemeService {
        <<interface>>
        +getInitialTheme() boolean
        +applyTheme(isDark) void
        +toggleTheme() void
    }
    
    class IAppConfig {
        <<interface>>
        +siteTitle: string
        +editLinkRepo: string
        +breakpoints: object
    }
    
    DIContainer --> IStorageService
    DIContainer --> IRouterService
    DIContainer --> IDomService
    DIContainer --> IThemeService
    DIContainer --> IAppConfig
    IThemeService ..> IStorageService : depends on
```

| Service | Interface | Default Implementation | Purpose |
|---------|-----------|----------------------|---------|
| **Storage** | `IStorageService` | `createStorageService()` | Wraps `localStorage` with SSR safety and error handling |
| **Router** | `IRouterService` | `createRouterService()` | Wraps History API (`pushState`, `popstate`, URL building) |
| **DOM** | `IDomService` | `createDomService()` | Wraps DOM APIs (scroll, viewport, resize, keydown, body overflow) |
| **Theme** | `IThemeService` | `createThemeService(storage)` | Theme persistence + toggle + `data-theme` attribute management |
| **Config** | `IAppConfig` | `createAppConfig()` | Site title, repo edit URL, breakpoints, route prefixes |

## Container Builder

```typescript:desc=DI container creation using the createContainer factory. Shows how to override default services like storage and config, plus exports the pre-configured default container instance.
// Create container with optional overrides
const container = createContainer({
  storage: customStorageService,
  config: { siteTitle: 'My Docs' }
});

// Default pre-configured instance
export const defaultContainer = createContainer();
```

## React Integration

### ServicesProvider

```mermaid:desc=Sequence diagram showing the DI lookup path: Component mounts, calls useServices(), receives container from ServicesProvider context, then calls services.storage.getItem() which returns the value.
sequenceDiagram
    participant C as Component
    participant Hook as useServices()
    participant Context as ServicesProvider
    participant Container as DIContainer
    participant Storage as StorageService
    
    C->>Hook: Call useServices()
    Hook->>Context: Read from ServicesContext
    Context-->>Hook: Return DIContainer
    Hook-->>C: Return services object
    
    C->>Storage: services.storage.getItem('key')
    Storage->>Storage: Access localStorage
    Storage-->>C: Return value
    
    Note over C,Storage: "All service calls\ngo through DI container"
```

```typescript:desc=React context provider that injects the DI container into the component tree. Shows both direct container passing and inline options configuration with custom site title.
<ServicesProvider container={defaultContainer}>
  <App />
</ServicesProvider>

// Or with options
<ServicesProvider options={{ config: { siteTitle: 'Custom' } }}>
  <App />
</ServicesProvider>
```

### Hooks

```typescript:desc=Dependency injection hooks for accessing services in React components. useServices returns the full container, while useService retrieves a specific service by name like storage or theme.
// Get full container
const services = useServices();
services.storage.getItem('key');
services.router.pushState('/docs/guides/build-system');

// Get specific service
const storage = useService('storage');
const theme = useService('theme');
```

## Mock Services

Mock implementations for testing with helper methods:

```mermaid:desc=Flowchart showing the relationship between real service implementations and their mock counterparts used in testing. Each mock simulates specific behavior without touching real browser APIs.
flowchart LR
    subgraph RealServices["Real Services"]
        R1["StorageService\nlocalStorage"]
        R2["RouterService\nHistory API"]
        R3["DomService\nDOM APIs"]
    end

    subgraph MockServices["Mock Services"]
        M1["MockStorage\nMap-based"]
        M2["MockRouter\n_simulateNavigation"]
        M3["MockDom\n_simulateResize"]
    end

    Tests[Test Suite]

    Tests -.-> M1
    Tests -.-> M2
    Tests -.-> M3

    M1 -.-> R1
    M2 -.-> R2
    M3 -.-> R3

    style RealServices fill:#fff4e1
    style MockServices fill:#e1f5ff
    style Tests fill:#e8f5e9

    linkStyle 3,4,5 stroke:#999,stroke-dasharray:5,5
```

```typescript:desc=Mock service helpers for unit testing. Simulates router navigation, DOM events, viewport changes, and provides isolated storage and theme implementations that don't touch real browser APIs.
// Mock Router
router._simulateNavigation('/docs/guides/build-system');  // fires popstate listeners

// Mock DOM
dom._simulateResize();                      // fires resize listeners
dom._simulateKeydown('k');                  // fires keydown listeners
dom._setViewportWidth(764);                 // change viewport

// Mock Storage
const storage = createMockStorage();        // Map-based, no real localStorage

// Mock Theme
const theme = createMockTheme(storage);     // Storage-backed, no-op applyTheme
```

## Service Interfaces Detail

### IStorageService

```typescript:desc=Storage service interface for persistent state management. Provides CRUD operations for string key-value pairs, used by theme and config services to persist user preferences.
interface IStorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}
```

### IRouterService

```typescript:desc=Client-side routing service for SPA navigation. Tracks current path, supports push/replace state for browser history, builds URLs with prefix and slug, and subscribes to popstate events.
interface IRouterService {
  path: string;
  pushState(path: string): void;
  replaceState(path: string): void;
  buildUrl(prefix: string, slug: string): string;
  onPopState(callback: () => void): () => void;  // returns unsubscribe fn
}
```

### IDomService

```typescript:desc=DOM abstraction layer providing cross-browser utilities. Handles scroll tracking, attribute manipulation, element queries, overflow control, viewport detection, and event listener management for resize and keyboard events.
interface IDomService {
  getScrollY(): number;
  scrollTo(x: number, y: number): void;
  setAttribute(el: HTMLElement, attr: string, value: string): void;
  getAttribute(el: HTMLElement, attr: string): string | null;
  querySelectorAll(selector: string): NodeList;
  getElementById(id: string): HTMLElement | null;
  setBodyOverflow(value: string): void;
  getViewportWidth(): number;
  onResize(callback: () => void): () => void;
  onKeydown(callback: (e: KeyboardEvent) => void): () => void;
}
```

### IThemeService

```typescript:desc=Theme management service for dark/light mode toggling. Determines initial theme from storage preferences, applies theme class to DOM, and toggles between states with automatic persistence.
interface IThemeService {
  getInitialTheme(): boolean;  // true = dark
  applyTheme(isDark: boolean): void;
  toggleTheme(current: boolean): boolean;
}
```

### IAppConfig

```typescript:desc=Application configuration interface defining site-wide settings. Includes site title, repository edit URL for documentation contributions, mobile breakpoints for responsive sidebar/TOC, and route prefixes for URL generation.
interface IAppConfig {
  siteTitle: string;
  repoEditUrl?: string;
  mobileBreakpoint: number;
  tocMobileBreakpoint: number;
  routes: {
    docs: string;
  };
}
```
