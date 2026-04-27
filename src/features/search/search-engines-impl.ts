import uFuzzy from "@leeoniya/ufuzzy";
import * as M31Fuzzy from "@m31coding/fuzzy-search";
import Fuse from "fuse.js";
import fuzzysort from "fuzzysort";
import { allDocs, type TocItem } from "@/generated";

export interface SearchResult {
  item: any;
  score?: number;
}

export interface SearchEngine {
  name: string;
  search(query: string): SearchResult[];
}

export class FuseSearchEngine implements SearchEngine {
  static readonly name = "Fuse.js";
  name = FuseSearchEngine.name;
  private fuse: Fuse<any>;
  // ... (rest of the class)

  constructor() {
    const searchableDocs = allDocs.map((doc) => {
      const plainText = doc.content.replace(/<[^>]*>/g, " ");
      const tocText = doc.toc?.map((t: TocItem) => t.value).join(" ") || "";

      return {
        ...doc,
        plainText,
        tocText,
      };
    });

    this.fuse = new Fuse(searchableDocs, {
      keys: [
        { name: "title", weight: 0.4 },
        { name: "tocText", weight: 0.3 },
        { name: "tags", weight: 0.15 },
        { name: "description", weight: 0.1 },
        { name: "plainText", weight: 0.05 },
      ],
      threshold: 0.3,
      includeMatches: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }

  search(query: string): SearchResult[] {
    return this.fuse.search(query).map((r) => ({
      item: r.item,
      score: r.score,
    }));
  }
}

export class UFuzzySearchEngine implements SearchEngine {
  static readonly name = "uFuzzy";
  name = UFuzzySearchEngine.name;
  private ufuzzy: uFuzzy;
  private items: string[];

  constructor() {
    this.ufuzzy = new uFuzzy();
    this.items = allDocs.map((doc) => {
      const plainText = doc.content.replace(/<[^>]*>/g, " ");
      const tocText = doc.toc?.map((t: TocItem) => t.value).join(" ") || "";

      return `${doc.title} ${doc.description || ""} ${doc.tags?.join(" ") || ""} ${tocText} ${plainText}`;
    });
  }

  search(query: string): SearchResult[] {
    const result = this.ufuzzy.search(this.items, query);

    // result is [idxs, info, order] or [idxs, null, null] or [null, null, null]
    const idxs = result[0];
    if (!idxs) return [];

    // If it's a RankedResult, we should use the order
    const order = result[2];
    const finalIdxs = order
      ? order.map((i) => idxs[i]).filter((i): i is number => i !== undefined)
      : idxs;

    return finalIdxs.map((idx) => ({
      item: allDocs[idx],
    }));
  }
}

export class M31FuzzySearchEngine implements SearchEngine {
  static readonly name = "M31Fuzzy";
  name = M31FuzzySearchEngine.name;
  private searcher: any;

  constructor() {
    this.searcher = M31Fuzzy.SearcherFactory.createDefaultSearcher();
    this.searcher.indexEntities(
      allDocs,
      (doc: any) => doc.id,
      (doc: any) => {
        const plainText = doc.content.replace(/<[^>]*>/g, " ");
        const tocText = doc.toc?.map((t: TocItem) => t.value).join(" ") || "";
        return [doc.title, doc.description || "", ...(doc.tags || []), tocText, plainText];
      }
    );
  }

  search(query: string): SearchResult[] {
    const result = this.searcher.getMatches(new M31Fuzzy.Query(query));
    return result.matches.map((match: any) => ({
      item: match.entity,
    }));
  }
}

export class FuzzySortSearchEngine implements SearchEngine {
  static readonly name = "FuzzySort";
  name = FuzzySortSearchEngine.name;
  private searchableItems: any[];

  constructor() {
    this.searchableItems = allDocs.map((doc) => {
      const plainText = doc.content.replace(/<[^>]*>/g, " ");
      const tocText = doc.toc?.map((t: TocItem) => t.value).join(" ") || "";
      return {
        ...doc,
        searchText: `${doc.title} ${doc.description || ""} ${doc.tags?.join(" ") || ""} ${tocText} ${plainText}`,
      };
    });
  }

  search(query: string): SearchResult[] {
    const results = fuzzysort.go(query, this.searchableItems, {
      key: "searchText",
      limit: 15,
    });
    return results.map((r: any) => ({
      item: r.obj,
      score: r.score,
    }));
  }
}

export type SearchEngineType = "fuse" | "ufuzzy" | "m31fuzzy" | "fuzzysort";

export const SEARCH_ENGINE_MAP: Record<SearchEngineType, new () => SearchEngine> = {
  fuse: FuseSearchEngine,
  ufuzzy: UFuzzySearchEngine,
  m31fuzzy: M31FuzzySearchEngine,
  fuzzysort: FuzzySortSearchEngine,
};

export const DEFAULT_SEARCH_ENGINE: SearchEngineType = "ufuzzy";
