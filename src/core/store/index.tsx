import type React from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { DocEntry } from "@/generated";

// --- UI State Types ---
interface UIState {
  sidebarVisible: boolean;
  tocVisible: boolean;
  settingsOpen: boolean;
  menuOpen: boolean;
  viewMode: "view" | "ast" | "raw";
  isMobile: boolean;
  isTocMobile: boolean;
}

interface UIStoreActions {
  toggleSidebar: () => void;
  toggleToc: () => void;
  setSidebar: (visible: boolean) => void;
  setToc: (visible: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setViewMode: (mode: "view" | "ast" | "raw") => void;
  updateResponsive: (width: number, mobileBreakpoint: number, tocBreakpoint: number) => void;
  setSettingsOpen: (open: boolean) => void;
}

// --- Doc State Types ---
interface DocState {
  currentSlug: string;
  currentDoc: DocEntry | null;
}

interface DocStoreActions {
  setDoc: (doc: DocEntry) => void;
  setSlug: (slug: string) => void;
}

// --- Context Definition ---
interface StoreContextType {
  ui: UIState & UIStoreActions;
  doc: DocState & DocStoreActions;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // UI State
  const [uiState, setUiState] = useState<UIState>({
    sidebarVisible: true,
    tocVisible: false,
    settingsOpen: false,
    menuOpen: false,
    viewMode: "view",
    isMobile: false,
    isTocMobile: false,
  });

  // Doc State
  const [docState, setDocState] = useState<DocState>({
    currentSlug: "",
    currentDoc: null,
  });

  // UI Actions
  const toggleSidebar = useCallback(() => {
    setUiState((prev) => ({ ...prev, sidebarVisible: !prev.sidebarVisible }));
  }, []);

  const toggleToc = useCallback(() => {
    setUiState((prev) => ({ ...prev, tocVisible: !prev.tocVisible }));
  }, []);

  const setSidebar = useCallback((visible: boolean) => {
    setUiState((prev) => ({ ...prev, sidebarVisible: visible }));
  }, []);

  const setToc = useCallback((visible: boolean) => {
    setUiState((prev) => ({ ...prev, tocVisible: visible }));
  }, []);

  const setMenuOpen = useCallback((open: boolean) => {
    setUiState((prev) => ({ ...prev, menuOpen: open }));
  }, []);

  const setViewMode = useCallback((mode: "view" | "ast" | "raw") => {
    setUiState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const setSettingsOpen = useCallback((open: boolean) => {
    setUiState((prev) => ({ ...prev, settingsOpen: open }));
  }, []);

  const updateResponsive = useCallback(
    (width: number, mobileBreakpoint: number, tocBreakpoint: number) => {
      setUiState((prev) => ({
        ...prev,
        isMobile: width <= mobileBreakpoint,
        isTocMobile: width <= tocBreakpoint,
      }));
    },
    []
  );

  // Doc Actions
  const setDoc = useCallback((doc: DocEntry) => {
    setDocState({ currentDoc: doc, currentSlug: doc.slug });
  }, []);

  const setSlug = useCallback((slug: string) => {
    setDocState((prev) => ({ ...prev, currentSlug: slug }));
  }, []);

  const ui = useMemo(
    () => ({
      ...uiState,
      toggleSidebar,
      toggleToc,
      setSidebar,
      setToc,
      setMenuOpen,
      setViewMode,
      updateResponsive,
      setSettingsOpen,
    }),
    [
      uiState,
      toggleSidebar,
      toggleToc,
      setSidebar,
      setToc,
      setMenuOpen,
      setViewMode,
      updateResponsive,
      setSettingsOpen,
    ]
  );

  const doc = useMemo(
    () => ({
      ...docState,
      setDoc,
      setSlug,
    }),
    [docState, setDoc, setSlug]
  );

  return <StoreContext.Provider value={{ ui, doc }}>{children}</StoreContext.Provider>;
}

export function useUIState() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useUIState must be used within a StoreProvider");
  }
  return context.ui;
}

export function useDocState() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useDocState must be used within a StoreProvider");
  }
  return context.doc;
}
