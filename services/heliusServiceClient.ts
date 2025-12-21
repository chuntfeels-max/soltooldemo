
import { TokenInfo, WhaleTransaction } from '../types';
import { fetchAssetsFromAPI, fetchTransactionsFromAPI } from './apiClient';
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

    // 如果获取到真实数据，直接返回（不再返回模拟数据）
    if (tokens.length > 0) {
      // 缓存结果
      if (useCache) {
        const cacheKey = `holdings:${address}`;
        cache.set(cacheKey, tokens, HOLDINGS_CACHE_TTL);
      }
      console.log(`[API] Processed ${tokens.length} tokens for ${address.slice(0, 8)}...`);
      return tokens;
    }

    // 如果没有资产，返回空数组
    console.log(`[API] No tokens found for ${address.slice(0, 8)}...`);
    return [];
  } catch (error) {
    console.error('[API] Fetch failed:', error);
    // 如果 API 调用失败，抛出错误而不是返回模拟数据
    throw error;
  }
};

/**
 * 获取地址的近期交易记录（使用真实的 Helius API）
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

  try {
    // 调用 API Route 获取真实交易记录
    const apiData = await fetchTransactionsFromAPI(address, 5);
    const { transactions: rawTransactions } = apiData;

    // 转换格式以匹配前端期望的结构
    const transactions: WhaleTransaction[] = rawTransactions.map((tx: any) => ({
      signature: tx.signature,
      timestamp: tx.blockTime || Math.floor(Date.now() / 1000),
      type: tx.memo || 'TRANSFER',
      description: tx.memo || `Transaction ${tx.signature.slice(0, 8)}...${tx.signature.slice(-8)}`,
      source: 'Solana Network',
      fee: 0.000005, // 默认费用，实际可以从交易详情中获取
      isMock: false
    }));

    // 缓存结果
    if (useCache) {
      const cacheKey = `transactions:${address}`;
      cache.set(cacheKey, transactions, 5 * 60 * 1000);
    }

    console.log(`[API] Fetched ${transactions.length} transactions for ${address.slice(0, 8)}...`);
    return transactions;
  } catch (error) {
    console.error('[API] Failed to fetch transactions:', error);
    // 如果 API 调用失败，返回空数组而不是模拟数据
    return [];
  }
};

// 注意：已移除模拟数据生成器，现在只使用真实 API 数据

