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
import { AVAILABLE_CODE_FONT_SIZES, DEFAULT_FONT, DEFAULT_THEME } from "../../core/constants";
import { useServices } from "../../services";
import type { ShikiCodeTheme } from "./useShikiTheme";

const FONT_SIZE_KEY = "docs-font-size";
const LINE_HEIGHT_KEY = "docs-line-height";
const FONT_KEY = "docs-font";
const CODE_FONT_SIZE_KEY = "docs-code-font-size";

function getStoredNumber(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? Number(v) : fallback;
  } catch {
    return fallback;
  }
}

function applyReadingPrefs(fontSize: number, lineHeight: number, codeFontSize: string) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--docs-font-size", `${fontSize}px`);
  document.documentElement.style.setProperty("--docs-line-height", String(lineHeight));

  const codeSize = AVAILABLE_CODE_FONT_SIZES.find((s) => s.id === codeFontSize)?.css || "0.85rem";
  document.documentElement.style.setProperty("--code-font-size", codeSize);
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
  codeFontSize: string;
  setCodeFontSize: (size: string) => void;
  resetReadingPrefs: () => void;
}

export function useDocsTheme(): DocsTheme {
  const services = useServices();

  // ── UI Theme ──────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => services.theme.getInitialTheme());

  const toggleTheme = useCallback(() => {
    setIsDark((prev: boolean) => {
      const next = services.theme.toggleTheme(prev);
      services.theme.applyTheme(next);
      return next;
    });
  }, [services]);

  // ── State Declarations (declared before use in callbacks) ─────
  const [fontSize, setFontSizeState] = useState(() => getStoredNumber(FONT_SIZE_KEY, 15));
  const [lineHeight, setLineHeightState] = useState(() => getStoredNumber(LINE_HEIGHT_KEY, 1.6));

  const [codeFontSize, setCodeFontSizeState] = useState(() => {
    if (typeof window === "undefined") return "small";
    try {
      return localStorage.getItem(CODE_FONT_SIZE_KEY) || "small";
    } catch {
      return "small";
    }
  });

  const [codeTheme, setCodeThemeState] = useState<ShikiCodeTheme>(() => {
    if (typeof window === "undefined") return DEFAULT_THEME as ShikiCodeTheme;
    try {
      const stored = localStorage.getItem("theme");
      if (stored && isValidTheme(stored)) return stored;
    } catch {}
    return DEFAULT_THEME as ShikiCodeTheme;
  });

  const [font, setFontState] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_FONT;
    try {
      return localStorage.getItem(FONT_KEY) || DEFAULT_FONT;
    } catch {
      return DEFAULT_FONT;
    }
  });

  // ── Callbacks ───────────────────────────────────────────────
  const setCodeTheme = useCallback((theme: ShikiCodeTheme) => {
    setCodeThemeState(theme);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.setAttribute("data-code-theme", theme);
    }
    localStorage.setItem("theme", theme);
  }, []);

  const setCodeFontSize = useCallback(
    (size: string) => {
      setCodeFontSizeState(size);
      localStorage.setItem(CODE_FONT_SIZE_KEY, size);
      applyReadingPrefs(fontSize, lineHeight, size);
    },
    [fontSize, lineHeight]
  );

  const setFont = useCallback((f: string) => {
    setFontState(f);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-font", f);
    }
    localStorage.setItem(FONT_KEY, f);
  }, []);

  const setFontSize = useCallback(
    (size: number) => {
      const clamped = Math.min(Math.max(size, 12), 20);
      setFontSizeState(clamped);
      localStorage.setItem(FONT_SIZE_KEY, String(clamped));
      applyReadingPrefs(clamped, lineHeight, codeFontSize);
    },
    [lineHeight, codeFontSize]
  );

  const setLineHeight = useCallback(
    (height: number) => {
      const clamped = Math.min(Math.max(height, 1.2), 2.2);
      setLineHeightState(clamped);
      localStorage.setItem(LINE_HEIGHT_KEY, String(clamped));
      applyReadingPrefs(fontSize, clamped, codeFontSize);
    },
    [fontSize, codeFontSize]
  );

  const resetReadingPrefs = useCallback(() => {
    setFontSizeState(15);
    setLineHeightState(1.6);
    setCodeFontSizeState("small");
    localStorage.removeItem(FONT_SIZE_KEY);
    localStorage.removeItem(LINE_HEIGHT_KEY);
    localStorage.removeItem(CODE_FONT_SIZE_KEY);
    applyReadingPrefs(15, 1.6, "small");
  }, []);

  // ── Apply on mount ────────────────────────────────────────────
  useEffect(() => {
    applyReadingPrefs(fontSize, lineHeight, codeFontSize);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", codeTheme);
      document.documentElement.setAttribute("data-font", font);
    }
  }, [lineHeight, fontSize, font, codeTheme, codeFontSize]); // eslint-disable-line react-hooks/exhaustive-deps

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
    codeFontSize,
    setCodeFontSize,
    resetReadingPrefs,
  };
}

function isValidTheme(name: string): name is ShikiCodeTheme {
  return ["catppuccin", "tokyonight", "gruvbox", "nord", "everforest", "solarized-light"].includes(
    name
  );
}
