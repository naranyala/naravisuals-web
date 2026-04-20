import { useEffect, useState } from "react";
import { allDocs, type DocEntry, type SidebarItem, sidebarData } from "../../generated";
import type { ServiceContainer } from "../../services";
import { useDocState } from "../../core/store";

export function useNavigation(services: ServiceContainer) {
  const { setDoc } = useDocState();
  const resolveSlug = (): string => {
    const path = services.router.getCurrentPath();
    if (path === "/" || path === "") return "welcome";
    if (path === `/${services.config.routes.docs}` || path === `/${services.config.routes.docs}/`) {
      return "welcome";
    }
    if (path.startsWith(`/${services.config.routes.docs}/`)) {
      return path.replace(`/${services.config.routes.docs}/`, "");
    }
    return allDocs[0]?.slug || "welcome";
  };

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
    
    setCurrentSlug(slug);
    services.router.pushState(
      {},
      "",
      services.router.buildUrl(services.config.routes.docs, target)
    );
    setSidebarVisible(!isMobile);
    setTocVisible(false);
  };

  useEffect(() => {
    services.events.emit("nav:resolved", { slug: currentSlug });
  }, [currentSlug, services.events]);

  const getDocsInSidebarOrder = (): DocEntry[] => {
    const ordered: DocEntry[] = [];
    for (const item of sidebarData as SidebarItem[]) {
      if (item.type === "doc") {
        const doc = allDocs.find((d) => d.slug === item.slug || d.id === item.id);
        if (doc) ordered.push(doc);
      } else if (item.type === "category") {
        if (item.link) {
          const linkDoc = allDocs.find((d) => d.slug === item.link?.id || d.id === item.link?.id);
          if (linkDoc && !ordered.find((d) => d.slug === linkDoc.slug)) {
            ordered.push(linkDoc);
          }
        }
        for (const child of item.items) {
          if (child.type === "doc") {
            const doc = allDocs.find((d) => d.slug === child.slug || d.id === child.id);
            if (doc && !ordered.find((d) => d.slug === doc.slug)) {
              ordered.push(doc);
            }
          }
        }
      }
    }
    return ordered;
  };

  useEffect(() => {
    const unsubscribe = services.router.onPopState(() => {
      setCurrentSlug(resolveSlug());
    });
    return unsubscribe;
  }, []);

  return { currentSlug, currentDoc, navigate, getDocsInSidebarOrder, setCurrentSlug, resolveSlug };
}
