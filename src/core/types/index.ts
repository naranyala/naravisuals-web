/**
 * Core type definitions
 *
 * These are the essential types used throughout the application.
 * Organized by domain/feature.
 */

// ─── Document Types ───────────────────────────────────────────────────────

export interface DocEntry {
  id: string;
  slug: string;
  title: string;
  sidebar_label: string;
  sidebar_position: number;
  category: string;
  description: string;
  content: string;
  toc: { value: string; id: string; level: number }[];
  date?: string;
  author?: string;
  tags?: string[];
  section: "docs" | "blog";
  /** Arbitrary frontmatter fields beyond the known schema. */
  metadata: Record<string, string | string[]>;
  /** Raw marked.js token array for AST debugging */
  ast?: any[];
}

export interface TableOfContentsEntry {
  value: string;
  id: string;
  level: number;
}

// ─── Navigation Types ─────────────────────────────────────────────────────

export type SidebarDocItem = {
  type: "doc";
  id: string;
  label: string;
  slug: string;
  category?: string;
  date?: string;
};

export type SidebarCategoryItem = {
  type: "category";
  label: string;
  items: SidebarItem[];
  collapsed?: boolean;
};

export type SidebarItem = SidebarDocItem | SidebarCategoryItem;

// ─── Theme Types ──────────────────────────────────────────────────────────

export interface ThemeOption {
  id: string;
  label: string;
  bg: string;
  accent: string;
}

export interface FontOption {
  id: string;
  label: string;
  css: string;
}

export interface ShikiThemeConfig {
  light: string;
  dark: string;
}

// ─── UI State Types ───────────────────────────────────────────────────────

export interface DocViewerState {
  currentDoc: DocEntry | null;
  sidebarVisible: boolean;
  tocVisible: boolean;
  mermaidLoading: boolean;
  isMobile: boolean;
  isTocMobileBreakpoint: boolean;
}

export interface EditorState {
  selectedTheme: string;
  selectedFont: string;
  isDarkMode: boolean;
}

// ─── Utility Types ────────────────────────────────────────────────────────

export type Unsubscribe = () => void;

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

// ─── Service Types ────────────────────────────────────────────────────────

export interface IStorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export interface IRouterService {
  getCurrentPath(): string;
  pushState(state: unknown, title: string, url: string): void;
  replaceState(state: unknown, title: string, url: string): void;
  onPopState(callback: () => void): Unsubscribe;
  buildUrl(prefix: string, slug: string): string;
}

export interface IDomService {
  getScrollY(): number;
  scrollTo(x: number, y: number): void;
  setAttribute(element: Element, name: string, value: string): void;
  getAttribute(element: Element, name: string): string | null;
  querySelectorAll(selectors: string): NodeList;
  getElementById(id: string): HTMLElement | null;
  setBodyOverflow(value: string): void;
  getViewportWidth(): number;
  onResize(callback: () => void): Unsubscribe;
  onKeydown(callback: (e: KeyboardEvent) => void): Unsubscribe;
}

export interface IThemeService {
  getInitialTheme(): boolean;
  applyTheme(isDark: boolean): void;
  toggleTheme(current: boolean): boolean;
  getMermaidLoading(): boolean;
  setMermaidLoading(loading: boolean): void;
  onMermaidLoadingChange(callback: (loading: boolean) => void): Unsubscribe;
}

export interface IAppConfig {
  siteTitle: string;
  repoEditUrl: string;
  mobileBreakpoint: number;
  tocBreakpoint: number;
  routes: {
    docs: string;
  };
}

export interface ServiceContainer {
  storage: IStorageService;
  router: IRouterService;
  dom: IDomService;
  theme: IThemeService;
  config: IAppConfig;
}

// ─── API Types ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  timestamp: number;
}

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogUrl?: string;
}
