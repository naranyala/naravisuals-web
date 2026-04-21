/**
 * Shared types for the documentation build pipeline.
 * Derived from TypeBox schemas for runtime and build-time safety.
 */

import {
  type DocEntry,
  type SidebarItem,
  type SidebarDocItem,
  type SidebarCategoryItem,
  type TocItem,
  type AppConfig,
} from "../../src/shared/schemas.ts";

export type {
  DocEntry,
  SidebarItem,
  SidebarDocItem,
  SidebarCategoryItem,
  TocItem,
  AppConfig,
};

export interface CodeBlockMeta {
  lang: string;
  title?: string;
  desc?: string;
  label?: string;
  copy?: boolean;
  zoom?: boolean;
}
