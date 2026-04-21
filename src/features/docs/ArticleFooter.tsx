import { DocFooter } from "../docs";

interface ArticleFooterProps {
  contentHtml: string;
  prevDoc?: { title: string; slug: string };
  nextDoc?: { title: string; slug: string };
  onNavigate: (slug: string) => void;
}

/**
 * Unified Article Footer
 *
 * Consolidates pagination navigation and document statistics.
 */
export function ArticleFooter({ prevDoc, nextDoc, onNavigate }: ArticleFooterProps) {
  return (
    <footer className="article-footer-unified">
      <DocFooter prevDoc={prevDoc} nextDoc={nextDoc} onNavigate={onNavigate} />
    </footer>
  );
}
