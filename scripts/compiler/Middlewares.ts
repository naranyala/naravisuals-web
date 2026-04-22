/**
 * Default middlewares for the Documentation Compiler.
 */

function stripCodeBlocks(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let fenceLength = 0;
  let inCodeBlock = false;

  for (const line of lines) {
    const match = line.match(/^(`{3,})/);
    if (match?.[1]) {
      const length = match[1].length;
      if (!inCodeBlock) {
        inCodeBlock = true;
        fenceLength = length;
        continue;
      } else if (length >= fenceLength) {
        inCodeBlock = false;
        continue;
      }
    }
    if (!inCodeBlock) {
      result.push(line);
    }
  }
  return result.join("\n");
}

import { plugins } from "../plugins/index.ts";
import { validators as granularValidators } from "../plugins/validators/index.ts";
import { frontmatterValidator } from "./FrontmatterSchema.ts";
import type { CompilerMiddleware } from "./Middleware.ts";

export const pluginMiddleware: CompilerMiddleware = {
  name: "markdown-plugins",

  async onPreParse(unit) {
    for (const plugin of plugins) {
      if (plugin.preProcess && unit.content !== undefined && unit.content !== null) {
        unit.content = plugin.preProcess(unit.content);
      }
    }
  },

  async onPostProcess(unit) {
    for (let i = plugins.length - 1; i >= 0; i--) {
      const plugin = plugins[i];
      if (plugin?.postProcess && unit.html !== undefined && unit.html !== null) {
        unit.html = await (plugin.postProcess as any)(unit.html);
      }
    }
  },
};

export const validationMiddleware: CompilerMiddleware = {
  name: "validation",

  onIngest(unit, container) {
    // Basic path validation
    if (unit.relPath.includes(" ")) {
      container.context.warn(
        "slugs",
        unit.relPath,
        "Filename contains spaces. This is discouraged for SEO."
      );
    }
  },

  onPreParse(unit, container) {
    // Validate frontmatter using TypeBox schema
    const fm = unit.rawMetadata || {};

    // For validation, we need to convert some fields to numbers if they are strings
    // because our naive parser often returns everything as strings.
    const toValidate = { ...fm };
    if (typeof toValidate.sidebar_position === "string") {
      toValidate.sidebar_position = Number.parseInt(toValidate.sidebar_position, 10);
    }

    const isValid = frontmatterValidator.Check(toValidate);

    if (!isValid) {
      const errors = [...frontmatterValidator.Errors(toValidate)];
      for (const error of errors) {
        const path = error.path.slice(1); // remove leading /
        container.context.error(
          "frontmatter",
          unit.relPath,
          `Invalid frontmatter field: "${path}"`,
          `${error.message} (Value: ${JSON.stringify(error.value)})`
        );
      }
    }

    // Strict warning for missing tags (required for the network graph visuals)
    if (!fm.tags || (Array.isArray(fm.tags) && fm.tags.length === 0)) {
      container.context.warn(
        "frontmatter",
        unit.relPath,
        "Missing or empty field: tags",
        "Tags are required for the frontmatter network graph visuals."
      );
    }
  },

  async onTransform(unit, container) {
    const content = unit.content || "";
    const relPath = unit.relPath;

    // Run all registered granular markdown validators
    for (const validator of granularValidators) {
      const result = await validator.validate(content, relPath);
      for (const issue of result.issues) {
        if (issue.severity === "error") {
          container.context.error("content", relPath, issue.message, issue.detail);
        } else if (issue.severity === "warning") {
          container.context.warn("content", relPath, issue.message, issue.detail);
        }
      }
    }

    // Header Hierarchy Check
    const contentWithoutCodeBlocks = stripCodeBlocks(content);
    const headerRegex = /^(#{1,6})\s+/gm;
    let lastLevel = 0;
    let match: RegExpExecArray | null;
    // biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop
    while ((match = headerRegex.exec(contentWithoutCodeBlocks)) !== null) {
      const group = match[1];
      if (group) {
        const level = group.length;
        if (level > lastLevel + 1 && lastLevel > 0) {
          container.context.warn(
            "content",
            relPath,
            `Skipped header level: h${lastLevel} to h${level}`,
            "Headers should follow a logical hierarchy (h1 > h2 > h3)."
          );
        }
        lastLevel = level;
      }
    }
  },

  onAssemble(units, container) {
    // Unique Slugs
    const slugMap = new Map<string, string>();
    for (const unit of units) {
      const slug = unit.metadata?.slug || "";
      if (slugMap.has(slug)) {
        container.context.error(
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
      const matches = Array.from(unit.rawContent.matchAll(linkRegex));
      for (const match of matches) {
        const href = match[2];
        if (href?.startsWith("/docs/")) {
          const slug = (href.replace("/docs/", "").split("#")[0] || "").split("?")[0] || "";
          if (!knownSlugs.has(slug)) {
            container.context.warn(
              "links",
              unit.relPath,
              `Broken link: ${href}`,
              `Slug "${slug}" not found.`
            );
          }
        }
      }
    }
  },
};
