/**
 * useSeo
 *
 * Dynamically updates SEO meta tags and structured data
 * based on the current document being viewed.
 *
 * Features:
 * - Page title with site suffix
 * - Meta description
 * - Canonical URL
 * - Open Graph tags
 * - Twitter Card tags
 * - JSON-LD structured data (Article, BreadcrumbList)
 * - LLM-friendly content hints
 */

import { useEffect } from "react";

interface UseSeoOptions {
  /** Current page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Page slug (e.g., "guides/build-system") */
  slug?: string;
  /** Site base URL (for canonical) */
  siteUrl?: string;
  /** Site name */
  siteName?: string;
  /** Author name (for article schema) */
  author?: string;
  /** Publication date */
  date?: string;
  /** Tags/categories */
  tags?: string[];
  /** Table of contents items */
  toc?: { value: string; id: string; level: number }[];
}

export function useSeo({
  title,
  description,
  slug,
  siteUrl = "https://your-docs-site.com",
  siteName = "Documentation",
  author,
  date,
  tags,
  toc,
}: UseSeoOptions = {}) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const fullTitle = title ? `${title} — ${siteName}` : siteName;
    const url = slug ? `${siteUrl}/docs/${slug}` : siteUrl;

    // 1. Update page title
    document.title = fullTitle;

    // 2. Update meta description
    updateOrCreateMeta("description", description || siteName);

    // 3. Update canonical URL
    const canonical = document.getElementById("canonical") as HTMLLinkElement | null;
    if (canonical) canonical.href = url;

    // 4. Update Open Graph tags
    updateOrCreateMeta("og:title", fullTitle, "property");
    updateOrCreateMeta("og:description", description || siteName, "property");
    updateOrCreateMeta("og:url", url, "property");
    updateOrCreateMeta("og:site_name", siteName, "property");
    updateOrCreateMeta("og:type", "article", "property");

    // 5. Update Twitter Card tags
    updateOrCreateMeta("twitter:title", fullTitle, "name");
    updateOrCreateMeta("twitter:description", description || siteName, "name");
    updateOrCreateMeta("twitter:card", "summary", "name");

    // 6. Update JSON-LD structured data
    const structuredData = document.getElementById("structured-data") as HTMLScriptElement | null;
    if (structuredData) {
      const schema: any = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description: description,
        url: url,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        publisher: {
          "@type": "Organization",
          name: siteName,
        },
      };

      if (author) schema.author = { "@type": "Person", name: author };
      if (date) {
        schema.datePublished = date;
        schema.dateModified = date;
      }
      if (tags && tags.length > 0) schema.keywords = tags.join(", ");
      if (toc && toc.length > 0) {
        schema.hasPart = toc.map((item) => ({
          "@type": "ArticleSection",
          name: item.value,
          url: `${url}#${item.id}`,
        }));
      }

      structuredData.textContent = JSON.stringify(schema, null, 2);
    }

    // 7. Add LLM-friendly content hints (data attributes for machine parsing)
    const root = document.getElementById("root");
    if (root) {
      if (slug) root.dataset.pageSlug = slug;
      if (title) root.dataset.pageTitle = title;
      if (description) root.dataset.pageDescription = description;
    }

    // Cleanup function
    return () => {
      // No cleanup needed — meta tags persist
    };
  }, [title, description, slug, siteUrl, siteName, author, date, tags, toc]);
}

/**
 * Update an existing meta tag or create a new one.
 */
function updateOrCreateMeta(
  name: string,
  content: string,
  attr: "name" | "property" = "name"
): void {
  if (typeof document === "undefined") return;

  // Try to find existing meta tag
  let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attr, name);
    document.head.appendChild(meta);
  }

  meta.content = content;
}
