/**
 * Default middlewares for the Documentation Compiler.
 */

import { plugins } from "../plugins/index.ts";
import { frontmatterValidator } from "./FrontmatterSchema.ts";
import type { CompilerMiddleware } from "./Middleware.ts";

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
  },
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
    // Validate frontmatter using TypeBox schema
    const fm = unit.rawMetadata || {};

    // For validation, we need to convert some fields to numbers if they are strings
    // because our naive parser often returns everything as strings.
    const toValidate = { ...fm };
    if (typeof toValidate["sidebar_position"] === "string") {
      toValidate["sidebar_position"] = Number.parseInt(toValidate["sidebar_position"], 10);
    }

    const isValid = frontmatterValidator.Check(toValidate);

    if (!isValid) {
      const errors = [...frontmatterValidator.Errors(toValidate)];
      for (const error of errors) {
        const path = error.path.slice(1); // remove leading /
        ctx.error(
          "frontmatter",
          unit.relPath,
          `Invalid frontmatter field: "${path}"`,
          `${error.message} (Value: ${JSON.stringify(error.value)})`
        );
      }
    }
  },

  onAssemble(units, ctx) {
    // Unique Slugs
    const slugMap = new Map<string, string>();
    for (const unit of units) {
      const slug = unit.metadata?.slug || "";
      if (slugMap.has(slug)) {
        ctx.error(
          "slugs",
          unit.relPath,
          `Duplicate slug: "${slug}"`,
          `Also used by ${slugMap.get(slug)}`
        );
      } else {
        slugMap.set(slug, unit.relPath);
      }
    }

    // Internal Links
    const knownSlugs = new Set(units.map((u) => u.metadata?.slug || ""));
    for (const unit of units) {
      // Logic from validateInternalLinks
      const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(unit.rawContent)) !== null) {
        const href = match[2];
        if (href?.startsWith("/docs/")) {
          const slug = (href.replace("/docs/", "").split("#")[0] || "").split("?")[0] || "";
          if (!knownSlugs.has(slug)) {
            ctx.warn("links", unit.relPath, `Broken link: ${href}`, `Slug "${slug}" not found.`);
          }
        }
      }
    }
  },
};
