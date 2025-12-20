import { useState, useEffect, useCallback } from 'react';

const SEARCH_HISTORY_STORAGE_KEY = 'sw_recent_searches';
const MAX_HISTORY_ITEMS = 5;

interface UseSearchHistoryReturn {
  recentSearches: string[];
  addSearch: (address: string) => void;
  clearHistory: () => void;
  removeSearch: (address: string) => void;
}

export const useSearchHistory = (): UseSearchHistoryReturn => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load search history from localStorage:', error);
    }
  }, []);

  const addSearch = useCallback((address: string) => {
    const cleanAddr = address.trim();
    if (!cleanAddr) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(a => a !== cleanAddr);
      const updated = [cleanAddr, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      try {
        localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
      
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);

  const removeSearch = useCallback((address: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(a => a !== address);
      try {
        localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(filtered));
      } catch (error) {
        console.error('Failed to update search history:', error);
      }
      return filtered;
    });
  }, []);

  return {
    recentSearches,
    addSearch,
    clearHistory,
    removeSearch
  };
};

