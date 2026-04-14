/**
 * Validator Registry
 *
 * Registers all markdown validators for the validation pipeline.
 * Import and add validators here to enable them.
 */

import { admonitionValidator } from "./admonition-validator.ts";
import { codeblockValidator } from "./codeblock-validator.ts";
import { frontmatterValidator } from "./frontmatter-validator.ts";
import { mermaidValidator } from "./mermaid-validator.ts";
import { referenceValidator } from "./reference-validator.ts";
import type { MarkdownValidator } from "./types.ts";

/**
 * All registered validators.
 * Order matters: validators run in this order.
 *
 * - codeblockValidator: STRICT - fails build if missing descriptions
 * - mermaidValidator: STRICT - fails build if invalid mermaid content
 * - admonitionValidator: NOT strict - only informs about enrichment
 * - referenceValidator: STRICT - fails build if missing references/footnotes
 * - frontmatterValidator: NOT strict - exposes frontmatter data for LLM use
 */
export const validators: MarkdownValidator[] = [
  codeblockValidator,
  mermaidValidator,
  frontmatterValidator,
  admonitionValidator,
  referenceValidator,
];

export { admonitionValidator } from "./admonition-validator.ts";
export { codeblockValidator } from "./codeblock-validator.ts";
export { frontmatterValidator } from "./frontmatter-validator.ts";
export { mermaidValidator } from "./mermaid-validator.ts";
export { referenceValidator } from "./reference-validator.ts";
