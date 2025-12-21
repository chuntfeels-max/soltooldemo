
import { TokenInfo, AnalysisResult, WhaleTransaction } from '../types';
import { Language } from './i18n';

/**
 * 客户端 API 调用封装
 */

// 调用 Helius Assets API
export const fetchAssetsFromAPI = async (address: string): Promise<any> => {
  const response = await fetch('/api/helius/assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch assets');
  }

  return response.json();
};

// 调用 Gemini Analyze API
export const analyzeWalletFromAPI = async (
  holdings: TokenInfo[],
  history: WhaleTransaction[],
  lang: Language = 'zh'
): Promise<AnalysisResult> => {
  const response = await fetch('/api/gemini/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ holdings, history, lang })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze wallet');
  }

  return response.json();
};

// 调用 Helius Transactions API
export const fetchTransactionsFromAPI = async (address: string, limit: number = 5): Promise<any> => {
  const response = await fetch('/api/helius/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, limit })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch transactions');
  }

  return response.json();
};

// Watchlist API
export interface WatchlistItem {
  id: string;
  wallet_address: string;
  remark: string | null;
  added_at: string;
  user_id: string;
}

export const fetchWatchlistFromAPI = async (): Promise<WatchlistItem[]> => {
  const response = await fetch('/api/watchlist');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch watchlist');
  }

  const data = await response.json();
  return data.data || [];
};

export const addToWatchlistAPI = async (
  wallet_address: string,
  remark?: string
): Promise<WatchlistItem> => {
  const response = await fetch('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet_address, remark })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add to watchlist');
  }

  const data = await response.json();
  return data.data;
};

export const removeFromWatchlistAPI = async (id: string): Promise<void> => {
  const response = await fetch(`/api/watchlist?id=${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove from watchlist');
  }
};

// 按地址删除（备用方法）
export const removeFromWatchlistByAddressAPI = async (wallet_address: string): Promise<void> => {
  const response = await fetch(`/api/watchlist?wallet_address=${wallet_address}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove from watchlist');
  }
};

export const updateWatchlistNotesAPI = async (
  id: string,
  remark: string
): Promise<WatchlistItem> => {
  const response = await fetch('/api/watchlist/update-notes', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, remark })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update watchlist notes');
  }

  const data = await response.json();
  return data.data;
};

