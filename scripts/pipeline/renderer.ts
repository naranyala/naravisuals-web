/**
 * Custom marked renderer and code block parsing.
 */

import { marked } from "marked";
import type { Highlighter } from "shiki";
import type { CodeBlockMeta } from "./types.ts";
import { slugifyHeading } from "./utils.ts";

/**
 * Parse code fence info string → metadata
 */
export function parseCodeInfo(info: string | undefined): CodeBlockMeta {
  if (!info) return { lang: "", copy: true, zoom: true };

  let lang = "";
  let rest = "";

  // 1. Try to parse the new syntax: lang { key="value" }
  const braceMatch = info.match(/^([^\s{]+)\s*\{([\s\S]*)\}\s*$/);
  if (braceMatch && braceMatch[1] !== undefined && braceMatch[2] !== undefined) {
    lang = braceMatch[1].trim();
    rest = braceMatch[2].trim();

    const titleMatch = rest.match(
      /title\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^"'\s{}]+))/
    );
    const descMatch = rest.match(
      /desc(?:ription)?\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^"'\s{}]+))/
    );
    const labelMatch = rest.match(
      /label\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^"'\s{}]+))/
    );
    const copyMatch = rest.match(/copy\s*=\s*["']?(true|false)["']?/i);
    const zoomMatch = rest.match(/zoom\s*=\s*["']?(true|false)["']?/i);

    return {
      lang,
      title: titleMatch ? (titleMatch[1] || titleMatch[2] || titleMatch[3] || "").trim() : "",
      desc: descMatch ? (descMatch[1] || descMatch[2] || descMatch[3] || "").trim() : "",
      label: labelMatch ? (labelMatch[1] || labelMatch[2] || labelMatch[3] || "").trim() : "",
      copy: copyMatch ? copyMatch[1]?.toLowerCase() === "true" : true,
      zoom: zoomMatch ? zoomMatch[1]?.toLowerCase() === "true" : true,
    };
  }

  // 2. Fall back to existing colon syntax: lang:key=value
  const colonIndex = info.indexOf(":");
  if (colonIndex === 0) {
    lang = "text";
  } else {
    lang = colonIndex > 0 ? info.slice(0, colonIndex).trim() : info.trim();
  }

  // Canonicalize common text languages
  const lowerLang = lang.toLowerCase();
  if (["txt", "text", "plain", "plaintext", ""].includes(lowerLang)) {
    lang = "text";
  }

  if (colonIndex === -1) return { lang, copy: true, zoom: true };

  rest = info.slice(colonIndex + 1);
  const titleMatch = rest.match(/(?:^|:)\s*title\s*=\s*([^:]+?)\s*(?=:|$)/);
  const descMatch = rest.match(/(?:^|:)\s*desc(?:ription)?\s*=\s*([^:]+?)\s*(?=:|$)/);
  const labelMatch = rest.match(/(?:^|:)\s*label\s*=\s*([^:]+?)\s*(?=:|$)/);
  const copyMatch = rest.match(/(?:^|:)\s*copy\s*=\s*(true|false)\s*(?=:|$)/i);
  const zoomMatch = rest.match(/(?:^|:)\s*zoom\s*=\s*(true|false)\s*(?=:|$)/i);

  return {
    lang,
    title: titleMatch ? (titleMatch[1] || "").trim().replace(/["'\s]+$/, "") : "",
    desc: descMatch ? (descMatch[1] || "").trim().replace(/["'\s]+$/, "") : "",
    label: labelMatch ? (labelMatch[1] || "").trim().replace(/["'\s]+$/, "") : "",
    copy: copyMatch ? copyMatch[1]?.toLowerCase() === "true" : true,
    zoom: zoomMatch ? zoomMatch[1]?.toLowerCase() === "true" : true,
  };
}

export function codeBlockWrapper(inner: string, meta: CodeBlockMeta) {
  const langLabel =
    meta.label || (meta.lang ? meta.lang.charAt(0).toUpperCase() + meta.lang.slice(1) : "");
  const titleHtml = meta.title
    ? `<span class="code-title">${meta.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`
    : "";
  const descHtml = meta.desc
    ? `<div class="code-desc">${meta.desc.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`
    : "";
  const copyBtnHtml =
    meta.copy !== false
      ? `<button class="code-copy-btn" aria-label="Copy code" onclick="copyCode(this)">Copy</button>`
      : "";

  return [
    `<div class="code-block" data-lang="${meta.lang}" data-copy="${meta.copy !== false}" data-zoom="${meta.zoom !== false}">`,
    `<div class="code-header"><span class="code-lang">${langLabel}</span>${titleHtml}${copyBtnHtml}</div>`,
    inner,
    descHtml,
    `</div>`,
  ].join("");
}

export function createCustomRenderer(highlighter: Highlighter) {
  const renderer = new marked.Renderer();
  const seenIds = new Set<string>();

  renderer.heading = ({ text, depth }) => {
    let id = slugifyHeading(text);
    let suffix = 1;
    const originalId = id;
    while (seenIds.has(id)) {
      id = `${originalId}-${suffix++}`;
    }
    seenIds.add(id);

    return `<h${depth} id="${id}">${text}<a class="hash-link" href="#${id}" aria-label="${text} permalink">#</a></h${depth}>`;
  };

  renderer.code = ({ text, lang: rawLang }) => {
    const meta = parseCodeInfo(rawLang);

    // Skip Shiki for all mermaid types and technical diagrams
    const mermaidTypes = [
      "mermaid",
      "graph",
      "flowchart",
      "sequenceDiagram",
      "classDiagram",
      "stateDiagram",
      "erDiagram",
      "gantt",
      "pie",
      "quadrantChart",
      "xyChart",
      "mindmap",
      "timeline",
      "journey",
      "requirementDiagram",
      "gitGraph",
      "sankey",
    ];

    const lowerLang = meta.lang.toLowerCase();
    if (mermaidTypes.includes(lowerLang) || ["timeline", "text (timeline)"].includes(lowerLang)) {
      const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return codeBlockWrapper(
        `<pre><code class="language-${meta.lang || ""}">${escaped}</code></pre>`,
        meta
      );
    }

    if (meta.lang && highlighter.getLoadedLanguages().includes(meta.lang as any)) {
      const highlighted = highlighter.codeToHtml(text, { lang: meta.lang, theme: "github-dark" });
      return codeBlockWrapper(highlighted, meta);
    }
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return codeBlockWrapper(
      `<pre><code class="language-${meta.lang || ""}">${escaped}</code></pre>`,
      meta
    );
  };

  return renderer;
}
