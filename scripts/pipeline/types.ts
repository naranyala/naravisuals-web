/**
 * Shared types for the documentation build pipeline.
 */

export interface DocEntry {
  id: string;
  slug: string;
  title: string;
  sidebar_label: string;
  sidebar_position: number;
  category: string;
  original_category?: string;
  description: string;
  content: string;
  rawContent: string;
  toc: TocItem[];
  date?: string;
  author?: string;
  tags?: string[];
  section: "docs" | "blog";
  metadata?: Record<string, string | string[]>;
  ast?: any[];
}

export interface TocItem {
  value: string;
  id: string;
  level: number;
}

export interface SidebarDocItem {
  type: "doc";
  id: string;
  label: string;
  slug: string;
  category?: string;
  date?: string;
}

export interface SidebarCategoryItem {
  type: "category";
  label: string;
  link?: { type: string; id: string };
  items: SidebarDocItem[];
}

export type SidebarItem = SidebarDocItem | SidebarCategoryItem;

export interface CodeBlockMeta {
  lang: string;
  title?: string;
  desc?: string;
  label?: string;
  copy?: boolean;
  zoom?: boolean;
}
