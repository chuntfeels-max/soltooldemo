/**
 * 市场数据服务
 * 获取真实的 SOL 价格和网络 TPS 数据
 */

interface MarketStats {
  solPrice: number;
  tps: number;
}

const CACHE_TTL = 30000; // 30 秒缓存
let cachedStats: MarketStats | null = null;
let cacheTimestamp = 0;

/**
 * 从 CoinGecko 获取 SOL 价格（带备用方案）
 */
async function fetchSolPrice(): Promise<number> {
  // 方案1: CoinGecko（主要数据源）
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const price = data.solana?.usd;
      if (price && price > 0) {
        return price;
      }
    }
  } catch (error) {
    console.warn('[MarketData] CoinGecko price fetch failed:', error);
  }

  // 方案2: Binance API（备用）
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT');
    if (response.ok) {
      const data = await response.json();
      const price = parseFloat(data.price);
      if (price > 0) {
        return price;
      }
    }
  } catch (error) {
    console.warn('[MarketData] Binance price fetch failed:', error);
  }

  // 如果都失败，返回 0（会使用默认值）
  return 0;
}

/**
 * 从 Solana 网络获取 TPS（使用多个备用数据源）
 */
async function fetchNetworkTPS(): Promise<number> {
  // 尝试多个数据源，按优先级排序
  const dataSources = [
    // 方案1: 使用 Solscan API（更可靠）
    async () => {
      try {
        const response = await fetch('https://api.solscan.io/chaininfo?cluster=mainnet', {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          return data.data?.tps || 0;
        }
      } catch (e) {
        // 忽略错误，继续尝试下一个
      }
      return 0;
    },
    // 方案2: 使用 Helius（如果有 API Key）
    async () => {
      try {
        // @ts-ignore
        const heliusKey = (process.env.HELIUS_API_KEY || process.env.API_KEY || '').trim();
        if (!heliusKey) return 0;
        
        const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getRecentPerformanceSamples',
            params: [1]
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.result && data.result.length > 0) {
            const sample = data.result[0];
            const tps = sample.numTransactions / (sample.samplePeriodSecs || 1);
            return Math.round(tps);
          }
        }
      } catch (e) {
        // 忽略错误
      }
      return 0;
    },
    // 方案3: 使用 SolanaFM API
    async () => {
      try {
        const response = await fetch('https://api.solanafm.com/v1/network/stats', {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          return data.tps || data.transactions_per_second || 0;
        }
      } catch (e) {
        // 忽略错误
      }
      return 0;
    }
  ];

  // 按顺序尝试各个数据源
  for (const fetchFn of dataSources) {
    const tps = await fetchFn();
    if (tps > 0) {
      return tps;
    }
  }

  // 如果所有数据源都失败，返回默认值
  console.warn('[MarketData] All TPS data sources failed, using default value');
  return 0;
}

/**
 * 获取市场统计数据（带缓存和错误处理）
 */
export async function getMarketStats(): Promise<MarketStats> {
  const now = Date.now();
  
  // 如果缓存有效，直接返回
  if (cachedStats && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedStats;
  }
  
  try {
    // 并行获取价格和 TPS（带超时保护）
    const [solPrice, tps] = await Promise.all([
      Promise.race([
        fetchSolPrice(),
        new Promise<number>(resolve => setTimeout(() => resolve(0), 5000))
      ]),
      Promise.race([
        fetchNetworkTPS(),
        new Promise<number>(resolve => setTimeout(() => resolve(0), 5000))
      ])
    ]);
    
    const stats: MarketStats = {
      solPrice: solPrice || cachedStats?.solPrice || 145.20, // 优先使用缓存值
      tps: tps || cachedStats?.tps || 2840
    };
    
    // 只有在成功获取到数据时才更新缓存
    if (solPrice > 0 || tps > 0) {
      cachedStats = stats;
      cacheTimestamp = now;
    }
    
    return stats;
  } catch (error) {
    console.warn('[MarketData] Error fetching market stats, using cached/default values:', error);
    // 返回缓存的数据或默认值
    return cachedStats || {
      solPrice: 145.20,
      tps: 2840
    };
  }
}

