/**
 * Documentation Build Entry Point (v2 - Compiler Engine)
 */

import { paths } from "./core/index.ts";
import { DocumentationCompiler } from "./compiler/Engine.ts";
import { pluginMiddleware, validationMiddleware } from "./compiler/Middlewares.ts";
import { mermaidDeepValidator } from "./compiler/middlewares/MermaidDeepValidator.ts";

async function runBuild() {
  const compiler = new DocumentationCompiler({
    docsDir: paths.root + "/docs",
    outputDir: paths.root + "/src/generated",
    siteUrl: "https://your-docs-site.com",
    mobileBreakpoint: 800,
    tocBreakpoint: 1100,
  }, null as any);

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
