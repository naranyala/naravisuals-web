import { clsx } from "clsx";
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
}: {
  item: SidebarCategoryItem;
  currentSlug: string;
  onNavigate: (slug: string) => void;
}) {
  const hasActive = item.items.some(
    (child) => child.slug === currentSlug || child.id === currentSlug
  );

  return (
    <div className="sidebar-category">
      <button
        className={clsx("sidebar-category-header", { active: hasActive })}
        onClick={() => {
          if (item.link) {
            const target = item.items.find((i) => i.id === item.link?.id) || item.items[0];
            if (target) onNavigate(target.slug);
          }
        }}
      >
        <span className="sidebar-category-label">{item.label}</span>
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
  return (
    <div className="sidebar-content">
      <div className="sidebar-tree-view">
        {sidebar.map((item) => {
          const key = item.type === "category" ? `cat:${item.label}` : `doc:${item.slug}`;
          return item.type === "category" ? (
            <CategoryItem key={key} item={item} currentSlug={currentSlug} onNavigate={onNavigate} />
          ) : (
            <DocLink key={key} item={item} currentSlug={currentSlug} onNavigate={onNavigate} />
          );
        })}
      </div>
    </div>
  );
}
