import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

interface MetadataContextType {
  wordStatsOpen: boolean;
  toggleWordStatsOpen: () => void;
  setWordStatsOpen: (open: boolean) => void;
  graphOpen: boolean;
  toggleGraphOpen: () => void;
  setGraphOpen: (open: boolean) => void;
}

const MetadataContext = createContext<MetadataContextType | undefined>(undefined);

export function MetadataProvider({ children }: { children: React.ReactNode }) {
  const [wordStatsOpen, setWordStatsOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);

  const toggleWordStatsOpen = useCallback(() => {
    setWordStatsOpen((prev) => !prev);
  }, []);

  const toggleGraphOpen = useCallback(() => {
    setGraphOpen((prev) => !prev);
  }, []);

  const value = {
    wordStatsOpen,
    toggleWordStatsOpen,
    setWordStatsOpen,
    graphOpen,
    toggleGraphOpen,
    setGraphOpen,
  };

  return <MetadataContext.Provider value={value}>{children}</MetadataContext.Provider>;
}

export function useMetadata() {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error("useMetadata must be used within a MetadataProvider");
  }
  return context;
}
