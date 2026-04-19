/**
 * File generation logic for the documentation site.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { DocEntry, SidebarItem } from "./types.ts";
import { slugToFilename, slugToVarName } from "./utils.ts";

export function cleanGeneratedDir(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

export function generateSidebar(genDir: string, sidebar: SidebarItem[]) {
  const content = `// AUTO-GENERATED — DO NOT EDIT.
export const sidebarData: any[] = ${JSON.stringify(sidebar, null, 2)};
`;
  fs.writeFileSync(path.join(genDir, "sidebar.ts"), content, "utf-8");
}

export function generateDocFiles(genDocsDir: string, allDocs: DocEntry[]) {
  for (const d of allDocs) {
    const filename = slugToFilename(d.id);
    const content = `// AUTO-GENERATED — DO NOT EDIT.
import type { DocEntry } from "../types.ts";

export const ${slugToVarName(d.id)}: DocEntry = ${JSON.stringify(d, null, 2)};
`;
    fs.writeFileSync(path.join(genDocsDir, `${filename}.ts`), content, "utf-8");
  }
}

export function generateBarrelExports(genDir: string, genDocsDir: string, allDocs: DocEntry[]) {
  // 1. docs/index.ts
  const docsIndexContent = `// AUTO-GENERATED — DO NOT EDIT.
import type { DocEntry } from "../types.ts";
${allDocs.map((d) => `import { ${slugToVarName(d.id)} } from "./${slugToFilename(d.id)}.ts";`).join("\n")}

export {
  ${allDocs.map((d) => slugToVarName(d.id)).join(",\n  ")},
};

export const allDocs: DocEntry[] = [
  ${allDocs.map((d) => slugToVarName(d.id)).join(",\n  ")},
];
`;
  fs.writeFileSync(path.join(genDocsDir, "index.ts"), docsIndexContent, "utf-8");

  // 2. index.ts
  const topIndexContent = `// AUTO-GENERATED — DO NOT EDIT.
import "./clipboard.ts";

export { sidebarData } from "./sidebar.ts";
export { allDocs } from "./docs/index.ts";
export type { DocEntry } from "./types.ts";
`;
  fs.writeFileSync(path.join(genDir, "index.ts"), topIndexContent, "utf-8");
}

export function generateSeoFiles(rootDir: string, allDocs: DocEntry[], siteUrl: string) {
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
    const url = doc.section === "blog" 
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
  fs.writeFileSync(path.join(rootDir, "sitemap.xml"), sitemapXml, "utf-8");

  // Robots.txt
  const robotsTxt = `# robots.txt
User-agent: *
Allow: /
Sitemap: ${siteUrl}/sitemap.xml
`;
  fs.writeFileSync(path.join(rootDir, "robots.txt"), robotsTxt, "utf-8");
}
