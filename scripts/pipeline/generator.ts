/**
 * File generation logic for the documentation site.
 */

import * as path from "node:path";
import type { CompilerContainer } from "../compiler/container.ts";
import type { DocEntry, SidebarItem } from "./types.ts";
import { slugToFilename, slugToVarName } from "./utils.ts";

export function generateTypes(container: CompilerContainer) {
  const content = `// AUTO-GENERATED — DO NOT EDIT.
export type { 
  DocEntry, 
  TocItem, 
  SidebarItem, 
  SidebarDocItem, 
  SidebarCategoryItem 
} from "../shared/schemas";
`;
  container.fs.write(path.join(container.config.outputDir, "types.ts"), content);
}

export function cleanGeneratedDir(container: CompilerContainer, dir: string) {
  if (container.fs.exists(dir)) {
    container.fs.rm(dir, { recursive: true, force: true });
  }
  container.fs.mkdir(dir, { recursive: true });
}

export function generateSidebar(container: CompilerContainer, sidebar: SidebarItem[]) {
  const content = `// AUTO-GENERATED — DO NOT EDIT.
import type { SidebarItem } from "@/generated/types";
export const sidebarData: SidebarItem[] = ${JSON.stringify(sidebar, null, 2)};
`;
  container.fs.write(path.join(container.config.outputDir, "sidebar.ts"), content);
}

export function generateDocFiles(
  container: CompilerContainer,
  genDocsDir: string,
  allDocs: DocEntry[]
) {
  for (const d of allDocs) {
    const filename = slugToFilename(d.id);
    const content = `// AUTO-GENERATED — DO NOT EDIT.
import type { DocEntry } from "@/generated/types";

export const ${slugToVarName(d.id)}: DocEntry = ${JSON.stringify(d, null, 2)};
`;
    container.fs.write(path.join(genDocsDir, `${filename}.ts`), content);
  }
}

export function generateBarrelExports(
  container: CompilerContainer,
  genDocsDir: string,
  allDocs: DocEntry[]
) {
  // 1. docs/index.ts
  const docsIndexContent = `// AUTO-GENERATED — DO NOT EDIT.
import type { DocEntry } from "@/generated/types";
${allDocs.map((d) => `import { ${slugToVarName(d.id)} } from "./${slugToFilename(d.id)}";`).join("\n")}

export {
  ${allDocs.map((d) => slugToVarName(d.id)).join(",\n  ")},
};

export const allDocs: DocEntry[] = [
  ${allDocs.map((d) => slugToVarName(d.id)).join(",\n  ")},
];
`;
  container.fs.write(path.join(genDocsDir, "index.ts"), docsIndexContent);

  // 2. index.ts
  const topIndexContent = `// AUTO-GENERATED — DO NOT EDIT.

export { sidebarData } from "./sidebar";
export { allDocs } from "./docs/index";
export { wordStats, filteredStats } from "./word-stats";
export type { DocEntry, TocItem, SidebarItem, SidebarDocItem, SidebarCategoryItem } from "./types";
`;
  container.fs.write(path.join(container.config.outputDir, "index.ts"), topIndexContent);
}

export function generateSeoFiles(container: CompilerContainer, allDocs: DocEntry[]) {
  const { config } = container;
  const rootDir = path.dirname(config.outputDir);
  const siteUrl = config.siteUrl;
  const today = new Date().toISOString().split("T")[0];

  // Sitemap
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

  for (const doc of allDocs) {
    const url =
      doc.section === "blog"
        ? `${siteUrl}/blog/${doc.slug.replace("blog/", "")}`
        : `${siteUrl}/docs/${doc.slug}`;

    sitemapXml += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }
  sitemapXml += `</urlset>\n`;
  container.fs.write(path.join(rootDir, "sitemap.xml"), sitemapXml);

  // Robots.txt
  const robotsTxt = `# robots.txt
User-agent: *
Allow: /
Sitemap: ${siteUrl}/sitemap.xml
`;
  container.fs.write(path.join(rootDir, "robots.txt"), robotsTxt);
}
