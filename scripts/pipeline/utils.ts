/**
 * Utility functions for slugification and safe naming.
 */

const SPECIAL_CASES: Record<string, string> = {
  "c++": "c-plus-plus",
  "c#": "c-sharp",
  ".net": "net",
};

/**
 * Docusaurus-compatible heading slugifier.
 */
export function slugifyHeading(text: string): string {
  const lower = text.toLowerCase().trim();
  if (SPECIAL_CASES[lower]) return SPECIAL_CASES[lower];

  const slug = lower
    .replace(/\+/g, "-plus-")
    .replace(/#/g, "-sharp-")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `heading-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Convert a slug like "guides/build-system" to a safe file var name "doc_guides_build_system"
 */
export function slugToVarName(slug: string): string {
  const safe = slug.replace(/[^a-zA-Z0-9]/g, "_");
  return `doc_${safe}`;
}

/**
 * Convert a slug to a kebab-case filename "guides-build-system"
 */
export function slugToFilename(slug: string): string {
  return slug.replace(/\//g, "-");
}
