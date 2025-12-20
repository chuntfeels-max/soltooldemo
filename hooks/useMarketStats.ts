import { useState, useEffect } from 'react';
import { getMarketStats } from '../services/marketDataService';

interface MarketStats {
  solPrice: number;
  tps: number;
}

const INITIAL_STATS: MarketStats = {
  solPrice: 145.20,
  tps: 2840
};

const UPDATE_INTERVAL = 30000; // 30 秒更新一次（与缓存时间一致）

export const useMarketStats = (enabled: boolean = true): MarketStats => {
  const [stats, setStats] = useState<MarketStats>(INITIAL_STATS);

  useEffect(() => {
    if (!enabled) return;

    const updateStats = async () => {
      try {
        const marketStats = await getMarketStats();
        setStats(marketStats);
      } catch (error) {
        console.error('Failed to update market stats:', error);
        // 保持当前值，不更新
      }
    };

    // 立即获取一次
    updateStats();

    // 定期更新
    const interval = setInterval(updateStats, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [enabled]);

  return stats;
};

