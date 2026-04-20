import { describe, expect, test } from "bun:test";
import * as utils from "../src/core/utils";

describe("Core Utilities", () => {
  describe("String Utilities", () => {
    test("slugify converts text to URL-friendly format", () => {
      expect(utils.slugify("Hello World!")).toBe("hello-world");
      expect(utils.slugify("  Hello   World  ")).toBe("hello-world");
      expect(utils.slugify("Hello_World-123")).toBe("hello-world-123");
    });

    test("deslugify converts slugs back to readable titles", () => {
      expect(utils.deslugify("hello-world")).toBe("Hello World");
      expect(utils.deslugify("my-awesome-doc")).toBe("My Awesome Doc");
    });

    test("truncate cuts text to max length", () => {
      expect(utils.truncate("Hello World", 5)).toBe("He...");
      expect(utils.truncate("Hello", 10)).toBe("Hello");
      expect(utils.truncate("Hello World", 5, "!»")).toBe("Hel!»");
    });

    test("capitalize first letter", () => {
      expect(utils.capitalize("hello")).toBe("Hello");
      expect(utils.capitalize("World")).toBe("World");
      expect(utils.capitalize("")).toBe("");
    });

    test("isUrl validates URLs", () => {
      expect(utils.isUrl("https://google.com")).toBe(true);
      expect(utils.isUrl("http://localhost:3000")).toBe(true);
      expect(utils.isUrl("not-a-url")).toBe(false);
      expect(utils.isUrl("ftp://server")).toBe(true);
    });
  });

  describe("Array Utilities", () => {
    test("unique removes duplicates", () => {
      expect(utils.unique([1, 1, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
      expect(utils.unique(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
    });

    test("groupBy groups items by key", () => {
      const items = [
        { name: "A", type: "fruit" },
        { name: "B", type: "vegetable" },
        { name: "C", type: "fruit" },
      ];
      const grouped = utils.groupBy(items, (i) => i.type);
      expect(grouped.fruit).toHaveLength(2);
      expect(grouped.vegetable).toHaveLength(1);
    });

    test("flatten flattens nested arrays", () => {
      expect(utils.flatten([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
    });

    test("partition splits array by predicate", () => {
      const nums = [1, 2, 3, 4, 5, 6];
      const [even, odd] = utils.partition(nums, (n) => n % 2 === 0);
      expect(even).toEqual([2, 4, 6]);
      expect(odd).toEqual([1, 3, 5]);
    });
  });

  describe("Object Utilities", () => {
    test("deepMerge merges objects recursively", () => {
      const target = { a: 1, b: { c: 2 } };
      const source = { b: { d: 3 }, e: 4 };
      const result = utils.deepMerge({ ...target }, source as any);
      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 } as any);
    });

    test("isPlainObject identifies plain objects", () => {
      expect(utils.isPlainObject({})).toBe(true);
      expect(utils.isPlainObject({ a: 1 })).toBe(true);
      expect(utils.isPlainObject([])).toBe(false);
      expect(utils.isPlainObject(null)).toBe(false);
      expect(utils.isPlainObject(new Date())).toBe(false);
    });

    test("getNestedValue retrieves deep values", () => {
      const obj = { a: { b: { c: 42 } } };
      expect(utils.getNestedValue(obj, "a.b.c")).toBe(42 as any);
      expect(utils.getNestedValue(obj, "a.x", "default")).toBe("default" as any);
      expect(utils.getNestedValue({}, "a.b.c")).toBeUndefined();
    });
  });

  describe("Number Utilities", () => {
    test("clamp restricts value", () => {
      expect(utils.clamp(5, 0, 10)).toBe(5);
      expect(utils.clamp(-5, 0, 10)).toBe(0);
      expect(utils.clamp(15, 0, 10)).toBe(10);
    });

    test("round to decimals", () => {
      expect(utils.round(1.2345, 2)).toBe(1.23);
      expect(utils.round(1.2355, 2)).toBe(1.24);
      expect(utils.round(1.2, 0)).toBe(1);
    });

    test("formatBytes converts bytes to readable string", () => {
      expect(utils.formatBytes(0)).toBe("0 Bytes");
      expect(utils.formatBytes(1024)).toBe("1 KB");
      expect(utils.formatBytes(1024 * 1024)).toBe("1 MB");
      expect(utils.formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
      expect(utils.formatBytes(1500, 0)).toBe("1 KB");
    });
  });

  describe("Time Utilities", () => {
    test("formatDate formats date correctly", () => {
      const date = new Date(2024, 0, 1, 12, 30, 45); // Jan 1, 2024 12:30:45
      expect(utils.formatDate(date, "YYYY-MM-DD")).toBe("2024-01-01");
      expect(utils.formatDate(date, "HH:mm:ss")).toBe("12:30:45");
    });

    test("timeAgo returns correct relative time", () => {
      const now = Date.now();
      const oneYearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
      const oneHourAgo = new Date(now - 60 * 60 * 1000);
      const oneMinAgo = new Date(now - 60 * 1000);
      const oneSecAgo = new Date(now - 1000);

      expect(utils.timeAgo(oneYearAgo)).toContain("year");
      expect(utils.timeAgo(oneMonthAgo)).toContain("month");
      expect(utils.timeAgo(oneDayAgo)).toContain("day");
      expect(utils.timeAgo(oneHourAgo)).toContain("hour");
      expect(utils.timeAgo(oneMinAgo)).toContain("minute");
      expect(utils.timeAgo(oneSecAgo)).toContain("second");
    });
  });

  describe("DOM Utilities", () => {
    // These would require a JSDOM environment, which is likely set up in setup.ts
    test("toggleClass works", () => {
      const div = document.createElement("div");
      utils.toggleClass(div, "test-class");
      expect(div.classList.contains("test-class")).toBe(true);
      utils.toggleClass(div, "test-class");
      expect(div.classList.contains("test-class")).toBe(false);
      utils.toggleClass(div, "test-class", true);
      expect(div.classList.contains("test-class")).toBe(true);
    });
  });

  describe("Validation Utilities", () => {
    test("isValidEmail validates email", () => {
      expect(utils.isValidEmail("test@example.com")).toBe(true);
      expect(utils.isValidEmail("invalid-email")).toBe(false);
      expect(utils.isValidEmail("test@")).toBe(false);
    });

    test("allPass and anyPass work", () => {
      const arr = [1, 2, 3];
      expect(utils.allPass(arr, (n) => n > 0)).toBe(true);
      expect(utils.allPass(arr, (n) => n > 2)).toBe(false);
      expect(utils.anyPass(arr, (n) => n > 2)).toBe(true);
      expect(utils.anyPass(arr, (n) => n > 10)).toBe(false);
    });
  });

  describe("Cache Utilities", () => {
    test("memoize caches results", () => {
      let count = 0;
      const fn = (x: number) => {
        count++;
        return x * 2;
      };
      const memoized = utils.memoize(fn);
      expect(memoized(2)).toBe(4);
      expect(memoized(2)).toBe(4);
      expect(count).toBe(1);
    });

    test("debounce limits calls", async () => {
      let count = 0;
      const fn = () => {
        count++;
      };
      const debounced = utils.debounce(fn, 50);
      debounced();
      debounced();
      debounced();
      expect(count).toBe(0);
      await new Promise((r) => setTimeout(r, 100));
      expect(count).toBe(1);
    });

    test("throttle limits calls", () => {
      let count = 0;
      const fn = () => {
        count++;
      };
      const throttled = utils.throttle(fn, 100);
      throttled();
      throttled();
      throttled();
      expect(count).toBe(1);
    });
  });

  describe("Promise Utilities", () => {
    test("delay waits", async () => {
      const start = Date.now();
      await utils.delay(100);
      expect(Date.now() - start).toBeGreaterThanOrEqual(100);
    });

    test("withTimeout times out", async () => {
      const p = new Promise((r) => setTimeout(r, 200));
      await expect(utils.withTimeout(p, 100)).rejects.toThrow("Timeout");
    });

    test("withTimeout succeeds if promise is faster", async () => {
      const p = new Promise((r) => setTimeout(() => r("ok"), 50));
      await expect(utils.withTimeout(p, 100)).resolves.toBe("ok");
    });
  });

  describe("Type Guards", () => {
    test("isDefined identifies defined values", () => {
      expect(utils.isDefined(1)).toBe(true);
      expect(utils.isDefined(null)).toBe(false);
      expect(utils.isDefined(undefined)).toBe(false);
    });

    test("type guards work", () => {
      expect(utils.isString("hi")).toBe(true);
      expect(utils.isString(1)).toBe(false);
      expect(utils.isNumber(1)).toBe(true);
      expect(utils.isNumber("1")).toBe(false);
      expect(utils.isBoolean(true)).toBe(true);
      expect(utils.isBoolean(1)).toBe(false);
      expect(utils.isArray([])).toBe(true);
      expect(utils.isArray({})).toBe(false);
    });
  });
});
