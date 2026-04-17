import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { allDocs } from "@/generated";

interface SidebarDocItem {
  type: "doc";
  id: string;
  label: string;
  slug: string;
  category?: string;
  date?: string;
}

interface SidebarCategoryItem {
  type: "category";
  label: string;
  link?: { type: string; id: string };
  items: SidebarDocItem[];
}

type SidebarItem = SidebarDocItem | SidebarCategoryItem;

interface SidebarProps {
  sidebar: SidebarItem[];
  currentSlug: string;
  onNavigate: (slug: string) => void;
}

function CategoryItem({
  item,
  currentSlug,
  onNavigate,
}: {
  item: SidebarCategoryItem;
  currentSlug: string;
  onNavigate: (slug: string) => void;
}) {
  const hasActive = item.items.some(
    (child) => child.slug === currentSlug || child.id === currentSlug
  );

  return (
    <div className="sidebar-category">
      <button
        className={`sidebar-category-header ${hasActive ? "active" : ""}`}
        onClick={() => {
          if (item.link) {
            const target = item.items.find((i) => i.id === item.link?.id) || item.items[0];
            if (target) onNavigate(target.slug);
          }
        }}
      >
        <span className="sidebar-category-label">{item.label}</span>
      </button>
      <ul className="sidebar-sublist">
        {item.items.map((child) => (
          <li key={child.id} className="sidebar-item">
            <a
              href={`/docs/${child.slug}`}
              className={`sidebar-link ${
                currentSlug === child.slug || currentSlug === child.id ? "active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(child.slug);
              }}
            >
              <span className="sidebar-link-label">{child.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DocLink({
  item,
  currentSlug,
  onNavigate,
}: {
  item: SidebarDocItem;
  currentSlug: string;
  onNavigate: (slug: string) => void;
}) {
  return (
    <div className="sidebar-category">
      <ul className="sidebar-sublist" style={{ paddingLeft: 0 }}>
        <li className="sidebar-item">
          <a
            href={`/docs/${item.slug}`}
            className={`sidebar-link ${
              currentSlug === item.slug || currentSlug === item.id ? "active" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item.slug);
            }}
          >
            <span className="sidebar-link-label">{item.label}</span>
          </a>
        </li>
      </ul>
    </div>
  );
}

export function Sidebar({ sidebar, currentSlug, onNavigate }: SidebarProps) {
  const [sidebarMode, setSidebarMode] = useState<"tree" | "search">("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fuse = useMemo(() => {
    // Pre-process docs to have plain text for cleaner searching and snippet extraction
    const searchableDocs = allDocs.map((doc) => ({
      ...doc,
      plainText: doc.content.replace(/<[^>]*>/g, " "), // Simple HTML strip
    }));

    return new Fuse(searchableDocs, {
      keys: [
        { name: "title", weight: 1.0 },
        { name: "tags", weight: 0.8 },
        { name: "description", weight: 0.7 },
        { name: "plainText", weight: 0.4 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      includeMatches: true, // Crucial for snippets
      findAllMatches: true,
    });
  }, []);

  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];

    const results = fuse.search(debouncedQuery);

    return results.map(({ item, matches }) => {
      let snippet = "";

      // Extract a snippet from the plainText if a match was found there
      const contentMatch = matches?.find((m) => m.key === "plainText");
      if (contentMatch?.indices) {
        const index = contentMatch.indices[0][0];
        const start = Math.max(0, index - 40);
        const end = Math.min(item.plainText.length, index + 40);
        snippet = `...${item.plainText.slice(start, end).replace(/\s+/g, " ")}...`;
      }

      // Determine if we should navigate to a specific section or the page
      // If the match is primarily in the title/desc, just go to page.
      // If it's in the content, we use a text fragment for precise navigation.
      const isContentMatch = !!contentMatch;
      const navTarget = isContentMatch
        ? `${item.slug}#:~:text=${encodeURIComponent(debouncedQuery)}`
        : item.slug;

      return {
        ...item,
        snippet,
        navTarget,
        isContentMatch,
      };
    });
  }, [debouncedQuery, fuse]);

  return (
    <div className="sidebar-content">
      <div className="sidebar-mode-switcher">
        <div className={`mode-slider ${sidebarMode}`} />
        <button
          className={`mode-btn ${sidebarMode === "tree" ? "active" : ""}`}
          onClick={() => setSidebarMode("tree")}
        >
          Tree
        </button>
        <button
          className={`mode-btn ${sidebarMode === "search" ? "active" : ""}`}
          onClick={() => setSidebarMode("search")}
        >
          Search
        </button>
      </div>

      {sidebarMode === "tree" ? (
        <div className="sidebar-tree-view">
          {sidebar.map((item) => {
            const key = item.type === "category" ? `cat:${item.label}` : `doc:${item.slug}`;
            return item.type === "category" ? (
              <CategoryItem
                key={key}
                item={item}
                currentSlug={currentSlug}
                onNavigate={onNavigate}
              />
            ) : (
              <DocLink key={key} item={item} currentSlug={currentSlug} onNavigate={onNavigate} />
            );
          })}
        </div>
      ) : (
        <div className="sidebar-search-view">
          <div className="sidebar-search-input-wrapper">
            <input
              type="text"
              className="sidebar-search-input"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="sidebar-search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <div className="sidebar-search-results">
            {debouncedQuery ? (
              searchResults.length > 0 ? (
                searchResults.map((doc) => (
                  <div
                    key={doc.id}
                    className={`sidebar-search-item ${currentSlug === doc.slug ? "active" : ""}`}
                    onClick={() => onNavigate(doc.navTarget)}
                  >
                    <div className="search-item-title">{doc.title}</div>
                    {doc.snippet && <div className="search-item-snippet">{doc.snippet}</div>}
                    <div className="search-item-slug">{doc.slug}</div>
                  </div>
                ))
              ) : (
                <div className="sidebar-search-empty">No results found</div>
              )
            ) : (
              <div className="sidebar-search-placeholder">Type to search...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
