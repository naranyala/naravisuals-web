import { clsx } from "clsx";
import { useState } from "react";
import { formatSearchUrl } from "../../core/utils";
import { filteredStats, wordStats } from "../../generated";
import { Modal } from "../../shared/components/Modal";
import { SEARCH_CATEGORIES, SEARCH_ENGINES } from "../search/search-engines";
import { useMetadata } from "./MetadataProvider";

/**
 * Word Statistics Panel
 *
 * Displays ranked word frequency pills from all markdown articles.
 * Clicking a word opens an external search gateway.
 */
export function WordStatsPanel() {
  const { wordStatsOpen, setWordStatsOpen } = useMetadata();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showFiltered, setShowFiltered] = useState(false);

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
    <Modal
      isOpen={wordStatsOpen}
      onClose={closeModals}
      title={selectedWord ? `Search for "${selectedWord}"` : "Word Frequency Analysis"}
      header={
        selectedWord ? (
          <button type="button" className="btn-back" onClick={() => setSelectedWord(null)}>
            ← Back to Stats
          </button>
        ) : undefined
      }
    >
      {!selectedWord ? (
        <>
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
        </>
      ) : (
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
      )}
      {selectedWord && (
        <div className="modal-footer">
          <p>Opens in a new tab</p>
        </div>
      )}
    </Modal>
  );
}
