import type { MarkdownPlugin } from "./types.ts";

/**
 * Clean Navigation Plugin
 *
 * Removes manual "Next: ..." or "Previous: ..." links at the bottom of articles
 * as they are redundant with the automatic pagination footer.
 */
export const cleanNavigationPlugin: MarkdownPlugin = {
  name: "clean-navigation",

  preProcess(content: string) {
    // Pattern: Horizontal rule followed by "Next: [Title](URL)" at the end of the string
    // We also handle cases without the horizontal rule.
    const redundantNavRegex = /\n\n---\s*\n\s*Next:\s*\[.*\]\(.*\)\s*$/i;
    const redundantNavWithoutHrRegex = /\n\nNext:\s*\[.*\]\(.*\)\s*$/i;

    return content.replace(redundantNavRegex, "").replace(redundantNavWithoutHrRegex, "");
  },
};
