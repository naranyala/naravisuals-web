import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

interface SearchContextType {
  searchOpen: boolean;
  setSearch: (open: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  const setSearch = useCallback((open: boolean) => {
    setSearchOpen(open);
  }, []);

  const value = {
    searchOpen,
    setSearch,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
