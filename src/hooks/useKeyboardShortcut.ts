/**
 * useKeyboardShortcut
 *
 * Registers global keyboard shortcuts.
 * Supports modifier keys (meta, ctrl, alt, shift).
 */

import { useEffect, useRef } from "react";

interface ShortcutOptions {
  /** Key to match (e.g. "k", "Escape", "/") */
  key: string;
  /** Requires ⌘/Ctrl */
  meta?: boolean;
  /** Requires Alt */
  alt?: boolean;
  /** Requires Shift */
  shift?: boolean;
  /** Prevent default browser behavior */
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  handler: () => void,
  { key, meta = false, alt = false, shift = false, preventDefault = true }: ShortcutOptions
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (meta && !(e.metaKey || e.ctrlKey)) return;
      if (alt && !e.altKey) return;
      if (shift && !e.shiftKey) return;
      // If meta is false, ensure meta/ctrl is NOT pressed (unless explicitly wanted)
      if (!meta && (e.metaKey || e.ctrlKey)) return;
      if (!alt && e.altKey) return;
      if (!shift && e.shiftKey) return;

      if (preventDefault) e.preventDefault();
      handlerRef.current();
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [key, meta, alt, shift, preventDefault]);
}
