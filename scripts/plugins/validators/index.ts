/**
 * Validator Registry
 *
 * Registers all markdown validators for the validation pipeline.
 * Import and add validators here to enable them.
 */

import { admonitionValidator } from "./admonition-validator.ts";
import { codeblockValidator } from "./codeblock-validator.ts";
import { frontmatterValidator } from "./frontmatter-validator.ts";
import { imageValidator } from "./image-validator.ts";
import { linkValidator } from "./link-validator.ts";
import { mermaidValidator } from "./mermaid-validator.ts";
import { referenceValidator } from "./reference-validator.ts";
import { structureValidator } from "./structure-validator.ts";
import type { MarkdownValidator } from "./types.ts";

/**
 * All registered validators.
 * Order matters: validators run in this order.
 */
export const validators: MarkdownValidator[] = [
  codeblockValidator,
  mermaidValidator,
  frontmatterValidator,
  admonitionValidator,
  referenceValidator,
  linkValidator,
  imageValidator,
  structureValidator,
];

export { admonitionValidator } from "./admonition-validator.ts";
export { codeblockValidator } from "./codeblock-validator.ts";
export { frontmatterValidator } from "./frontmatter-validator.ts";
export { imageValidator } from "./image-validator.ts";
export { linkValidator } from "./link-validator.ts";
export { mermaidValidator } from "./mermaid-validator.ts";
export { referenceValidator } from "./reference-validator.ts";
export { structureValidator } from "./structure-validator.ts";
