/**
 * Core application constants
 *
 * Central place for configuration values, theme definitions, and other constants.
 */

import type { FontOption, ThemeOption } from "../types";

// ─── Theme Configuration ──────────────────────────────────────────────────

export const AVAILABLE_THEMES: ThemeOption[] = [
  { id: "paperlike-white", label: "Paper White", bg: "#ffffff", accent: "#2563eb" },
  { id: "paperlike-gray", label: "Paper Gray", bg: "#e8e8e8", accent: "#5b8db8" },
  { id: "paperlike-sepia", label: "Paper Sepia", bg: "#f4ecd8", accent: "#8b6914" },
  { id: "paperlike-dark-gray", label: "Paper Dark", bg: "#2a2a2a", accent: "#7ba3cc" },
  { id: "navy", label: "Navy", bg: "#f0f4f8", accent: "#3b82f6" },
  { id: "dark-navy", label: "Dark Navy", bg: "#0f172a", accent: "#60a5fa" },
];

export const AVAILABLE_FONTS: FontOption[] = [
  { id: "system", label: "System", css: "system-ui, -apple-system, sans-serif" },
  { id: "serif", label: "Serif", css: 'Georgia, "Times New Roman", serif' },
  { id: "mono", label: "Mono", css: '"SFMono-Regular", Consolas, monospace' },
  { id: "inter", label: "Inter", css: '"Inter", system-ui, sans-serif' },
  { id: "source-sans", label: "Source Sans", css: '"Source Sans 3", system-ui, sans-serif' },
];

export const DEFAULT_THEME = "paperlike-dark-gray";
export const DEFAULT_FONT = "system";

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
    primaryColor: "#e8f5e9",
    primaryTextColor: "#1a1a2e",
    primaryBorderColor: "#2e7d32",
    lineColor: "#374151",
    secondaryColor: "#e3f2fd",
    tertiaryColor: "#fff3e0",
    background: "#ffffff",
    mainBkg: "#ffffff",
    nodeBorder: "#6b7280",
    clusterBkg: "#f3f4f6",
    clusterBorder: "#d1d5db",
    titleColor: "#1a1a2e",
    edgeLabelBackground: "#ffffff",
  },
  securityLevel: "loose",
  fontFamily: "system-ui, -apple-system, sans-serif",
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
