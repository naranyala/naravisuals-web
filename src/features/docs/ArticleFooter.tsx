import { DocFooter } from "../docs";
import { ArticleRefsPanel } from "../metadata";

interface ArticleFooterProps {
  contentHtml: string;
  markdownAst?: readonly any[];
  prevDoc?: { title: string; slug: string };
  nextDoc?: { title: string; slug: string };
  onNavigate: (slug: string) => void;
}

/**
 * Unified Article Footer
 *
 * Consolidates pagination navigation and document statistics.
 */
export function ArticleFooter({ prevDoc, nextDoc, onNavigate, markdownAst }: ArticleFooterProps) {
  return (
    <footer className="article-footer-unified">
      <ArticleRefsPanel markdownAst={markdownAst} />
      <DocFooter prevDoc={prevDoc} nextDoc={nextDoc} onNavigate={onNavigate} />
    </footer>
  );
}
