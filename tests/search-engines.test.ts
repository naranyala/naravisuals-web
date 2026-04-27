import { describe, expect, test } from "bun:test";
import { formatSearchUrl } from "../src/core/utils";
import { SEARCH_ENGINES } from "../src/features/search/search-engines";

describe("Search Engines Configuration", () => {
  test("all search engines should have a valid URL template with %s", () => {
    SEARCH_ENGINES.forEach((engine) => {
      expect(engine.url).toContain("%s");
    });
  });

  test("all search engines should resolve correctly with a query", () => {
    const query = "test query";
    const encodedQuery = encodeURIComponent(query);

    SEARCH_ENGINES.forEach((engine) => {
      const resultUrl = formatSearchUrl(engine.url, query);
      expect(resultUrl).toContain(encodedQuery);
      expect(resultUrl).not.toContain("%s");
    });
  });

  test("special characters in query should be properly encoded", () => {
    const query = "c++ & java #programming";
    const resultUrl = formatSearchUrl(SEARCH_ENGINES[0].url, query);

    // Check that the result does not contain literal '&', '#', or '+' unless they are part of the base URL
    // Since the base URL for Google is https://www.google.com/search?q=%s
    // The result should be https://www.google.com/search?q=c%2B%2B%20%26%20java%20%23programming
    expect(resultUrl).not.toContain(" & ");
    expect(resultUrl).not.toContain(" #");
  });
});
