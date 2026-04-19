/**
 * useDocsTheme
 *
 * Unified theme hook for the documentation site.
 * Manages BOTH UI theme AND code block (Shiki) theme.
 *
 * Returns an object with:
 *   - isDark, toggleTheme        (UI)
 *   - codeTheme, setCodeTheme    (Shiki code blocks)
 *   - fontSize, setFontSize      (reading font size)
 *   - lineHeight, setLineHeight  (reading line height)
 */

import { useCallback, useEffect, useState } from "react";
import { useServices } from "../../services";
import type { ShikiCodeTheme } from "./useShikiTheme";

const FONT_SIZE_KEY = "docs-font-size";
const LINE_HEIGHT_KEY = "docs-line-height";
const FONT_KEY = "docs-font";

function getStoredNumber(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? Number(v) : fallback;
  } catch {
    return fallback;
  }
}

function applyReadingPrefs(fontSize: number, lineHeight: number) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--docs-font-size", `${fontSize}px`);
  document.documentElement.style.setProperty("--docs-line-height", String(lineHeight));
}

export interface DocsTheme {
  isDark: boolean;
  toggleTheme: () => void;
  codeTheme: ShikiCodeTheme;
  setCodeTheme: (theme: ShikiCodeTheme) => void;
  font: string;
  setFont: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  resetReadingPrefs: () => void;
}

export function useDocsTheme(): DocsTheme {
  const services = useServices();

  // ── UI Theme ──────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => services.theme.getInitialTheme());

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = services.theme.toggleTheme(prev);
      services.theme.applyTheme(next);
      return next;
    });
  }, [services]);

  // ── Code Theme (now the main document theme) ──────────────────────
  const [codeTheme, setCodeThemeState] = useState<ShikiCodeTheme>(() => {
    if (typeof window === "undefined") return "catppuccin";
    try {
      const stored = localStorage.getItem("theme");
      if (stored && isValidTheme(stored)) return stored;
    } catch {}
    return "catppuccin";
  });

  const setCodeTheme = useCallback((theme: ShikiCodeTheme) => {
    setCodeThemeState(theme);
    if (typeof document !== "undefined") {
      // Apply as main theme and code theme
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.setAttribute("data-code-theme", theme);
    }
    localStorage.setItem("theme", theme);
  }, []);

  // ── Font Size ─────────────────────────────────────────────────
  const [font, setFontState] = useState(() => {
    try {
      return localStorage.getItem(FONT_KEY) || "system";
    } catch {
      return "system";
    }
  });

  const setFont = useCallback((f: string) => {
    setFontState(f);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-font", f);
    }
    localStorage.setItem(FONT_KEY, f);
  }, []);

  const [fontSize, setFontSizeState] = useState(() => getStoredNumber(FONT_SIZE_KEY, 15));

  const setFontSize = useCallback((size: number) => {
    const clamped = Math.min(Math.max(size, 12), 20);
    setFontSizeState(clamped);
    localStorage.setItem(FONT_SIZE_KEY, String(clamped));
    applyReadingPrefs(clamped, getStoredNumber(LINE_HEIGHT_KEY, 1.6));
  }, []);

  // ── Line Height ───────────────────────────────────────────────
  const [lineHeight, setLineHeightState] = useState(() => getStoredNumber(LINE_HEIGHT_KEY, 1.6));

  const setLineHeight = useCallback((height: number) => {
    const clamped = Math.min(Math.max(height, 1.2), 2.2);
    setLineHeightState(clamped);
    localStorage.setItem(LINE_HEIGHT_KEY, String(clamped));
    applyReadingPrefs(getStoredNumber(FONT_SIZE_KEY, 15), clamped);
  }, []);

  const resetReadingPrefs = useCallback(() => {
    setFontSizeState(15);
    setLineHeightState(1.6);
    localStorage.removeItem(FONT_SIZE_KEY);
    localStorage.removeItem(LINE_HEIGHT_KEY);
    applyReadingPrefs(15, 1.6);
  }, []);

  // ── Apply on mount ────────────────────────────────────────────
  useEffect(() => {
    applyReadingPrefs(fontSize, lineHeight);
    // Apply initial theme
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", codeTheme);
      document.documentElement.setAttribute("data-font", font);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isDark,
    toggleTheme,
    codeTheme,
    setCodeTheme,
    font,
    setFont,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    resetReadingPrefs,
  };
}

function isValidTheme(name: string): name is ShikiCodeTheme {
  return [
    "catppuccin",
    "tokyonight",
    "gruvbox",
    "nord",
    "everforest",
    "solarized-light",
  ].includes(name);
}
