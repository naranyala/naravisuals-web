/**
 * Dependency Injection Container
 *
 * Provides a typed service container for browser APIs.
 * Services can be swapped for testing, SSR, or different implementations.
 */

import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Err, Ok, type Result } from "better-result";
import type { SidebarCategoryItem, SidebarItem } from "@/generated";
import { type AppConfig, AppConfigSchema } from "../shared/schemas";
import { createEventBusService, type IEventBusService } from "./event-bus";

// ─── Service Interfaces ───────────────────────────────────────────────────

/**
 * Sidebar Navigation Service - manages the drill-down state
 */
export interface ISidebarService {
  getCurrentPath(): readonly SidebarCategoryItem[];
  pushCategory(category: SidebarCategoryItem): void;
  popCategory(): void;
  setPath(path: readonly SidebarCategoryItem[]): void;
  resolvePathForSlug(
    sidebar: readonly SidebarItem[],
    slug: string
  ): Result<SidebarCategoryItem[], Error>;
  onPathChange(callback: (path: readonly SidebarCategoryItem[]) => void): () => void;
}

/**
 * App configuration (Derived from TypeBox Schema)
 */
export type IAppConfig = AppConfig;

const configValidator = TypeCompiler.Compile(AppConfigSchema);

/**
 * Storage service - wraps localStorage/sessionStorage
 */
export interface IStorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * Router service - wraps History API and URL management
 */
export interface IRouterService {
  getCurrentPath(): string;
  pushState(state: unknown, title: string, url: string): void;
  replaceState(state: unknown, title: string, url: string): void;
  onPopState(callback: () => void): () => void; // returns unsubscribe fn
  buildUrl(prefix: string, slug: string): string;
}

/**
 * DOM service - wraps DOM manipulation APIs
 */
export interface IDomService {
  getScrollY(): number;
  scrollTo(x: number, y: number): void;
  setAttribute(element: Element, name: string, value: string): void;
  getAttribute(element: Element, name: string): string | null;
  querySelectorAll(selectors: string): NodeList;
  getElementById(id: string): HTMLElement | null;
  setBodyOverflow(value: string): void;
  getViewportWidth(): number;
  onResize(callback: () => void): () => void;
  onKeydown(callback: (e: KeyboardEvent) => void): () => void;
}

/**
 * Theme service - manages theme state and persistence
 */
export interface IThemeService {
  getInitialTheme(): boolean; // true = dark
  applyTheme(isDark: boolean): void;
  toggleTheme(current: boolean): boolean;
  getMermaidLoading(): boolean;
  setMermaidLoading(loading: boolean): void;
  onMermaidLoadingChange(callback: (loading: boolean) => void): () => void;
}

// ─── Service Container ────────────────────────────────────────────────────

export interface ServiceContainer {
  storage: IStorageService;
  router: IRouterService;
  dom: IDomService;
  theme: IThemeService;
  sidebar: ISidebarService;
  config: IAppConfig;
  events: IEventBusService;
}

// ─── Default Implementations ──────────────────────────────────────────────

/**
 * Default localStorage-based storage
 */
export const createStorageService = (): IStorageService => ({
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail (e.g., private browsing)
    }
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch {}
  },
  clear: () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.clear();
    } catch {}
  },
});

/**
 * Default History API-based router
 */
export const createRouterService = (): IRouterService => ({
  getCurrentPath: () => {
    if (typeof window === "undefined") return "/";
    return window.location.pathname;
  },
  pushState: (state: unknown, title: string, url: string) => {
    if (typeof window === "undefined") return;
    window.history.pushState(state, title, url);
  },
  replaceState: (state: unknown, title: string, url: string) => {
    if (typeof window === "undefined") return;
    window.history.replaceState(state, title, url);
  },
  onPopState: (callback: () => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("popstate", callback);
    return () => window.removeEventListener("popstate", callback);
  },
  buildUrl: (prefix: string, slug: string) => {
    return `/${prefix}/${slug}`;
  },
});

/**
 * Default DOM service
 */
export const createDomService = (): IDomService => ({
  getScrollY: () => (typeof window === "undefined" ? 0 : window.scrollY),
  scrollTo: (x: number, y: number) => {
    if (typeof window === "undefined") return;
    window.scrollTo(x, y);
  },
  setAttribute: (element: Element, name: string, value: string) => {
    element.setAttribute(name, value);
  },
  getAttribute: (element: Element, name: string) => {
    return element.getAttribute(name);
  },
  querySelectorAll: (selectors: string) => {
    if (typeof document === "undefined") return [] as unknown as NodeList;
    return document.querySelectorAll(selectors);
  },
  getElementById: (id: string) => {
    if (typeof document === "undefined") return null;
    return document.getElementById(id);
  },
  setBodyOverflow: (value: string) => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = value;
  },
  getViewportWidth: () => (typeof window === "undefined" ? 1024 : window.innerWidth),
  onResize: (callback: () => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
  },
  onKeydown: (callback: (e: KeyboardEvent) => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("keydown", callback);
    return () => window.removeEventListener("keydown", callback);
  },
});

/**
 * Default sidebar navigation service
 */
export const createSidebarService = (events: IEventBusService): ISidebarService => {
  let path: readonly SidebarCategoryItem[] = [];

  const findPathToSlug = (
    items: readonly SidebarItem[],
    slug: string,
    currentPath: SidebarCategoryItem[] = []
  ): Result<SidebarCategoryItem[], Error> => {
    for (const item of items) {
      if (item.type === "doc") {
        if (item.slug === slug || item.id === slug) {
          return new Ok(currentPath);
        }
      } else if (item.type === "category") {
        const result = findPathToSlug(item.items, slug, [...currentPath, item]);
        if (result.isOk()) return result;
      }
    }
    return new Err(new Error(`Slug ${slug} not found in sidebar`));
  };

  return {
    getCurrentPath: () => path,
    pushCategory: (category) => {
      path = [...path, category];
      events.emit("ui:sidebar:pathChanged", { path });
    },
    popCategory: () => {
      path = path.slice(0, -1);
      events.emit("ui:sidebar:pathChanged", { path });
    },
    setPath: (newPath) => {
      path = newPath;
      events.emit("ui:sidebar:pathChanged", { path });
    },
    resolvePathForSlug: (sidebar, slug) => findPathToSlug(sidebar, slug),
    onPathChange: (callback) => {
      events.on("ui:sidebar:pathChanged", ({ path }) => callback(path));
      return () => events.off("ui:sidebar:pathChanged", (e: any) => callback(e.path));
    },
  };
};
/**
 * Default theme service
 */
export const createThemeService = (
  storage: IStorageService,
  events: IEventBusService
): IThemeService => {
  let mermaidLoading = false;

  return {
    getInitialTheme: () => {
      const stored = storage.getItem("theme");
      if (stored !== null) return stored === "dark";
      if (typeof window === "undefined") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    },
    applyTheme: (isDark: boolean) => {
      if (typeof document === "undefined") return;
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    },
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

/**
 * Default app config
 */
export const createAppConfig = (overrides?: Partial<IAppConfig>): IAppConfig => {
  const config = {
    siteTitle: (process.env.PROJECT_NAME as string) || "",
    siteUrl: (process.env.SITE_URL as string) || "http://localhost:3000",

    repoEditUrl: "https://github.com/your-org/your-repo/edit/main",
    mobileBreakpoint: 800,
    tocBreakpoint: 1100,
    routes: {
      docs: "docs",
    },
    ...overrides,
  };

  // Runtime validation of configuration
  if (!configValidator.Check(config)) {
    const errors = [...configValidator.Errors(config)];
    console.warn("App configuration validation failed:", errors);
  }

  return config;
};

// ─── Container Builder ────────────────────────────────────────────────────

export interface ContainerOptions {
  config?: Partial<IAppConfig>;
  storage?: IStorageService;
  router?: IRouterService;
  dom?: IDomService;
  theme?: IThemeService;
  sidebar?: ISidebarService;
  events?: IEventBusService;
}

/**
 * Build a service container with optional overrides
 */
export function createContainer(options: ContainerOptions = {}): ServiceContainer {
  const storage = options.storage ?? createStorageService();
  const router = options.router ?? createRouterService();
  const dom = options.dom ?? createDomService();
  const events = options.events ?? createEventBusService();
  const theme = options.theme ?? createThemeService(storage, events);
  const sidebar = options.sidebar ?? createSidebarService(events);
  const config = createAppConfig(options.config);

  return { storage, router, dom, theme, sidebar, config, events };
}

/**
 * Default container instance
 */
export const defaultContainer = createContainer();
