/**
 * Article References Panel
 *
 * Extracts and displays footnote references [^index] and their definitions
 * from the current article's AST tokens.
 * Collapsible section that's expanded by default.
 * Placed at the very bottom of the article (after DocFooter).
 */

import { clsx } from "clsx";
import { useMemo, useState } from "react";

interface FootnoteEntry {
  identifier: string;
  referenceText: string;
  definitionText: string;
  hasDefinition: boolean;
  hasReference: boolean;
}

interface ArticleRefsPanelProps {
  /** AST tokens from marked parser */
  markdownAst?: readonly any[];
}

export function ArticleRefsPanel({ markdownAst }: ArticleRefsPanelProps) {
  const [isOpen, setIsOpen] = useState(false); // Collapsed by default

  // Extract footnotes from AST tokens
  const footnotes = useMemo<FootnoteEntry[]>(() => {
    if (!markdownAst || markdownAst.length === 0) return [];

    const footnotesMap = new Map<string, FootnoteEntry>();

    // Walk AST tokens to find footnote references and definitions
    function walkTokens(tokens: readonly any[]) {
      for (const token of tokens) {
        if (typeof token !== "object" || token === null) continue;

        // Check for footnote references: tokens with text containing [^...]
        if (token.text && typeof token.text === "string") {
          const refRegex = /\[\^([^\]]+)\]/g;
          let match: RegExpExecArray | null;
          while (true) {
            match = refRegex.exec(token.text);
            if (match === null) break;
            const identifier = match[1];
            if (identifier && !footnotesMap.has(identifier)) {
              footnotesMap.set(identifier, {
                identifier,
                referenceText: `[^${identifier}]`,
                definitionText: "",
                hasDefinition: false,
                hasReference: true,
              });
            }
          }
        }

        // Check for footnote definitions: tokens with type indicating footnote
        if (token.type === "paragraph" || token.type === "text") {
          if (token.text && typeof token.text === "string") {
            const defRegex = /^\[\^([^\]]+)\]:\s*(.+)$/;
            const defMatch = token.text.match(defRegex);
            if (defMatch) {
              const identifier = defMatch[1];
              const definitionText = defMatch[2]?.trim() || "";
              if (identifier && footnotesMap.has(identifier)) {
                const entry = footnotesMap.get(identifier);
                if (entry) {
                  entry.definitionText = definitionText;
                  entry.hasDefinition = definitionText.length > 0;
                }
              } else if (identifier) {
                footnotesMap.set(identifier, {
                  identifier,
                  referenceText: `[^${identifier}]`,
                  definitionText,
                  hasDefinition: definitionText.length > 0,
                  hasReference: false,
                });
              }
            }
          }
        }

        // Recursively walk nested tokens
        if (token.tokens && Array.isArray(token.tokens)) {
          walkTokens(token.tokens);
        }
        if (token.items && Array.isArray(token.items)) {
          walkTokens(token.items);
        }
      }
    }

    walkTokens(markdownAst);

    return Array.from(footnotesMap.values());
  }, [markdownAst]);

  return (
    <div className="article-refs-panel">
      <button
        type="button"
        className="article-refs-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="article-refs-header-text">
          📖 References & Footnotes ({footnotes.length})
        </span>
        <span className={clsx("article-refs-chevron", { open: isOpen })}>▾</span>
      </button>

      {isOpen && (
        <div className="article-refs-content">
          {footnotes.length > 0 ? (
            <ol className="article-refs-list">
              {footnotes.map((footnote, idx) => (
                <li key={footnote.identifier} className="article-ref-item">
                  <div className="article-ref-header">
                    <span className="article-ref-identifier">
                      <sup>{idx + 1}</sup> [{footnote.identifier}]
                    </span>
                    {!footnote.hasDefinition && footnote.hasReference && (
                      <span className="article-ref-warning" title="No definition found">
                        ⚠️ No definition
                      </span>
                    )}
                  </div>
                  {footnote.hasDefinition && (
                    <div
                      className="article-ref-definition"
                      dangerouslySetInnerHTML={{
                        __html: footnote.definitionText,
                      }}
                    />
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <div className="ref-empty-state">No references found in this article.</div>
          )}
        </div>
      )}
    </div>
  );
}
