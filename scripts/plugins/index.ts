/**
 * Markdown Plugin Registry
 *
 * Add new plugins here to extend the markdown pipeline.
 * Each plugin is applied in order during the build process.
 *
 * Pipeline order:
 *   preProcess (all plugins) → marked → postProcess (all plugins)
 */

import { admonitionsPlugin } from "./admonitions.ts";
import { cleanNavigationPlugin } from "./clean-navigation.ts";
import { footnotesPlugin } from "./footnotes.ts";
import { mathPlugin } from "./math.ts";
import { mermaidPlugin } from "./mermaid.ts";
import { timelinePlugin } from "./timeline.ts";
import type { MarkdownPlugin } from "./types.ts";

/**
 * All active markdown plugins.
 * Add or remove plugins to enable/disable them in the build.
 *
 * Order matters:
 *   1. math — extract $...$ outside code blocks FIRST
 *   2. admonitions — extract ::: blocks (math already removed from content)
 *   3. mermaid — transform mermaid code blocks in postProcess
 *   4. timeline — transform timeline code blocks in postProcess
 */
export const plugins: MarkdownPlugin[] = [
  cleanNavigationPlugin,
  mathPlugin,
  admonitionsPlugin,
  mermaidPlugin,
  timelinePlugin,
  footnotesPlugin,
];

export { admonitionsPlugin } from "./admonitions.ts";
export { footnotesPlugin } from "./footnotes.ts";
export { mathPlugin } from "./math.ts";
export { mermaidPlugin } from "./mermaid.ts";
export { timelinePlugin } from "./timeline.ts";
export type { MarkdownPlugin } from "./types.ts";
