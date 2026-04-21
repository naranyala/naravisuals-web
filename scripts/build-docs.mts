/**
 * Documentation Build Entry Point (v2 - Compiler Engine)
 */

import { createHighlighter } from "shiki";
import { DocumentationCompiler } from "./compiler/Engine";
import { pluginMiddleware, validationMiddleware } from "./compiler/Middlewares";
import { mermaidDeepValidator } from "./compiler/middlewares/MermaidDeepValidator";
import { paths } from "./core/index";

async function runBuild() {
  const highlighter = await createHighlighter({
    themes: ["github-dark"],
    langs: [
      "typescript",
      "javascript",
      "bash",
      "json",
      "rust",
      "python",
      "markdown",
      "yaml",
      "html",
      "css",
      "go",
      "cpp",
      "c",
      "sql",
      "toml",
      "dockerfile",
      "diff",
      "tsx",
      "jsx",
    ],
  });

  const compiler = new DocumentationCompiler(
    {
      docsDir: `${paths.root}/docs`,
      outputDir: `${paths.root}/src/generated`,
      siteUrl: "https://your-docs-site.com",
      mobileBreakpoint: 800,
      tocBreakpoint: 1100,
    },
    highlighter as any
  );

  compiler.use(pluginMiddleware).use(mermaidDeepValidator).use(validationMiddleware);

  try {
    await compiler.compile();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runBuild();
