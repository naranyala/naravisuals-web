/**
 * Core application constants
 *
 * Central place for configuration values, theme definitions, and other constants.
 */

import type { FontOption, ThemeOption } from "../types";

// ─── Theme Configuration ──────────────────────────────────────────────────

export const AVAILABLE_THEMES: ThemeOption[] = [
  { id: "catppuccin", label: "Catppuccin", bg: "#24273a", accent: "#8aadf4" },
  { id: "nord", label: "Nord", bg: "#2e3440", accent: "#88c0d0" },
  { id: "solarized-light", label: "Solarized Light", bg: "#fdf6e3", accent: "#268bd2" },
];

export const AVAILABLE_FONTS: FontOption[] = [
  { id: "inter", label: "Modern Sans", css: '"Inter", system-ui, -apple-system, sans-serif' },
  {
    id: "mono",
    label: "Technical",
    css: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
  },
  {
    id: "system",
    label: "System UI",
    css: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
];

export const AVAILABLE_CODE_FONT_SIZES = [
  { id: "small", label: "Small", css: "0.75rem" },
  { id: "medium", label: "Medium", css: "0.85rem" },
  { id: "big", label: "Big", css: "1rem" },
];

export const DEFAULT_THEME = "nord";
export const DEFAULT_FONT = "inter";

// ─── Storage Keys ─────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  THEME: "theme",
  FONT: "font",
  FONT_SIZE: "font-size",
  SHIKI_CODE_THEME: "shiki-code-theme",
  READING_PROGRESS: "reading-progress",
  SIDEBAR_VISIBLE: "sidebar-visible",
  TOC_VISIBLE: "toc-visible",
} as const;

// ─── Mermaid Configuration ────────────────────────────────────────────────

export const MERMAID_CONFIG = {
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    primaryColor: "#363a4f",
    primaryTextColor: "#cad3f5",
    primaryBorderColor: "#8aadf4",
    lineColor: "#b8c0e0",
    secondaryColor: "#363a4f",
    tertiaryColor: "#363a4f",
    background: "#24273a",
    mainBkg: "#24273a",
    nodeBorder: "#494d64",
    clusterBkg: "#1e2030",
    clusterBorder: "#494d64",
    titleColor: "#cad3f5",
    edgeLabelBackground: "#24273a",
  },
  securityLevel: "loose",
  fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
};

// ─── Keyboard Shortcuts ───────────────────────────────────────────────────

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_SIDEBAR: { key: "b", ctrlKey: true, altKey: false },
  TOGGLE_TOC: { key: "t", ctrlKey: true, altKey: false },
  TOGGLE_DARK_MODE: { key: "d", ctrlKey: true, altKey: false },
  SEARCH: { key: "k", ctrlKey: true, altKey: false },
} as const;

// ─── Breakpoints ──────────────────────────────────────────────────────────

export const BREAKPOINTS = {
  MOBILE: 800,
  TABLET: 1024,
  DESKTOP: 1200,
  TOC: 1100,
} as const;

// ─── Animation Durations ──────────────────────────────────────────────────

export const DURATIONS = {
  IMMEDIATE: 0,
  FAST: 100,
  NORMAL: 200,
  SLOW: 300,
  VERY_SLOW: 500,
} as const;

// ─── Regular Expressions ──────────────────────────────────────────────────

export const PATTERNS = {
  MARKDOWN_LINK: /\[([^\]]+)\]\(([^)]+)\)/g,
  CODE_BLOCK: /```([^\n]*)\n([\s\S]*?)```/g,
  HEADING: /^#+\s+(.+)$/gm,
  FRONTMATTER: /^---\n([\s\S]*?)\n---/,
} as const;

// ─── API Endpoints ────────────────────────────────────────────────────────

export const API_ENDPOINTS = {
  DOCS: "/api/docs",
  SIDEBAR: "/api/sidebar",
  SEARCH: "/api/search",
  METADATA: "/api/metadata",
} as const;

// ─── Environment ──────────────────────────────────────────────────────────

export const APP_ENV = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isBrowser: typeof window !== "undefined",
  isSSR: typeof window === "undefined",
} as const;

// ─── Limits ───────────────────────────────────────────────────────────────

export const LIMITS = {
  MAX_SEARCH_RESULTS: 50,
  MAX_RECENT_DOCS: 10,
  MAX_SIDEBAR_DEPTH: 5,
  DEBOUNCE_DELAY: 300,
  SCROLL_THRESHOLD: 100,
  TOC_UPDATE_DELAY: 250,
} as const;
