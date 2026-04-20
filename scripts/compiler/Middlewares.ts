/**
 * Default middlewares for the Documentation Compiler.
 */

import type { CompilerMiddleware } from "./Middleware.ts";
import { plugins } from "../plugins/index.ts";
import { validateFrontmatter, validateUniqueSlugs, validateInternalLinks } from "../diagnostics.ts";

export const pluginMiddleware: CompilerMiddleware = {
  name: "markdown-plugins",

  async onPreParse(unit) {
    for (const plugin of plugins) {
      if (plugin.preProcess) {
        unit.content = plugin.preProcess(unit.content!);
      }
    }
  },

  async onPostProcess(unit) {
    for (let i = plugins.length - 1; i >= 0; i--) {
      const plugin = plugins[i];
      if (plugin?.postProcess) {
        unit.html = await (plugin.postProcess as any)(unit.html!);
      }
    }
  }
};

export const validationMiddleware: CompilerMiddleware = {
  name: "validation",

  onIngest(unit, ctx) {
    // Basic path validation
    if (unit.relPath.includes(" ")) {
      ctx.warn("slugs", unit.relPath, "Filename contains spaces. This is discouraged for SEO.");
    }
  },

  onPreParse(unit, ctx) {
    // Validate frontmatter (legacy validator integration)
    const fm = (unit as any).metadata; // We mapped it earlier
    // Need a shim for legacy validateFrontmatter which expects the raw FM object
    // For now we'll just check required fields manually or fix the legacy validator
  },

  onAssemble(units, ctx) {
    // Unique Slugs
    const slugMap = new Map<string, string>();
    for (const unit of units) {
      const slug = unit.metadata?.slug || "";
      if (slugMap.has(slug)) {
        ctx.error("slugs", unit.relPath, `Duplicate slug: "${slug}"`, `Also used by ${slugMap.get(slug)}`);
      } else {
        slugMap.set(slug, unit.relPath);
      }
    }

    // Internal Links
    const knownSlugs = new Set(units.map(u => u.metadata?.slug || ""));
    for (const unit of units) {
      // Logic from validateInternalLinks
      const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(unit.rawContent)) !== null) {
        const href = match[2];
        if (href !== undefined && href.startsWith("/docs/")) {
          const slug = (href.replace("/docs/", "").split("#")[0] || "").split("?")[0] || "";
          if (!knownSlugs.has(slug)) {
            ctx.warn("links", unit.relPath, `Broken link: ${href}`, `Slug "${slug}" not found.`);
          }
        }
      }
    }
  }
};
