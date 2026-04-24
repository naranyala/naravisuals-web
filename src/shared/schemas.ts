import { type Static, Type } from "@sinclair/typebox";

/**
 * Table of Contents Item Schema
 */
export const TocItemSchema = Type.Object({
  value: Type.String(),
  id: Type.String(),
  level: Type.Number({ minimum: 1, maximum: 6 }),
});

export type TocItem = Static<typeof TocItemSchema>;

/**
 * Documentation Entry Schema (The main data unit)
 */
export const DocEntrySchema = Type.Object({
  id: Type.String(),
  slug: Type.String(),
  title: Type.String(),
  sidebar_label: Type.String(),
  sidebar_position: Type.Number(),
  category: Type.String(),
  original_category: Type.Optional(Type.String()),
  description: Type.String(),
  content: Type.String(),
  rawContent: Type.String(),
  toc: Type.Array(TocItemSchema),
  date: Type.Optional(Type.String()),
  author: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String())),
  section: Type.Union([Type.Literal("docs"), Type.Literal("blog")]),
  metadata: Type.Optional(
    Type.Record(Type.String(), Type.Union([Type.String(), Type.Array(Type.String())]))
  ),
  ast: Type.Optional(Type.Array(Type.Any())),
});

export type DocEntry = Static<typeof DocEntrySchema>;

/**
 * Sidebar Navigation Schemas
 */
/**
 * Sidebar Navigation Schemas
 */
/**
 * Sidebar Navigation Schemas
 */
export const SidebarDocItemSchema = Type.Object({
  type: Type.Literal("doc"),
  id: Type.String(),
  label: Type.String(),
  slug: Type.String(),
  category: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  date: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

export const SidebarItemSchema = Type.Union([
  SidebarDocItemSchema,
  Type.Object({
    type: Type.Literal("category"),
    label: Type.String(),
    link: Type.Optional(
      Type.Object({
        type: Type.String(),
        id: Type.String(),
      })
    ),
    items: Type.Array(Type.Any()), // Use Type.Any to avoid circular reference in schema
    count: Type.Optional(Type.Number()),
  }),
]);

export type SidebarDocItem = Static<typeof SidebarDocItemSchema>;
export type SidebarCategoryItem = {
  type: "category";
  label: string;
  link?: { type: string; id: string };
  items: SidebarItem[];
  count?: number;
};
export type SidebarItem = Static<typeof SidebarItemSchema> | SidebarCategoryItem;

/**
 * App Configuration Schema
 */
export const AppConfigSchema = Type.Object({
  siteTitle: Type.String(),
  docsDir: Type.Optional(Type.String()),
  outputDir: Type.Optional(Type.String()),
  siteUrl: Type.String(),
  repoEditUrl: Type.String(),
  mobileBreakpoint: Type.Number(),
  tocBreakpoint: Type.Number(),
  routes: Type.Object({
    docs: Type.String(),
  }),
});

export type AppConfig = Static<typeof AppConfigSchema>;
