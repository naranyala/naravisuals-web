import { clsx } from "clsx";
import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { allDocs } from "@/generated";
import { useUIState } from "../../core/store";
import { formatSearchUrl } from "../../core/utils";
import { SEARCH_ENGINES } from "./search-engines";

/**
 * Global Search Component (Command Palette style)
 */
export function GlobalSearch({ onNavigate }: { onNavigate: (slug: string) => void }) {
  const { searchOpen, setSearch } = useUIState();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(() => {
    const searchableDocs = allDocs.map((doc) => {
      const plainText = doc.content.replace(/<[^>]*>/g, " ");
      const tocText = doc.toc?.map((t) => t.value).join(" ") || "";

      return {
        ...doc,
        plainText,
        tocText,
      };
    });

    return new Fuse(searchableDocs, {
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
  }, []);

  const results = useMemo(() => {
    if (!query) return [];
    return fuse
      .search(query)
      .map((r) => r.item)
      .slice(0, 15);
  }, [query, fuse]);

  useEffect(() => {
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!searchOpen) return;

      if (e.key === "Escape") {
        setSearch(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (results.length || 1)) % (results.length || 1));
      } else if (e.key === "Enter") {
        if (results[selectedIndex]) {
          onNavigate(results[selectedIndex].slug);
          setSearch(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, results, selectedIndex, onNavigate, setSearch]);

  useEffect(() => {
    if (searchOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [searchOpen]);

  if (!searchOpen) return null;

  const modalContent = (
    <div className="modal-root">
      <div className="modal-backdrop" onClick={() => setSearch(false)} />
      <div className="modal-container">
        <div className="search-modal" onClick={(e) => e.stopPropagation()}>
          <div className="search-header">
            <span className="search-modal-icon">🔍</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search documentation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            <div className="search-modal-esc" onClick={() => setSearch(false)}>
              ESC
            </div>
          </div>
          <div className="search-body">
            {results.length > 0 ? (
              <div className="search-results-list">
                {results.map((doc, index) => (
                  <div
                    key={doc.id}
                    className={clsx("search-result-item", { active: index === selectedIndex })}
                    onClick={() => {
                      onNavigate(doc.slug);
                      setSearch(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="result-icon">📄</div>
                    <div className="result-content">
                      <div className="result-title">{doc.title}</div>
                      <div className="result-slug">{doc.slug}</div>
                    </div>
                    {index === selectedIndex && <div className="result-enter">↵</div>}
                  </div>
                ))}
                {query && (
                  <div className="search-external-section">
                    <div className="search-section-title">Search Externally</div>
                    <div className="search-external-grid">
                      {SEARCH_ENGINES.slice(0, 6).map((engine) => (
                        <button
                          type="button"
                          key={engine.name}
                          className="search-external-btn"
                          onClick={() => {
                            window.open(formatSearchUrl(engine.url, query), "_blank");
                            setSearch(false);
                          }}
                        >
                          <span className="engine-icon">{engine.icon}</span>
                          <span className="engine-name">{engine.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="search-empty">
                {query ? (
                  <div className="search-no-results">
                    <div className="search-empty-icon">∅</div>
                    <p>
                      No results found for "<strong>{query}</strong>"
                    </p>
                  </div>
                ) : (
                  <div className="search-prompt">
                    <div className="search-empty-icon">⌨️</div>
                    <p>Type to start searching...</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="search-footer">
            <div className="search-help">
              <span>
                <kbd>↑↓</kbd> to navigate
              </span>
              <span>
                <kbd>↵</kbd> to select
              </span>
              <span>
                <kbd>esc</kbd> to close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
