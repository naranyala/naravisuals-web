/**
 * Core types for the Documentation Compiler Engine.
 */

import type { Token } from "marked";

export type DiagnosticSeverity = "error" | "warning" | "info";
export type DiagnosticSource =
  | "frontmatter"
  | "links"
  | "slugs"
  | "plugin"
  | "content"
  | "build"
  | "admonitions";

export interface Diagnostic {
  severity: DiagnosticSeverity;
  source: DiagnosticSource;
  file: string;
  message: string;
  line?: number;
  detail?: string;
}

export interface TocItem {
  value: string;
  id: string;
  level: number;
}

export interface DocMetadata {
  title: string;
  description: string;
  sidebar_label: string;
  sidebar_position: number;
  category: string;
  original_category?: string;
  date?: string;
  author?: string;
  tags?: string[];
  slug: string;
  custom?: Record<string, string | string[]>;
}

/**
 * Represents a single document in the compilation pipeline.
 */
export interface CompilationUnit {
  id: string;
  filePath: string;
  relPath: string;
  rawContent: string;
  rawMetadata?: Record<string, unknown>;
  content?: string;
  html?: string;
  metadata?: DocMetadata;
  toc?: TocItem[];
  tokens?: Token[];
  section: "docs" | "blog";
  hash?: string;
}

export interface CompilerConfig {
  docsDir: string;
  outputDir: string;
  siteUrl: string;
  mobileBreakpoint: number;
  tocBreakpoint: number;
}
