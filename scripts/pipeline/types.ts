/**
 * Shared types for the documentation build pipeline.
 * Derived from TypeBox schemas for runtime and build-time safety.
 */

import type {
  AppConfig,
  DocEntry,
  SidebarCategoryItem,
  SidebarDocItem,
  SidebarItem,
  TocItem,
} from "../../src/shared/schemas.ts";

export type { AppConfig, DocEntry, SidebarCategoryItem, SidebarDocItem, SidebarItem, TocItem };

export interface CodeBlockMeta {
  lang: string;
  title?: string;
  desc?: string;
  label?: string;
  copy?: boolean;
  zoom?: boolean;
}
