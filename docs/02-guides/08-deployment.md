---
title: Deployment
description: Production build and deployment options
sidebar_label: Deployment
sidebar_position: 10
---

# Deployment

:::note Deployment Flexibility
The `dist/` folder contains pure static files. No server-side processing, no APIs, no databases. Deploy anywhere that serves static files — Vercel, Netlify, GitHub Pages, Cloudflare Pages, or any static server.
:::

## Production Build

```bash:desc=Run the production build pipeline that cleans dist, regenerates docs, lints, and bundles with Rspack
npm run build
```

This performs:
1. `rm -rf dist` — clean output directory
2. `bun run build:docs` — regenerate `src/generated/`
3. `biome check .` — lint before build
4. `NODE_ENV=production rspack build` — production bundle

## Output Structure

```txt:desc=Production build output directory structure showing all static files generated for deployment including HTML, JavaScript bundle, assets, and SEO files.
dist/
├── index.html                    # Single HTML entry point
├── index.[hash].js              # All React code + all doc content
├── logo.svg                     # Copied from src/
├── sitemap.xml                  # Auto-generated SEO sitemap
└── robots.txt                   # Auto-generated crawler instructions
```

### Content Flow

```mermaid:desc=Package diagram showing the production build output structure and dependencies. The index.html references the JavaScript bundle, which loads React, goober for styling, mermaid for diagrams, and mathjax for equations. External CDN resources are also loaded.
package
    index.html["index.html"]
    bundle["index.[hash].js"]
    
    subgraph Libraries
        React["react + react-dom"]
        Goober["goober CSS-in-JS"]
        Mermaid["mermaid (lazy)"]
        MathJax["mathjax (CDN)"]
    end
    
    subgraph Assets
        logo["logo.svg"]
        sitemap["sitemap.xml"]
        robots["robots.txt"]
    end
    
    index.html --> bundle
    bundle --> React
    bundle --> Goober
    bundle --> Mermaid
    bundle --> MathJax
    MathJax -.-> "cdn.jsdelivr.net"
    
    index.html --> logo
    index.html --> sitemap
    index.html --> robots
```

The `dist/` folder contains **pure static files**. No server-side processing, no APIs, no databases. Deploy anywhere that serves static files.

## Deployment Targets

```mermaid:desc=Flowchart showing how a single dist/ output from the build process can be deployed to multiple targets: Vercel, Netlify, GitHub Pages, Cloudflare Pages, or any static server (nginx/Apache/S3), all requiring SPA fallback routing.
flowchart LR
    Build[npm run build]

    Build --> Dist["dist/\nPure static files"]
    
    Dist --> Vercel["Vercel\nvercel --prod"]
    Dist --> Netlify["Netlify\nnetlify deploy --prod"]
    Dist --> GHPages["GitHub Pages\ngit subtree push"]
    Dist --> CFPages["Cloudflare Pages\nwrangler pages deploy"]
    Dist --> Static["Any Static Server\nnginx/Apache/S3"]
    
    style Dist fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
    style Build fill:#fff4e1,stroke:#f57c00
    
    classDef target fill:#e1f5ff,stroke:#0277bd,stroke-width:2px
    class Vercel,Netlify,GHPages,CFPages,Static target
```

### Vercel

```bash:desc=Deploy to Vercel production using the Vercel CLI
vercel --prod
```

### Netlify

```bash:desc=Deploy to Netlify production from the dist directory
netlify deploy --prod --dir=dist
```

Or drag the `dist/` folder to [app.netlify.com/drop](https://app.netlify.com/drop).

### GitHub Pages

```bash:desc=Push the dist folder to the gh-pages branch for GitHub Pages hosting
git subtree push --prefix dist origin gh-pages
```

For custom domains, create a `CNAME` file in your `gh-pages` branch.

### Cloudflare Pages

```bash:desc=Deploy the dist folder to Cloudflare Pages using Wrangler CLI
wrangler pages deploy dist
```

### Any Static Server

The `dist/` folder can be served by nginx, Apache, S3, or any static file server.

**Important:** Configure SPA fallback — all routes should serve `index.html` for client-side routing to work.

## Production Server

The project includes a simple production server using the `serve` package:

```bash:desc=Start the production server using the serve package with SPA fallback mode for client-side routing. Configurable via PORT environment variable.
npm start
```

This spawns `npx serve` with:
- Static file serving from `dist/`
- SPA fallback mode (`-s` flag) for client-side routing
- Port configurable via `PORT` env (default: 3000)
- Graceful shutdown on SIGINT/SIGTERM

## Deployment Checklist

- [ ] Run `npm run build` successfully (no lint errors, no build errors)
- [ ] Verify the `dist/` folder contains `index.html`, JS files, `sitemap.xml`, and `robots.txt`
- [ ] Update `SITE_URL` in `scripts/build-docs.mts` to your actual domain
- [ ] Update `siteUrl` in `src/App.tsx` (SEO hook) to your actual domain
- [ ] Ensure your hosting provider serves `index.html` for all routes (SPA fallback)
- [ ] Submit `sitemap.xml` to Google Search Console
- [ ] Test routing works (navigate to a deep doc URL directly)
- [ ] Check that assets (logo.svg) load correctly

## Client-Side Routing Notes

```mermaid:desc=Flowchart showing how client-side routing works: User naviges to a URL, server serves index.html (SPA fallback), React app loads, parses the URL slug, looks up the DocEntry in allDocs, and renders the DocViewer with matched content.
flowchart TD
    User["User naviges to URL\n/docs/guides/build-system"]

    User --> Server[Server receives request]

    Server --> SPA{"Route exists\nas file?"}

    SPA -->|No| IndexHTML["Serve index.html\nSPA fallback"]
    SPA -->|Yes| StaticFile[Serve static file]

    IndexHTML --> ReactLoad[React app loads]

    ReactLoad --> ParseURL["Parse URL slug\nguides/build-system"]

    ParseURL --> Lookup["Lookup DocEntry\nin allDocs array"]

    Lookup --> Found{"DocEntry\nfound?"}

    Found -->|Yes| Render["Render DocViewer\nwith content"]
    Found -->|No| NotFound[Show 404 page]

    Render --> Display[Display rendered docs]
    StaticFile --> Display

    style User fill:#fff4e1
    style IndexHTML,ReactLoad,ParseURL,Lookup,Render,Display fill:#e1f5ff
    style NotFound fill:#ffebee
```

- Client-side routing requires SPA fallback (all routes serve `index.html`)
- On GitHub Pages, create a `404.html` that redirects to `index.html`
- Direct URL access to any doc should work (e.g., `/docs/guides/build-system`)
