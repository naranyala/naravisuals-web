import Fuse from "fuse.js";
import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { allDocs } from "@/generated";
import { useUIState } from "../../core/store";

/**
 * Global Search Component (Command Palette style)
 */
export function GlobalSearch({ onNavigate }: { onNavigate: (slug: string) => void }) {
  const { searchOpen, setSearch } = useUIState();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(() => {
    const searchableDocs = allDocs.map((doc) => ({
      ...doc,
      plainText: doc.content.replace(/<[^>]*>/g, " "),
    }));

    return new Fuse(searchableDocs, {
      keys: ["title", "tags", "description", "plainText"],
      threshold: 0.4,
      includeMatches: true,
    });
  }, []);

  const results = useMemo(() => {
    if (!query) return [];
    return fuse.search(query).map(r => r.item).slice(0, 8);
  }, [query, fuse]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!searchOpen) return;

      if (e.key === "Escape") {
        setSearch(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (results.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (results.length || 1)) % (results.length || 1));
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
              onChange={e => setQuery(e.target.value)}
              className="search-input"
            />
            <div className="search-modal-esc" onClick={() => setSearch(false)}>ESC</div>
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
              </div>
            ) : (
              <div className="search-empty">
                {query ? (
                  <div className="search-no-results">
                    <div className="search-empty-icon">∅</div>
                    <p>No results found for "<strong>{query}</strong>"</p>
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
              <span><kbd>↑↓</kbd> to navigate</span>
              <span><kbd>↵</kbd> to select</span>
              <span><kbd>esc</kbd> to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
