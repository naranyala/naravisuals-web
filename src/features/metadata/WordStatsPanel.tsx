import { clsx } from "clsx";
import { useState } from "react";
import { useUIState } from "../../core/store";
import { filteredStats, wordStats } from "../../generated";
import { formatSearchUrl } from "../../core/utils";
import { SEARCH_ENGINES, SEARCH_CATEGORIES } from "../search/search-engines";

/**
 * Word Statistics Panel
 *
 * Displays ranked word frequency pills from all markdown articles.
 * Clicking a word opens an external search gateway.
 */
export function WordStatsPanel() {
  const { wordStatsOpen, setWordStatsOpen } = useUIState();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showFiltered, setShowFiltered] = useState(false);

  if (!wordStatsOpen) return null;

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
  };

  const handleSearch = (engineUrl: string) => {
    if (!selectedWord) return;
    window.open(formatSearchUrl(engineUrl, selectedWord), "_blank");
  };

  const closeModals = () => {
    setSelectedWord(null);
    setWordStatsOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={closeModals}>
      <div className="modal-content word-stats-modal" onClick={(e) => e.stopPropagation()}>
        {!selectedWord ? (
          <>
            <div className="modal-header">
              <h2>Word Frequency Analysis</h2>
              <button type="button" className="modal-close" onClick={closeModals}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="stats-description">
                Top 200 most used words across all documentation articles. Click a word to search
                externally.
              </p>
              <div className="word-pills-container">
                {wordStats.map((item, index) => {
                  const sizeClass =
                    index < 10 ? "pill-large" : index < 30 ? "pill-medium" : "pill-small";
                  return (
                    <div
                      key={item.word}
                      className={clsx("word-pill", sizeClass)}
                      onClick={() => handleWordClick(item.word)}
                    >
                      <span className="pill-word">{item.word}</span>
                      <span className="pill-count">{item.count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="filtered-words-section">
                <button
                  type="button"
                  className="collapsible-header"
                  onClick={() => setShowFiltered(!showFiltered)}
                >
                  <span>{showFiltered ? "▼" : "▶"} Show discipline-agnostic words (Filtered)</span>
                  <span className="filtered-count">{filteredStats.length} words</span>
                </button>
                {showFiltered && (
                  <div className="word-pills-container filtered-pills">
                    {filteredStats.map((item: { word: string; count: number }) => (
                      <div
                        key={item.word}
                        className="word-pill pill-small filtered-pill"
                        onClick={() => handleWordClick(item.word)}
                      >
                        <span className="pill-word">{item.word}</span>
                        <span className="pill-count">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="modal-header">
              <h3>Search for "{selectedWord}"</h3>
              <div className="modal-header-actions">
                <button
                  type="button"
                  className="btn-back"
                  onClick={() => setSelectedWord(null)}
                >
                  ← Back to Stats
                </button>
                <button type="button" className="modal-close" onClick={closeModals}>
                  ×
                </button>
              </div>
            </div>
            <div className="modal-body">
                <div className="search-categories-container">
                  {SEARCH_CATEGORIES.map((cat) => {
                    const enginesInCat = SEARCH_ENGINES.filter((e) => e.category === cat.id);
                    if (enginesInCat.length === 0) return null;


                  return (
                    <div key={cat.id} className="search-category-group">
                      <div className="search-category-header">
                        <span className="cat-icon">{cat.icon}</span>
                        <span className="cat-label">{cat.label}</span>
                      </div>
                      <div className="search-engines-grid">
                        {enginesInCat.map((engine) => (
                          <button
                            type="button"
                            key={engine.name}
                            className="search-engine-btn"
                            onClick={() => handleSearch(engine.url)}
                          >
                            <span className="engine-icon">{engine.icon}</span>
                            <span className="engine-name">{engine.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <p>Opens in a new tab</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
