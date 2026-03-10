'use client';

import { createContext, useContext, useState } from 'react';

interface SearchContextType {
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <SearchContext.Provider value={{ globalSearch, setGlobalSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useGlobalSearch must be used within a SearchProvider');
  }
  return context;
}