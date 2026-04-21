/**
 * Dependency Injection Container for the Compiler Engine
 */

import * as fs from "node:fs";
import type { Highlighter } from "shiki";
import { Logger, LogLevel } from "../core/logger.ts";
import { CompilationContext } from "./Context.ts";
import { MarkdownRenderer } from "./Renderer.ts";
import type { CompilerConfig } from "./types.ts";

// ─── Service Interfaces ───────────────────────────────────────────────────

export interface IFileSystem {
  read(path: string): string;
  write(path: string, content: string): void;
  exists(path: string): boolean;
  mkdir(path: string, options?: { recursive: boolean }): void;
  rm(path: string, options?: { recursive: boolean; force: boolean }): void;
}

export interface CompilerContainer {
  config: CompilerConfig;
  logger: Logger;
  context: CompilationContext;
  renderer: MarkdownRenderer;
  fs: IFileSystem;
}

// ─── Default Implementations ──────────────────────────────────────────────

export const createDefaultFileSystem = (): IFileSystem => ({
  read: (p) => fs.readFileSync(p, "utf-8"),
  write: (p, c) => fs.writeFileSync(p, c, "utf-8"),
  exists: (p) => fs.existsSync(p),
  mkdir: (p, o) => fs.mkdirSync(p, o),
  rm: (p, o) => fs.rmSync(p, o),
});

// ─── Container Builder ────────────────────────────────────────────────────

export interface ContainerOptions {
  config: CompilerConfig;
  highlighter?: Highlighter;
  logger?: Logger;
  fs?: IFileSystem;
}

/**
 * Build a compiler service container
 */
export function createCompilerContainer(options: ContainerOptions): CompilerContainer {
  const logger = options.logger ?? new Logger(LogLevel.Info);
  const fileSystem = options.fs ?? createDefaultFileSystem();
  const context = new CompilationContext(options.config);
  const renderer = new MarkdownRenderer(options.highlighter);

  return {
    config: options.config,
    logger,
    context,
    renderer,
    fs: fileSystem,
  };
}
