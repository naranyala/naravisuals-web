import { clsx } from "clsx";
import { useEffect, useState } from "react";

interface TOCItem {
  value: string;
  id: string;
  level: number;
}

interface TableOfContentsProps {
  items: readonly TOCItem[];
}

/**
 * Strip markdown formatting characters from TOC heading text.
 * Removes backticks, asterisks, underscores, and HTML tags.
 */
function cleanTOCText(raw: string): string {
  return raw
    .replace(/`([^`]+)`/g, "$1") // inline code: `code` → code
    .replace(/\*\*\*([^*]+)\*\*\*/g, "$1") // bold+italic: ***text*** → text
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold: **text** → text
    .replace(/\*([^*]+)\*/g, "$1") // italic: *text* → text
    .replace(/__([^_]+)__/g, "$1") // bold: __text__ → text
    .replace(/_([^_]+)_/g, "$1") // italic: _text_ → text
    .replace(/~~([^~]+)~~/g, "$1") // strikethrough: ~~text~~ → text
    .replace(/<[^>]+>/g, ""); // HTML tags → strip
}

/**
 * Scroll a TOC item into view with offset so it's not hidden behind the topbar.
 */
function scrollActiveIntoView(_activeId: string) {
  const el = document.querySelector(`.toc-item.active`);
  if (el) {
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHash(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  // Scroll active item into view when it changes
  useEffect(() => {
    if (activeHash) {
      scrollActiveIntoView(activeHash);
    }
  }, [activeHash]);

  if (items.length === 0) return null;

  return (
    <div className="toc">
      <ul className="toc-list">
        {items.map((item) => {
          const isActive = activeHash === `#${item.id}`;
          return (
            <li
              key={item.id}
              className={clsx("toc-item", `toc-item-level-${item.level}`, { active: isActive })}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(item.id);
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                  window.history.pushState({}, "", `#${item.id}`);
                  setActiveHash(`#${item.id}`);
                }}
              >
                {cleanTOCText(item.value)}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
