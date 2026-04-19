/**
 * Compiler Middleware System
 */

import type { CompilationContext } from "./Context.ts";
import type { CompilationUnit } from "./types.ts";

export interface CompilerMiddleware {
  name: string;

  /** Run during file discovery, before any parsing */
  onIngest?(unit: CompilationUnit, ctx: CompilationContext): Promise<void> | void;

  /** Run after frontmatter is parsed but before markdown lexing */
  onPreParse?(unit: CompilationUnit, ctx: CompilationContext): Promise<void> | void;

  /** Run after marked lexing, before rendering to HTML */
  onTransform?(unit: CompilationUnit, ctx: CompilationContext): Promise<void> | void;

  /** Run after HTML is generated */
  onPostProcess?(unit: CompilationUnit, ctx: CompilationContext): Promise<void> | void;

  /** Run after all units are processed (for global analysis) */
  onAssemble?(units: CompilationUnit[], ctx: CompilationContext): Promise<void> | void;
}
