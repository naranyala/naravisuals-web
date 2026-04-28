import { clsx } from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatSearchUrl } from "../../core/utils";
import { Modal } from "../../shared/components/Modal";
import { useSearch } from "./SearchProvider";
import { SEARCH_ENGINES } from "./search-engines";
import {
  DEFAULT_SEARCH_ENGINE,
  SEARCH_ENGINE_MAP,
  type SearchEngineType,
} from "./search-engines-impl";

/**
 * Global Search Component (Command Palette style)
 */
export function GlobalSearch({ onNavigate }: { onNavigate: (slug: string) => void }) {
  const { searchOpen, setSearch } = useSearch();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedEngine, setSelectedEngine] = useState<SearchEngineType>(DEFAULT_SEARCH_ENGINE);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);

    return () => clearTimeout(handler);
  }, [query]);

  const searchEngine = useMemo(() => {
    const EngineClass = SEARCH_ENGINE_MAP[selectedEngine];
    return new EngineClass();
  }, [selectedEngine]);

  const results = useMemo(() => {
    if (!debouncedQuery) return [];
    return searchEngine
      .search(debouncedQuery)
      .map((r) => r.item)
      .slice(0, 15);
  }, [debouncedQuery, searchEngine]);

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

  return (
    <Modal
      isOpen={searchOpen}
      onClose={() => setSearch(false)}
      className="search-modal-container"
      header={
        <div className="search-modal-header-inner">
          <span className="search-modal-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <select
            className="search-engine-select"
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value as SearchEngineType)}
          >
            {Object.entries(SEARCH_ENGINE_MAP).map(([id, Engine]) => (
              <option key={id} value={id}>
                {(Engine as any).name}
              </option>
            ))}
          </select>
          {query.length > 0 && (
            <div
              className="search-modal-action is-clear"
              onClick={() => setQuery("")}
              title="Clear search"
            >
              ✕
            </div>
          )}
        </div>
      }
      footer={
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
      }
    >
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
    </Modal>
  );
}
