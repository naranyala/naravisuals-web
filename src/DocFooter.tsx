interface DocFooterProps {
  prevDoc?: { title: string; slug: string };
  nextDoc?: { title: string; slug: string };
  lastUpdatedAt?: string;
  onNavigate?: (slug: string) => void;
}

export function DocFooter({
  prevDoc,
  nextDoc,
  lastUpdatedAt,
  onNavigate,
}: DocFooterProps) {
  const handleNavigate = (slug: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(slug);
    } else {
      // Fallback to full page navigation if onNavigate not provided
      window.location.href = `/docs/${slug}`;
    }
  };

  return (
    <footer className="doc-footer">
      {(prevDoc || nextDoc) && (
        <div className="pagination-nav">
          {prevDoc ? (
            <a
              href={`/docs/${prevDoc.slug}`}
              className="pagination-link pagination-prev"
              onClick={handleNavigate(prevDoc.slug)}
            >
              <span className="pagination-subtitle">Previous</span>
              <span className="pagination-title">{prevDoc.title}</span>
            </a>
          ) : (
            <div />
          )}
          {nextDoc ? (
            <a
              href={`/docs/${nextDoc.slug}`}
              className="pagination-link pagination-next"
              onClick={handleNavigate(nextDoc.slug)}
            >
              <span className="pagination-subtitle">Next</span>
              <span className="pagination-title">{nextDoc.title}</span>
            </a>
          ) : (
            <div />
          )}
        </div>
      )}
    </footer>
  );
}
