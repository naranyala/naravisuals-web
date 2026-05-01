import { clsx } from "clsx";
import { useEffect, useState } from "react";
import type { SidebarCategoryItem, SidebarDocItem, SidebarItem } from "@/generated";
import { useServices } from "@/services";

interface SidebarProps {
  sidebar: readonly SidebarItem[];
  currentSlug: string;
  onNavigate: (slug: string) => void;
  isMobile?: boolean;
  articlePosition?: {
    current: number;
    total: number;
  };
}

function DocLink({
  item,
  currentSlug,
  onNavigate,
  level = 0,
}: {
  item: SidebarDocItem;
  currentSlug: string;
  onNavigate: (slug: string) => void;
  level?: number;
}) {
  return (
    <div className="sidebar-item-wrapper">
      <a
        href={`/docs/${item.slug}`}
        className={clsx("sidebar-link", {
          active: currentSlug === item.slug || currentSlug === item.id,
        })}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(item.slug);
        }}
        style={{ paddingLeft: `${level * 0.75 + 0.75}rem` }}
      >
        <span className="sidebar-link-label">{item.label}</span>
      </a>
    </div>
  );
}

function SidebarNode({
  item,
  currentSlug,
  onNavigate,
  mode,
  onExpand,
  level = 0,
}: {
  item: SidebarItem;
  currentSlug: string;
  onNavigate: (slug: string) => void;
  mode: "focused" | "expanded";
  onExpand: (item: SidebarCategoryItem) => void;
  level?: number;
}) {
  if (item.type === "doc") {
    return (
      <DocLink
        item={item as SidebarDocItem}
        currentSlug={currentSlug}
        onNavigate={onNavigate}
        level={level}
      />
    );
  }

  const category = item as SidebarCategoryItem;
  const hasActive = category.items.some(
    (child: SidebarItem) => (child as any).slug === currentSlug || (child as any).id === currentSlug
  );

  const handleToggle = () => {
    onExpand(category);
  };

  return (
    <div className={clsx("sidebar-node", { "is-expanded": mode === "focused" })}>
      <button
        type="button"
        className={clsx("sidebar-category-header", { active: hasActive })}
        onClick={handleToggle}
        style={{ paddingLeft: `${level * 0.75 + 0.75}rem` }}
      >
        <span className="sidebar-category-label">
          {category.label}
          {category.count !== undefined && category.count > 0 && (
            <span className="sidebar-category-count">({category.count})</span>
          )}
        </span>
        <span className={clsx("sidebar-category-arrow", { "is-rotated": mode === "focused" })}>
          ›
        </span>
      </button>

      {mode === "focused" && (
        <div className="sidebar-sublist">
          {category.items.map((child: SidebarItem) => (
            <SidebarNode
              key={`node:${child.label || (child as any).slug}`}
              item={child}
              currentSlug={currentSlug}
              onNavigate={onNavigate}
              mode={mode}
              onExpand={onExpand}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FocusedView({
  sidebar,
  currentSlug,
  onNavigate,
  path,
  setPath,
  sidebarService,
}: {
  sidebar: readonly SidebarItem[];
  currentSlug: string;
  onNavigate: (slug: string) => void;
  path: readonly SidebarCategoryItem[];
  setPath: (path: readonly SidebarCategoryItem[]) => void;
  sidebarService: any;
}) {
  const currentItems = path.length === 0 ? sidebar : (path[path.length - 1]?.items ?? []);

  return (
    <div className="sidebar-content">
      {path.length > 0 && (
        <div className="sidebar-focused-header">
          <button
            type="button"
            className="sidebar-back-btn"
            onClick={() => {
              sidebarService.popCategory();
              setPath(sidebarService.getCurrentPath());
            }}
          >
            <span className="back-icon">←</span>
            <span className="back-label">
              Back to{" "}
              {path.length > 1
                ? path
                    .slice(0, -1)
                    .map((p) => p.label)
                    .join(" › ")
                : "Root"}
            </span>
          </button>
          <div className="sidebar-current-category">{path[path.length - 1]?.label}</div>
        </div>
      )}
      <div className="sidebar-tree-view">
        {currentItems.map((item: SidebarItem) => (
          <SidebarNode
            key={`focused:${item.label || (item as any).slug}`}
            item={item}
            currentSlug={currentSlug}
            onNavigate={onNavigate}
            mode="focused"
            onExpand={(cat) => {
              sidebarService.pushCategory(cat);
              setPath(sidebarService.getCurrentPath());
            }}
          />
        ))}
      </div>
    </div>
  );
}

function TreeView({
  sidebar,
  currentSlug,
  onNavigate,
}: {
  sidebar: readonly SidebarItem[];
  currentSlug: string;
  onNavigate: (slug: string) => void;
}) {
  const { sidebar: sidebarService } = useServices();

  return (
    <div className="sidebar-content">
      <div className="sidebar-tree-view">
        {sidebar.map((item) => (
          <SidebarNode
            key={`expanded:${item.label || (item as any).slug}`}
            item={item}
            currentSlug={currentSlug}
            onNavigate={onNavigate}
            mode="expanded"
            onExpand={(cat) => sidebarService.pushCategory(cat)}
          />
        ))}
      </div>
    </div>
  );
}

export function Sidebar({
  sidebar,
  currentSlug,
  onNavigate,
  isMobile = false,
  articlePosition,
}: SidebarProps) {
  const { sidebar: sidebarService } = useServices();
  const [path, setPath] = useState<readonly SidebarCategoryItem[]>(sidebarService.getCurrentPath());

  useEffect(() => {
    const unsubscribe = sidebarService.onPathChange((newPath) => {
      setPath(newPath);
    });
    return unsubscribe;
  }, [sidebarService]);

  useEffect(() => {
    const result = sidebarService.resolvePathForSlug(sidebar, currentSlug);
    if (result.isOk()) {
      sidebarService.setPath(result.value);
      setPath(result.value);
    } else {
      sidebarService.setPath([]);
      setPath([]);
    }
  }, [currentSlug, sidebar, sidebarService]);

  return (
    <>
      {path.length > 0 || isMobile ? (
        <FocusedView
          sidebar={sidebar}
          currentSlug={currentSlug}
          onNavigate={onNavigate}
          path={path}
          setPath={setPath}
          sidebarService={sidebarService}
        />
      ) : (
        <TreeView sidebar={sidebar} currentSlug={currentSlug} onNavigate={onNavigate} />
      )}
      {articlePosition && articlePosition.total > 0 && (
        <div className="sidebar-article-nav">
          <span className="sidebar-article-position">
            {String(articlePosition.current).padStart(2, "0")} / {articlePosition.total}
          </span>
        </div>
      )}
    </>
  );
}
