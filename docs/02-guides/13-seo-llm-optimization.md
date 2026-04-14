---
title: SEO and LLM Optimization
description: How the documentation site is optimized for search engines and AI crawlers
sidebar_label: SEO & LLM
sidebar_position: 15
---

# SEO and LLM Optimization

:::note SEO + AI Optimization
This documentation site is optimized for both search engines and LLM/AI crawlers. Key features: JSON-LD structured data, semantic HTML, code language tags, and clean content boundaries.
:::

The documentation site is built with comprehensive optimizations for both **search engines** (SEO) and **LLM/AI crawlers**.

---

## SEO Features

### SEO Flow

```mermaid:desc=Flowchart showing how SEO optimization flows through the documentation site: build script generates sitemap.xml and robots.txt from docs, App.tsx injects meta tags on each page view, search engines crawl and index, LLM bots parse structured data for AI training.
flowchart LR
    subgraph Build[Build Time]
        Docs["docs/*.md"] --> BuildScript["build-docs.mts"]
        BuildScript --> sitemap["sitemap.xml"]
        BuildScript --> robots["robots.txt"]
    end
    
    subgraph Runtime[Runtime]
        App["App.tsx"] --> Meta["Dynamic Meta Tags"]
        Meta --> OG["Open Graph"]
        Meta --> JSONLD["JSON-LD"]
    end
    
    subgraph Crawlers[Crawlers]
        sitemap --> Google["Google Bot"]
        robots --> Google
        Meta --> Google
        JSONLD --> LLM["LLM Bot"]
    end
    
    style Build fill:#fff4e1
    style Runtime fill:#e1f5ff
    style Crawlers fill:#e8f5e9
```

### 1. Dynamic Meta Tags

Every page has unique, content-specific meta tags updated dynamically:

```html:desc=Dynamic meta tags for SEO optimization including page-specific title, description for search snippets, and canonical URL to prevent duplicate content issues.
<title>Build System — My Docs</title>
<meta name="description" content="How the markdown-to-TypeScript build pipeline works" />
<link rel="canonical" href="https://your-docs-site.com/docs/guides/build-system" />
```

### 2. Open Graph Tags

Social sharing optimization for Facebook, LinkedIn, etc.:

```html:desc=Open Graph protocol meta tags for rich social media previews on platforms like Facebook and LinkedIn. Defines content type, title, description, URL, and site name.
<meta property="og:type" content="article" />
<meta property="og:title" content="Build System — My Docs" />
<meta property="og:description" content="How the markdown-to-TypeScript build pipeline works" />
<meta property="og:url" content="https://your-docs-site.com/docs/guides/build-system" />
<meta property="og:site_name" content="My Docs" />
```

### 3. Twitter Card Tags

Optimized for Twitter/X link previews:

```html:desc=Twitter Card meta tags for optimized link previews on Twitter/X. Uses summary card type with custom title and description.
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="Build System — My Docs" />
<meta name="twitter:description" content="How the markdown-to-TypeScript build pipeline works" />
```

### 4. XML Sitemap

Auto-generated `sitemap.xml` with all document URLs:

```xml:desc=XML sitemap for search engine crawlers listing all documentation pages with last modified dates, change frequency, and priority scores for SEO optimization.
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-docs-site.com/docs/guides/build-system</loc>
    <lastmod>2026-04-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- ... all docs -->
</urlset>
```

### 5. robots.txt

Auto-generated `robots.txt` pointing to the sitemap:

```txt:desc=Robots exclusion file directing crawlers to allowed content and sitemap location. Includes optional crawl-delay for polite crawling behavior.
User-agent: *
Allow: /

# Sitemap location
Sitemap: https://your-docs-site.com/sitemap.xml

# Crawl delay (optional, polite)
Crawl-delay: 1
```

### 6. Canonical URLs

Every page has a `<link rel="canonical">` to prevent duplicate content issues.

### 7. Semantic HTML

- Proper heading hierarchy (`h1` → `h6`)
- `<article>`, `<nav>`, `<main>` elements where appropriate
- Table of contents with structured headings
- Code blocks with language attributes

---

## LLM-Friendly Features

### 1. JSON-LD Structured Data

Every page includes machine-readable structured data:

```json:desc=JSON-LD structured data using Schema.org vocabulary for search engines and LLMs. Defines article metadata including headline, description, URL, author, publication date, keywords, and document sections.
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Build System",
  "description": "How the markdown-to-TypeScript build pipeline works",
  "url": "https://your-docs-site.com/docs/guides/build-system",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2026-04-12",
  "keywords": "build, markdown, pipeline",
  "hasPart": [
    {
      "@type": "ArticleSection",
      "name": "Build Pipeline Flow",
      "url": "https://your-docs-site.com/docs/guides/build-system#build-pipeline-flow"
    }
  ]
}
```

### 2. BreadcrumbList Schema

Navigation breadcrumbs for search engines:

```json:desc=BreadcrumbList schema for search engine navigation display. Shows hierarchical page structure with category and document names for improved search result context.
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Guides", "item": "..." },
    { "@type": "ListItem", "position": 2, "name": "Build System", "item": "..." }
  ]
}
```

### 3. Data Attributes for Machine Parsing

Content boundaries marked with data attributes:

```html:desc=Data attributes on root element for machine parsing and LLM content extraction. Includes page slug, title, and description for programmatic content identification.
<div id="root"
     data-page-slug="guides/build-system"
     data-page-title="Build System"
     data-page-description="How the markdown pipeline works">
```

### 4. Clean Semantic Structure

- Code blocks: `<pre><code class="language-typescript">` with language tags
- Tables: Proper `<thead>`, `<tbody>`, `<th>` structure
- Lists: Semantic `<ul>`, `<ol>`, `<li>` elements
- Admonitions: Clear `<div class="admonition">` containers
- Math: MathJax-rendered SVG with fallback text

### 5. Table of Contents

Structured TOC with heading IDs for section linking:

```html:desc=Table of contents structure with semantic markup for search engines. Uses nested lists with heading IDs for section linking and hierarchical content navigation.
<div class="toc">
  <p class="toc-title">On this page</p>
  <ul class="toc-list">
    <li class="toc-item toc-item-level-2">
      <a href="#build-pipeline-flow">Build Pipeline Flow</a>
    </li>
    <!-- ... -->
  </ul>
</div>
```

---

## Configuration

### Site URL

Update the site URL in these locations:

1. **Build script** (`scripts/build-docs.mts`):
   ```typescript:desc=Site URL constant definition in the build script. Used for generating canonical URLs, sitemap entries, and Open Graph absolute URLs.
   const SITE_URL = "https://your-docs-site.com";
   ```

2. **SEO hook** (`src/App.tsx`):
   ```typescript:desc=SEO hook configuration in the App component. Passes site URL to the useSeo hook for generating meta tags and structured data.
   useSeo({
     siteUrl: "https://your-docs-site.com",
     // ...
   });
   ```

3. **HTML template** (`src/index.html`):
   ```html:desc=Open Graph site name meta tag in the HTML template. Displays as the source name in social media share previews.
   <meta property="og:site_name" content="Your Docs" />
   ```

### robots.txt Customization

Edit the generated `robots.txt` in `scripts/build-docs.mts`:

```typescript:desc=TypeScript template literal for generating robots.txt content. Includes optional directives to block AI training crawlers (GPTBot, CCBot) from indexing the documentation.
const robotsTxt = `User-agent: *
Allow: /

# Block AI crawlers (optional)
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
```

---

## Verification

### Check SEO Implementation

1. **View page source** — Check meta tags in `<head>`
2. **Inspect structured data** — Look for `<script type="application/ld+json">`
3. **Check sitemap** — Visit `/sitemap.xml`
4. **Check robots.txt** — Visit `/robots.txt`

### Google Search Console

Submit your sitemap to Google Search Console:
1. Go to Search Console
2. Add your property
3. Submit `sitemap.xml`

### Lighthouse Audit

Run Lighthouse in Chrome DevTools:
1. Open Chrome DevTools → Lighthouse tab
2. Select "SEO" category
3. Run audit
4. Address any issues found

---

## Benefits

### For Search Engines:
- ✅ **Better indexing** — Sitemap tells crawlers about all pages
- ✅ **Rich snippets** — Structured data enables enhanced search results
- ✅ **Social sharing** — Open Graph/Twitter cards create attractive previews
- ✅ **No duplicate content** — Canonical URLs prevent penalties
- ✅ **Proper hierarchy** — Semantic HTML helps understanding

### For LLMs/AI Crawlers:
- ✅ **Structured data** — JSON-LD provides machine-readable metadata
- ✅ **Content boundaries** — Clear separation of main content vs navigation
- ✅ **Section links** — TOC with IDs enables deep linking
- ✅ **Code context** — Language tags help code understanding
- ✅ **Author/date metadata** — Provenance information for credibility

---

## Summary

| Feature | SEO Benefit | LLM Benefit |
|---------|-------------|-------------|
| Dynamic meta tags | Better rankings | Content context |
| Open Graph | Social sharing | Content type |
| JSON-LD | Rich snippets | Structured metadata |
| Sitemap.xml | Crawl discovery | URL inventory |
| robots.txt | Crawl control | Access guidance |
| Canonical URLs | No duplicates | Primary source |
| Semantic HTML | Better indexing | Content structure |
| Code language tags | N/A | Code context |
| TOC with IDs | Section links | Deep linking |
| Breadcrumbs | Navigation | Content hierarchy |
