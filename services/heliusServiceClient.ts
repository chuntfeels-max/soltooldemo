
import { TokenInfo, WhaleTransaction } from '../types';
import { fetchAssetsFromAPI } from './apiClient';
import { cache } from '../utils/cache';

// 缓存 TTL（毫秒）
const HOLDINGS_CACHE_TTL = 10 * 60 * 1000; // 10 分钟

/**
 * 获取指定地址的代币持仓情况（使用 API Route）
 */
export const getHoldings = async (address: string, useCache: boolean = true): Promise<TokenInfo[]> => {
  // 检查缓存
  if (useCache) {
    const cacheKey = `holdings:${address}`;
    const cached = cache.get<TokenInfo[]>(cacheKey);
    if (cached) {
      console.log(`[Cache] Using cached holdings for ${address.slice(0, 8)}...`);
      return cached;
    }
  }

  try {
    // 调用 API Route
    const apiData = await fetchAssetsFromAPI(address);
    const { items: allItems, nativeBalance } = apiData;

    // 处理可替代代币（FungibleToken 和 FungibleAsset）
    const tokens: TokenInfo[] = allItems
      .filter((item: any) => {
        const isFungible = item.interface === 'FungibleToken' || item.interface === 'FungibleAsset';
        if (!item.token_info) return false;
        const hasBalance = item.token_info.balance && item.token_info.balance > 0;
        return isFungible && hasBalance;
      })
      .map((item: any) => {
        const info = item.token_info!;
        const metadata = item.content?.metadata;
        const balance = info.balance || 0;
        const decimals = info.decimals || 0;
        const balanceFormatted = decimals > 0 ? balance / Math.pow(10, decimals) : balance;

        const symbol = info.symbol || metadata?.symbol || 'UNKNOWN';
        const name = metadata?.name || symbol || 'Unknown Token';

        return {
          mint: info.mint || item.id,
          symbol: symbol,
          name: name,
          balance: balanceFormatted,
          decimals: decimals,
          price_info: info.price_info ? {
            price_per_token: info.price_info.price_per_token || 0,
            total_price: info.price_info.total_price || 0,
            currency: 'USD'
          } : undefined,
          image_url: item.content?.links?.image || item.content?.files?.[0]?.uri,
          isMock: false
        };
      })
      .filter((token: TokenInfo) => token.balance > 0);

    // 添加原生 SOL 余额
    if (nativeBalance && nativeBalance.lamports > 0) {
      const solBalance = nativeBalance.lamports / 1e9;
      tokens.unshift({
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        balance: solBalance,
        decimals: 9,
        isNative: true,
        price_info: {
          price_per_token: nativeBalance.price_per_sol || 145.5,
          total_price: nativeBalance.total_price || (solBalance * 145.5),
          currency: 'USD'
        },
        image_url: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        isMock: false
      });
    }

    // 按总价值排序（从高到低）
    tokens.sort((a, b) => {
      const valueA = a.price_info?.total_price || 0;
      const valueB = b.price_info?.total_price || 0;
      return valueB - valueA;
    });

    const result = tokens.length > 0 ? tokens : getMockHoldings(address);

    // 缓存结果
    if (useCache) {
      const cacheKey = `holdings:${address}`;
      cache.set(cacheKey, result, HOLDINGS_CACHE_TTL);
    }

    console.log(`[API] Processed ${result.length} tokens for ${address.slice(0, 8)}...`);
    return result;
  } catch (error) {
    console.error('[API] Fetch failed:', error);
    // 如果 API 调用失败，返回模拟数据
    return getMockHoldings(address);
  }
};

/**
 * 获取地址的近期交易记录（保留原有逻辑，目前仍使用模拟数据）
 */
export const getRecentTransactions = async (address: string, useCache: boolean = true): Promise<WhaleTransaction[]> => {
  // 检查缓存
  if (useCache) {
    const cacheKey = `transactions:${address}`;
    const cached = cache.get<WhaleTransaction[]>(cacheKey);
    if (cached) {
      console.log(`[Cache] Using cached transactions for ${address.slice(0, 8)}...`);
      return cached;
    }
  }

  // TODO: 未来可以添加交易记录的 API Route
  // 目前返回模拟数据
  const transactions = getMockTransactions(address);

  // 缓存结果
  if (useCache) {
    const cacheKey = `transactions:${address}`;
    cache.set(cacheKey, transactions, 5 * 60 * 1000);
  }

  return transactions;
};

// --- 模拟数据生成器 ---
function getMockHoldings(address: string): TokenInfo[] {
  if (address.includes('vines1')) {
    return [
      { mint: '1', symbol: 'SOL', name: 'Solana', balance: 42069.5, decimals: 9, price_info: { price_per_token: 145.2, total_price: 6108418 }, isMock: true },
      { mint: '2', symbol: 'JUP', name: 'Jupiter', balance: 1250000, decimals: 6, price_info: { price_per_token: 1.12, total_price: 1400000 }, isMock: true }
    ];
  }
  return [
    { mint: 'm1', symbol: 'SOL', name: 'Solana (Demo)', balance: 10.5, decimals: 9, price_info: { price_per_token: 145, total_price: 1522.5 }, isMock: true },
    { mint: 'm2', symbol: 'BONK', name: 'Bonk (Demo)', balance: 50000000, decimals: 5, price_info: { price_per_token: 0.00002, total_price: 1000 }, isMock: true }
  ];
}

function getMockTransactions(address: string): WhaleTransaction[] {
  return [
    { signature: 'mock_1', timestamp: Date.now() / 1000 - 300, type: 'SWAP', description: 'Swapped 100 SOL for 12,000 JUP (Simulated)', source: 'Jupiter', fee: 0.000005, isMock: true },
    { signature: 'mock_2', timestamp: Date.now() / 1000 - 3600, type: 'TRANSFER', description: 'Received 5,000 USDC (Simulated)', source: 'System', fee: 0.000005, isMock: true }
  ];
}

