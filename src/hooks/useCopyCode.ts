/**
 * useCopyCode
 *
 * Hook for the "Copy" button on code blocks.
 * Extracts textContent from a code block element and copies it.
 * Returns copied state for UI feedback.
 */

import { useCallback, useState } from "react";

interface UseCopyCodeOptions {
  /** How long "Copied!" feedback lasts (ms) */
  duration?: number;
}

export function useCopyCode({ duration = 2000 }: UseCopyCodeOptions = {}) {
  const [copied, setCopied] = useState(false);

  const copyCode = useCallback(
    async (codeBlock: HTMLElement | null) => {
      if (!codeBlock) return false;

      const text = codeBlock.textContent || "";
      if (!text) return false;

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), duration);
      return true;
    },
    [duration]
  );

  return { copied, copyCode };
}
