/**
 * useScrollToTop
 *
 * Returns a `scrollToTop` function and a `visible` flag
 * that becomes true after scrolling past `threshold` pixels.
 */

import { useCallback, useEffect, useState } from "react";

interface UseScrollToTopOptions {
  /** Show button after scrolling this far (default: 300px) */
  threshold?: number;
  /** Smooth scroll behavior */
  behavior?: ScrollBehavior;
}

export function useScrollToTop({
  threshold = 300,
  behavior = "smooth",
}: UseScrollToTopOptions = {}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > threshold);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior });
  }, [behavior]);

  return { visible, scrollToTop };
}
