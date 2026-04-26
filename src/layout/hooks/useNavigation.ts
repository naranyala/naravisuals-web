import { useCallback, useEffect, useState } from "react";
import { useDocState } from "../../core/store";
import { allDocs, type DocEntry, type SidebarItem, sidebarData } from "../../generated";
import type { ServiceContainer } from "../../services";

export function useNavigation(services: ServiceContainer) {
  const { setDoc } = useDocState();
  const resolveSlug = useCallback((): string => {
    const path = services.router.getCurrentPath();
    if (path === "/" || path === "") return "abstract";
    if (path === `/${services.config.routes.docs}` || path === `/${services.config.routes.docs}/`) {
      return "abstract";
    }
    if (path.startsWith(`/${services.config.routes.docs}/`)) {
      return path.replace(`/${services.config.routes.docs}/`, "");
    }
    return allDocs[0]?.slug || "abstract";
  }, [services.router, services.config.routes.docs]);

  const [currentSlug, setCurrentSlug] = useState(resolveSlug);
  const currentDoc = allDocs.find((d) => d.slug === currentSlug || d.id === currentSlug) ?? null;

  useEffect(() => {
    if (currentDoc) {
      setDoc(currentDoc as any);
    }
  }, [currentDoc, setDoc]);

  const navigate = (
    target: string,
    isMobile: boolean,
    setSidebarVisible: (v: boolean) => void,
    setTocVisible: (v: boolean) => void
  ) => {
    const [slug] = target.split("#");
    if (!slug) return;

    services.events.emit("nav:navigate", { target, isMobile });

    if (slug === "/") {
      setCurrentSlug("abstract");
      services.router.pushState({}, "", "/");
    } else {
      setCurrentSlug(slug);
      services.router.pushState(
        {},
        "",
        services.router.buildUrl(services.config.routes.docs, target)
      );
    }
    setSidebarVisible(!isMobile);
    setTocVisible(false);
  };

  useEffect(() => {
    services.events.emit("nav:resolved", { slug: currentSlug });
  }, [currentSlug, services.events]);

  const getDocsInSidebarOrder = useCallback((): DocEntry[] => {
    const ordered: DocEntry[] = [];

    const traverse = (items: SidebarItem[]) => {
      for (const item of items) {
        if (item.type === "doc") {
          const doc = allDocs.find((d) => d.slug === item.slug || d.id === item.id);
          if (doc && !ordered.find((d) => d.slug === doc.slug)) {
            ordered.push(doc);
          }
        } else if (item.type === "category") {
          // 1. If category has a landing page doc, add it first
          if (item.link) {
            const linkDoc = allDocs.find((d) => d.slug === item.link?.id || d.id === item.link?.id);
            if (linkDoc && !ordered.find((d) => d.slug === linkDoc.slug)) {
              ordered.push(linkDoc);
            }
          }
          // 2. Recursively add all docs in child items
          if (item.items) {
            traverse(item.items);
          }
        }
      }
    };

    traverse(sidebarData as SidebarItem[]);
    return ordered;
  }, []);

  useEffect(() => {
    const unsubscribe = services.router.onPopState(() => {
      setCurrentSlug(resolveSlug());
    });
    return unsubscribe;
  }, [services.router.onPopState, resolveSlug]);

  return { currentSlug, currentDoc, navigate, getDocsInSidebarOrder, setCurrentSlug, resolveSlug };
}
