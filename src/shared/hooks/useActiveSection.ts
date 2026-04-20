/**
 * useActiveSection
 *
 * Tracks which heading section is currently visible in the viewport
 * using IntersectionObserver. Returns the active heading ID.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export function useActiveSection(selector = ".doc-content h2, .doc-content h3"): string {
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const observe = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const headings = document.querySelectorAll<HTMLElement>(selectorRef.current);
    if (headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    headings.forEach((h) => {
      observerRef.current?.observe(h);
    });
  }, []);

  useEffect(() => {
    observe();
    return () => observerRef.current?.disconnect();
  }, [observe]);

  return activeId;
}
