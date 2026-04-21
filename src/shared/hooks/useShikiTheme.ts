/**
 * useShikiTheme
 *
 * Manages the code block syntax highlighting theme independently
 * from the UI theme. Applies CSS filter transforms to Shiki-rendered
 * code blocks so they match the selected code theme.
 *
 * Supported code themes (all derived from Shiki built-in themes):
 *   - paperlike-dark-gray (default)
 *   - paperlike-white
 *   - paperlike-gray
 *   - paperlike-sepia
 *   - paperlike-dark-sepia
 *
 * Since Shiki renders at build time with inline styles, we use CSS
 * filter transforms to convert between themes at runtime without
 * re-building.
 */

import { useCallback, useEffect, useState } from "react";

export type ShikiCodeTheme =
  | "catppuccin"
  | "tokyonight"
  | "gruvbox"
  | "nord"
  | "everforest"
  | "solarized-light";

const THEME_STORAGE_KEY = "theme";

/**
 * Get the initial code theme from localStorage, falling back to catppuccin.
 */
function getInitialCodeTheme(): ShikiCodeTheme {
  if (typeof window === "undefined") return "catppuccin";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isValidTheme(stored)) return stored;
  } catch {}
  return "catppuccin";
}

function isValidTheme(name: string): name is ShikiCodeTheme {
  return ["catppuccin", "tokyonight", "gruvbox", "nord", "everforest", "solarized-light"].includes(
    name
  );
}

/**
 * Apply the code theme by setting a data attribute on <html>
 * and injecting the appropriate CSS filter.
 */
function applyCodeTheme(theme: ShikiCodeTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-code-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function useShikiTheme(): [ShikiCodeTheme, (theme: ShikiCodeTheme) => void] {
  const [theme, setThemeState] = useState<ShikiCodeTheme>(getInitialCodeTheme);

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyCodeTheme(theme);
  }, [theme]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue && isValidTheme(e.newValue)) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setTheme = useCallback((theme: ShikiCodeTheme) => {
    setThemeState(theme);
    applyCodeTheme(theme);
  }, []);

  return [theme, setTheme];
}
