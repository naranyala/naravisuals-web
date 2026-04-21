import { memo, useRef } from "react";
import { useDocumentEnhancer } from "./hooks/useDocumentEnhancer";

interface DocViewerProps {
  html: string;
  slug: string;
}

export const DocViewer = memo(({ html, slug }: DocViewerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Apply late-binding enhancements (Mermaid, MathJax)
  useDocumentEnhancer(ref, slug, html);

  return <div ref={ref} className="doc-content" dangerouslySetInnerHTML={{ __html: html }} />;
});
