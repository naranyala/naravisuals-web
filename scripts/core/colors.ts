/**
 * Unified color palette for terminal output
 * Single source of truth for all CLI colors
 */

export const colors = {
  // Reset
  reset: "\x1b[0m",

  // Styles
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Foreground colors
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // Background colors
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
} as const;

export type ColorKey = keyof typeof colors;

export function c(text: string, ...colorKeys: ColorKey[]): string {
  if (colorKeys.length === 0) return text;
  const start = colorKeys.map((k) => colors[k]).join("");
  return `${start}${text}${colors.reset}`;
}

export function line(char: string, width: number, color: ColorKey = "reset"): string {
  return c(char.repeat(width), color);
}
