import { useState, useEffect, useCallback } from 'react';
import { WhaleProfile } from '../types';

const WATCHLIST_STORAGE_KEY = 'sw_watchlist';

interface UseWatchlistReturn {
  watchlist: WhaleProfile[];
  addWhale: (whale: WhaleProfile) => boolean;
  removeWhale: (address: string) => void;
  updateWhaleNotes: (address: string, notes: string) => void;
  isInWatchlist: (address: string) => boolean;
  clearWatchlist: () => void;
}

export const useWatchlist = (): UseWatchlistReturn => {
  const [watchlist, setWatchlist] = useState<WhaleProfile[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setWatchlist(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load watchlist from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever watchlist changes
  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    } catch (error) {
      console.error('Failed to save watchlist to localStorage:', error);
    }
  }, [watchlist]);

  const addWhale = useCallback((whale: WhaleProfile): boolean => {
    if (watchlist.some(w => w.address === whale.address)) {
      return false; // Already in watchlist
    }
    setWatchlist(prev => [whale, ...prev]);
    return true;
  }, [watchlist]);

  const removeWhale = useCallback((address: string) => {
    setWatchlist(prev => prev.filter(w => w.address !== address));
  }, []);

  const updateWhaleNotes = useCallback((address: string, notes: string) => {
    setWatchlist(prev => prev.map(w => 
      w.address === address ? { ...w, notes } : w
    ));
  }, []);

  const isInWatchlist = useCallback((address: string): boolean => {
    return watchlist.some(w => w.address === address);
  }, [watchlist]);

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
  }, []);

  return {
    watchlist,
    addWhale,
    removeWhale,
    updateWhaleNotes,
    isInWatchlist,
    clearWatchlist
  };
};

