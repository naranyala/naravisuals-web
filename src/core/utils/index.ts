/**
 * Core utility functions
 *
 * Pure, side-effect-free utility functions used throughout the application.
 */

// ─── String Utilities ─────────────────────────────────────────────────────

/**
 * Replace all placeholders in a URL template with an encoded query
 */
export function formatSearchUrl(template: string, query: string): string {
  return template.replaceAll("%s", encodeURIComponent(query));
}

/**
 * Slugify a string (convert to URL-friendly format)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Convert a slug back to a readable title
 */
export function deslugify(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number, suffix = "..."): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Strip sorting prefix from a title (e.g., "01-Introduction" -> "Introduction")
 */
export function stripTitlePrefix(text: string): string {
  return text.replace(/^[\d\W]+[- ]/, "");
}

/**
 * Check if a string is URL
 */
export function isUrl(text: string): boolean {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

// ─── Array Utilities ──────────────────────────────────────────────────────

/**
 * Remove duplicates from an array
 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Group array items by a key function
 */
export function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  for (const item of arr) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

/**
 * Flatten nested arrays
 */
export function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((acc, val) => acc.concat(val), []);
}

/**
 * Partition array into two based on a predicate
 */
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  for (const item of arr) {
    (predicate(item) ? truthy : falsy).push(item);
  }
  return [truthy, falsy];
}

// ─── Object Utilities ─────────────────────────────────────────────────────

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isPlainObject(target) && isPlainObject(source)) {
    for (const key in source) {
      if (isPlainObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key] as any);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Check if value is a plain object
 */
export function isPlainObject(obj: unknown): obj is Record<string, any> {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

/**
 * Get nested value from object using dot notation
 */
export function getNestedValue<T = unknown>(
  obj: Record<string, any>,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split(".");
  let result: any = obj;
  for (const key of keys) {
    result = result?.[key];
  }
  return result !== undefined ? result : defaultValue;
}

// ─── Number Utilities ─────────────────────────────────────────────────────

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round a number to a specific number of decimal places
 */
export function round(value: number, decimals: number = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Convert bytes to human-readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

// ─── Time Utilities ───────────────────────────────────────────────────────

/**
 * Format a date as ISO string
 */
export function formatDate(date: Date, format = "YYYY-MM-DD"): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  return format
    .replace("YYYY", String(yyyy))
    .replace("MM", mm)
    .replace("DD", dd)
    .replace("HH", hh)
    .replace("mm", mi)
    .replace("ss", ss);
}

/**
 * Get time ago string (e.g., "2 hours ago")
 */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  let interval = seconds / 31536000;

  if (interval >= 1) return `${Math.floor(interval)} years ago`;
  interval = seconds / 2592000;
  if (interval >= 1) return `${Math.floor(interval)} months ago`;
  interval = seconds / 86400;
  if (interval >= 1) return `${Math.floor(interval)} days ago`;
  interval = seconds / 3600;
  if (interval >= 1) return `${Math.floor(interval)} hours ago`;
  interval = seconds / 60;
  if (interval >= 1) return `${Math.floor(interval)} minutes ago`;
  return `${Math.floor(seconds)} seconds ago`;
}

// ─── DOM Utilities ────────────────────────────────────────────────────────

/**
 * Get element's bounding rect relative to viewport
 */
export function getElementBounds(el: Element) {
  return el.getBoundingClientRect();
}

/**
 * Check if element is in viewport
 */
export function isInViewport(el: Element, offset = 0): boolean {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= -offset &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight + offset &&
    rect.right <= window.innerWidth
  );
}

/**
 * Add/remove class with optional condition
 */
export function toggleClass(el: Element, className: string, force?: boolean): void {
  el.classList.toggle(className, force);
}

/**
 * Get computed style value
 */
export function getStyle(el: Element, property: string): string {
  return window.getComputedStyle(el).getPropertyValue(property);
}

// ─── Validation Utilities ─────────────────────────────────────────────────

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Check if all items in array pass predicate
 */
export function allPass<T>(arr: T[], predicate: (item: T) => boolean): boolean {
  return arr.every(predicate);
}

/**
 * Check if any item in array passes predicate
 */
export function anyPass<T>(arr: T[], predicate: (item: T) => boolean): boolean {
  return arr.some(predicate);
}

// ─── Cache Utilities ──────────────────────────────────────────────────────

/**
 * Simple memoization function
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Create a debounced version of a function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Create a throttled version of a function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ─── Promise Utilities ────────────────────────────────────────────────────

/**
 * Wait for a specific amount of time
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Race multiple promises with a timeout
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs)),
  ]);
}

// ─── Type Guards ──────────────────────────────────────────────────────────

/**
 * Check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if value is string
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Check if value is number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

/**
 * Check if value is boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Check if value is array
 */
export function isArray(value: unknown): value is any[] {
  return Array.isArray(value);
}
