
import { useState, useEffect, useCallback } from 'react';
import { WhaleProfile } from '../types';
import {
  fetchWatchlistFromAPI,
  addToWatchlistAPI,
  removeFromWatchlistAPI,
  updateWatchlistNotesAPI,
  WatchlistItem
} from '../services/apiClient';

interface UseWatchlistReturn {
  watchlist: WhaleProfile[];
  addWhale: (whale: WhaleProfile) => Promise<boolean>;
  removeWhale: (address: string) => Promise<void>;
  updateWhaleNotes: (address: string, notes: string) => Promise<void>;
  isInWatchlist: (address: string) => boolean;
  clearWatchlist: () => void;
  isLoading: boolean;
}

// 将 WatchlistItem 转换为 WhaleProfile
const convertToWhaleProfile = (item: WatchlistItem): WhaleProfile => {
  return {
    address: item.wallet_address,
    label: item.wallet_address.slice(0, 6) + '...' + item.wallet_address.slice(-4),
    winRate: 0,
    pnl30d: '0%',
    trustScore: 0,
    tags: [],
    notes: item.remark || undefined
  };
};

export const useWatchlist = (): UseWatchlistReturn => {
  const [watchlist, setWatchlist] = useState<WhaleProfile[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 从 API 加载关注列表
  const loadWatchlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await fetchWatchlistFromAPI();
      setWatchlistItems(items);
      setWatchlist(items.map(convertToWhaleProfile));
    } catch (error) {
      console.error('Failed to load watchlist from API:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 组件挂载时加载
  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const addWhale = useCallback(async (whale: WhaleProfile): Promise<boolean> => {
    // 检查是否已存在
    if (watchlist.some(w => w.address === whale.address)) {
      return false; // Already in watchlist
    }

    try {
      const item = await addToWatchlistAPI(whale.address, whale.notes || undefined);
      setWatchlistItems(prev => [item, ...prev]);
      setWatchlist(prev => [convertToWhaleProfile(item), ...prev]);
      return true;
    } catch (error) {
      console.error('Failed to add whale to watchlist:', error);
      return false;
    }
  }, [watchlist]);

  const removeWhale = useCallback(async (address: string) => {
    const item = watchlistItems.find(w => w.wallet_address === address);
    if (!item) return;

    try {
      await removeFromWatchlistAPI(item.id);
      setWatchlistItems(prev => prev.filter(w => w.id !== item.id));
      setWatchlist(prev => prev.filter(w => w.address !== address));
    } catch (error) {
      console.error('Failed to remove whale from watchlist:', error);
    }
  }, [watchlistItems]);

  const updateWhaleNotes = useCallback(async (address: string, notes: string) => {
    const item = watchlistItems.find(w => w.wallet_address === address);
    if (!item) return;

    try {
      const updatedItem = await updateWatchlistNotesAPI(item.id, notes);
      setWatchlistItems(prev => prev.map(w => 
        w.id === item.id ? updatedItem : w
      ));
      setWatchlist(prev => prev.map(w => 
        w.address === address ? { ...w, notes } : w
      ));
    } catch (error) {
      console.error('Failed to update whale notes:', error);
    }
  }, [watchlistItems]);

  const isInWatchlist = useCallback((address: string): boolean => {
    return watchlist.some(w => w.address === address);
  }, [watchlist]);

  const clearWatchlist = useCallback(() => {
    // 删除所有项
    Promise.all(watchlistItems.map(item => removeFromWatchlistAPI(item.id)))
      .then(() => {
        setWatchlistItems([]);
        setWatchlist([]);
      })
      .catch(error => {
        console.error('Failed to clear watchlist:', error);
      });
  }, [watchlistItems]);

  return {
    watchlist,
    addWhale,
    removeWhale,
    updateWhaleNotes,
    isInWatchlist,
    clearWatchlist,
    isLoading
  };
};

