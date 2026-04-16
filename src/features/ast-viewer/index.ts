/**
 * AST Viewer Feature
 *
 * Optional debug feature for viewing the Abstract Syntax Tree (AST)
 * of markdown documents. Useful for development and debugging markdown parsing.
 *
 * This feature is optional and can be disabled in production.
 */

export { ASTViewer } from "./ASTViewer";
export * from "./ast-parser";

export const AST_VIEWER_ENABLED = process.env.NODE_ENV === "development";
