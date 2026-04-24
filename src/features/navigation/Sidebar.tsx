import { clsx } from "clsx";
import { useEffect, useState } from "react";
import type { SidebarCategoryItem, SidebarDocItem, SidebarItem } from "@/generated";

interface SidebarProps {
  sidebar: readonly SidebarItem[];
  currentSlug: string;
  onNavigate: (slug: string) => void;
}

function CategoryItem({
  item,
  currentSlug,
  onNavigate,
  isExpanded,
  onToggle,
}: {
  item: SidebarCategoryItem;
  currentSlug: string;
  onNavigate: (slug: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasActive = item.items.some(
    (child) => child.slug === currentSlug || child.id === currentSlug
  );

  return (
    <div className={clsx("sidebar-category", { "is-expanded": isExpanded })}>
      <button
        type="button"
        className={clsx("sidebar-category-header", { active: hasActive })}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <span className="sidebar-category-label">{item.label}</span>
        <span className={clsx("sidebar-category-arrow", { "is-rotated": isExpanded })}>▾</span>
      </button>
      <ul className="sidebar-sublist">
        {item.items.map((child) => (
          <li key={child.id} className="sidebar-item">
            <a
              href={`/docs/${child.slug}`}
              className={clsx("sidebar-link", {
                active: currentSlug === child.slug || currentSlug === child.id,
              })}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(child.slug);
              }}
            >
              <span className="sidebar-link-label">{child.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DocLink({
  item,
  currentSlug,
  onNavigate,
}: {
  item: SidebarDocItem;
  currentSlug: string;
  onNavigate: (slug: string) => void;
}) {
  return (
    <div className="sidebar-category">
      <ul className="sidebar-sublist" style={{ paddingLeft: 0 }}>
        <li className="sidebar-item">
          <a
            href={`/docs/${item.slug}`}
            className={clsx("sidebar-link", {
              active: currentSlug === item.slug || currentSlug === item.id,
            })}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item.slug);
            }}
          >
            <span className="sidebar-link-label">{item.label}</span>
          </a>
        </li>
      </ul>
    </div>
  );
}

export function Sidebar({ sidebar, currentSlug, onNavigate }: SidebarProps) {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(() => {
    const activeCat = sidebar.find((item) => 
      item.type === "category" && 
      item.items.some((child) => child.slug === currentSlug || child.id === currentSlug)
    );
    return activeCat ? `cat:${activeCat.label}` : null;
  });

  useEffect(() => {
    const activeCat = sidebar.find((item) => 
      item.type === "category" && 
      item.items.some((child) => child.slug === currentSlug || child.id === currentSlug)
    );
    if (activeCat) {
      setExpandedCategoryId(`cat:${activeCat.label}`);
    }
  }, [currentSlug, sidebar]);

  const isPermanentlyExpanded = (item: SidebarCategoryItem) => {
    const label = item.label.toLowerCase();
    return label.includes("references") || label.includes("abstract");
  };

  return (
    <div className="sidebar-content">
      <div className="sidebar-tree-view">
        {sidebar.map((item) => {
          const key = item.type === "category" ? `cat:${item.label}` : `doc:${item.slug}`;
          return item.type === "category" ? (
            <CategoryItem 
              key={key} 
              item={item} 
              currentSlug={currentSlug} 
              onNavigate={onNavigate} 
              isExpanded={expandedCategoryId === key || isPermanentlyExpanded(item)}
              onToggle={() => {
                if (isPermanentlyExpanded(item)) return;
                setExpandedCategoryId(prev => prev === key ? null : key);
              }}
            />
          ) : (
            <DocLink key={key} item={item} currentSlug={currentSlug} onNavigate={onNavigate} />
          );
        })}
      </div>
    </div>
  );
}
