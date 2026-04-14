/**
 * useScrollProgress
 *
 * Returns a value between 0 and 1 representing how far
 * the user has scrolled through the main content area.
 * Useful for reading progress bars.
 */

import { useCallback, useEffect, useState } from "react";

export function useScrollProgress(contentSelector = ".main-content"): number {
  const [progress, setProgress] = useState(0);

  const update = useCallback(() => {
    const el = document.querySelector<HTMLElement>(contentSelector);
    if (!el) return;

    const scrollTop = window.scrollY;
    const docHeight = el.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      setProgress(0);
      return;
    }
    setProgress(Math.min(Math.max(scrollTop / docHeight, 0), 1));
  }, [contentSelector]);

  useEffect(() => {
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  return progress;
}
