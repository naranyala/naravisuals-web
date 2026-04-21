import { type Static, Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

/**
 * Strict Frontmatter Schema for Documentation
 */
export const FrontmatterSchema = Type.Object({
  title: Type.String({
    minLength: 5,
    description: "The title of the document. Should be descriptive.",
  }),
  description: Type.String({
    minLength: 10,
    maxLength: 300,
    description: "Brief summary for SEO and previews.",
  }),
  sidebar_label: Type.Optional(
    Type.String({
      description: "Short label for the sidebar navigation.",
    })
  ),
  sidebar_position: Type.Optional(
    Type.Number({
      minimum: 0,
      description: "Ordering weight in the sidebar.",
    })
  ),
  date: Type.Optional(
    Type.String({
      format: "date-time",
      description: "Publication date.",
    })
  ),
  author: Type.Optional(
    Type.String({
      description: "Author name.",
    })
  ),
  tags: Type.Optional(
    Type.Array(Type.String(), {
      description: "Topics or categories for the network graph.",
      minItems: 1,
    })
  ),
  slug: Type.Optional(
    Type.String({
      description: "Custom URL slug override.",
    })
  ),
  category: Type.Optional(
    Type.String({
      description: "Logical category (usually derived from folder).",
    })
  ),
});

export type Frontmatter = Static<typeof FrontmatterSchema>;

// Compile the schema for high-performance validation
export const frontmatterValidator = TypeCompiler.Compile(FrontmatterSchema);
