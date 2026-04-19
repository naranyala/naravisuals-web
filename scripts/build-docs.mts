/**
 * Documentation Build Entry Point (v2 - Compiler Engine)
 */

import { createHighlighter } from "shiki";
import { paths } from "./core/index.ts";
import { DocumentationCompiler } from "./compiler/Engine.ts";
import { pluginMiddleware, validationMiddleware } from "./compiler/Middlewares.ts";
import { mermaidDeepValidator } from "./compiler/middlewares/MermaidDeepValidator.ts";

async function runBuild() {
  const highlighter = await createHighlighter({
    themes: ["github-dark"],
    langs: [
      "typescript", "javascript", "python", "bash", "json", 
      "html", "css", "docker", "yaml", "markdown", "tsx", "jsx", "mermaid"
    ],
  });

  const compiler = new DocumentationCompiler({
    docsDir: paths.root + "/docs",
    blogDir: paths.root + "/blog",
    outputDir: paths.root + "/src/generated",
    siteUrl: "https://your-docs-site.com",
    mobileBreakpoint: 800,
    tocBreakpoint: 1100,
  }, highlighter);

  compiler
    .use(pluginMiddleware)
    .use(mermaidDeepValidator)
    .use(validationMiddleware);

  try {
    await compiler.compile();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runBuild();
