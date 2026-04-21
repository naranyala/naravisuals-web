/**
 * useTitle
 *
 * Updates the document title based on the current document.
 * Format: "{docTitle} – {siteName}"
 */

import { useEffect } from "react";

export function useTitle(
  docTitle: string,
  siteName = (process.env.PROJECT_NAME as string) || "Docs"
) {
  useEffect(() => {
    const prev = document.title;
    document.title = docTitle ? `${docTitle} – ${siteName}` : siteName;
    return () => {
      document.title = prev;
    };
  }, [docTitle, siteName]);
}
