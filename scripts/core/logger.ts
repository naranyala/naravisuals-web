/**
 * Unified logger for consistent output across all scripts
 * Centralized logging with severity levels
 */

import { c, colors } from "./colors.ts";

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  Success = 4,
}

export class Logger {
  private level: LogLevel = LogLevel.Info;

  constructor(minLevel: LogLevel = LogLevel.Info) {
    this.level = minLevel;
  }

  private log(message: string): void {
    console.log(message);
  }

  debug(message: string): void {
    if (this.level <= LogLevel.Debug) {
      this.log(c(message, "dim", "gray"));
    }
  }

  info(message: string): void {
    if (this.level <= LogLevel.Info) {
      this.log(c(message, "cyan", "bright"));
    }
  }

  success(message: string): void {
    if (this.level <= LogLevel.Success) {
      this.log(c(`✓ ${message}`, "green", "bright"));
    }
  }

  warn(message: string): void {
    if (this.level <= LogLevel.Warn) {
      this.log(c(`⚠ ${message}`, "yellow", "bright"));
    }
  }

  error(message: string): void {
    if (this.level <= LogLevel.Error) {
      this.log(c(`✖ ${message}`, "red", "bright"));
    }
  }

  blank(): void {
    this.log("");
  }

  section(title: string, subtitle?: string): void {
    this.blank();
    const width = 80;
    this.log(c("─".repeat(width), "cyan"));
    this.log(c(title, "cyan", "bright"));
    if (subtitle) {
      this.log(c(subtitle, "dim"));
    }
    this.log(c("─".repeat(width), "cyan"));
    this.blank();
  }

  group(title: string): void {
    this.blank();
    this.log(c(`▸ ${title}`, "bright", "cyan"));
    this.blank();
  }

  raw(message: string, color?: string): void {
    if (color) {
      console.log(`${color}${message}${colors.reset}`);
    } else {
      console.log(message);
    }
  }

  step(message: string): void {
    this.raw(`\n${colors.bright}${colors.cyan}▸ ${message}${colors.reset}`);
  }
}

export const logger = new Logger();
