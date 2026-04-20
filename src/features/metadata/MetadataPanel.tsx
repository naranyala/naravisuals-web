import { useState } from "react";

interface MetadataPanelProps {
  metadata: Record<string, string | readonly string[]>;
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function MetadataValue({ value }: { value: string | readonly string[] }) {
  if (Array.isArray(value)) {
    return (
      <span className="metadata-tags">
        {value.map((v) => (
          <span key={v} className="metadata-tag">
            {v}
          </span>
        ))}
      </span>
    );
  }
  return <span className="metadata-value-text">{value}</span>;
}

export function MetadataPanel({ metadata }: MetadataPanelProps) {
  const [open, setOpen] = useState(false);

  const entries = Object.entries(metadata);
  if (entries.length === 0) return null;

  return (
    <details
      className="metadata-panel"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="metadata-summary">
        <span className="metadata-chevron">{open ? "▾" : "▸"}</span>
        Page Metadata
        <span className="metadata-count">
          {entries.length} field{entries.length !== 1 ? "s" : ""}
        </span>
      </summary>
      <div className="metadata-body">
        {entries.map(([key, value]) => (
          <div key={key} className="metadata-row">
            <span className="metadata-key">{formatLabel(key)}</span>
            <MetadataValue value={value} />
          </div>
        ))}
      </div>
    </details>
  );
}
