import { clsx } from "clsx";
import { useState } from "react";
import { useUIState } from "../../core/store";
import { filteredStats, wordStats } from "../../generated";

const SEARCH_ENGINES = [
  { name: "Google", icon: "🔍", url: "https://www.google.com/search?q=" },
  { name: "YouTube", icon: "📺", url: "https://www.youtube.com/results?search_query=" },
  { name: "Reddit", icon: "🤖", url: "https://www.reddit.com/search/?q=" },
  { name: "Hacker News", icon: "🧡", url: "https://hn.algolia.com/?q=" },
  { name: "GitHub", icon: "🐙", url: "https://github.com/search?q=" },
  { name: "Wikipedia", icon: "📖", url: "https://en.wikipedia.org/wiki/Special:Search?search=" },
];

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
    window.open(`${engineUrl}${encodeURIComponent(selectedWord)}`, "_blank");
  };

  const closeModals = () => {
    setSelectedWord(null);
    setWordStatsOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={closeModals}>
      <div className="modal-content word-stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Word Frequency Analysis</h2>
          <button className="modal-close" onClick={closeModals}>
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
            <button className="collapsible-header" onClick={() => setShowFiltered(!showFiltered)}>
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
      </div>

      {/* Second Layer Modal: External Search Gateway */}
      {selectedWord && (
        <div className="modal-overlay sub-modal-overlay" onClick={() => setSelectedWord(null)}>
          <div className="modal-content search-gateway-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Search for "{selectedWord}"</h3>
              <button className="modal-close" onClick={() => setSelectedWord(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="search-engines-grid">
                {SEARCH_ENGINES.map((engine) => (
                  <button
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
            <div className="modal-footer">
              <p>Opens in a new tab</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
