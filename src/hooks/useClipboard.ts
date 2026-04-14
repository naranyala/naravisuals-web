/**
 * useClipboard
 *
 * Copies text to clipboard and shows temporary "copied!" feedback.
 * Returns [copied, copy] tuple.
 */

import { useCallback, useRef, useState } from "react";

interface UseClipboardOptions {
  /** How long "copied" state lasts (ms) */
  duration?: number;
}

export function useClipboard({ duration = 2000 }: UseClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), duration);
        return true;
      } catch {
        // Fallback for older browsers / non-HTTPS
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), duration);
        return true;
      }
    },
    [duration]
  );

  return [copied, copy] as const;
}
