
import { WhaleAsset, TokenInfo, WhaleTransaction } from '../types';
import { HELIUS_RPC_URL } from '../constants';
import { cache } from '../utils/cache';

// 获取 API Key
// @ts-ignore
const API_KEY = (process.env.HELIUS_API_KEY || process.env.API_KEY || '').trim();

// 缓存 TTL（毫秒）
const HOLDINGS_CACHE_TTL = 10 * 60 * 1000; // 10 分钟
const TRANSACTIONS_CACHE_TTL = 5 * 60 * 1000; // 5 分钟

/**
 * 获取指定地址的代币持仓情况
 * @param address 钱包地址
 * @param useCache 是否使用缓存（默认 true）
 */
export const getHoldings = async (address: string, useCache: boolean = true): Promise<TokenInfo[]> => {
  // 如果没有 API Key，直接返回模拟数据
  if (!API_KEY) {
    return getMockHoldings(address);
  }

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
    const baseUrl = HELIUS_RPC_URL.endsWith('/') ? HELIUS_RPC_URL.slice(0, -1) : HELIUS_RPC_URL;
    const url = `${baseUrl}/?api-key=${API_KEY}`;
    
    // 获取所有资产（处理分页）
    let allItems: WhaleAsset[] = [];
    let page = 1;
    let hasMore = true;
    let nativeBalance: any = null;
    const maxPages = 100; // 最大页数限制，防止无限循环

    while (hasMore && page <= maxPages) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: `page-${page}`,
            method: 'getAssetsByOwner',
            params: {
              ownerAddress: address,
              page: page,
              limit: 1000, // DAS API 支持的最大限制
              displayOptions: { 
                showFungible: true, 
                showNativeBalance: page === 1, // 只在第一页获取原生余额
                showCollectionMetadata: false,
                showUnverifiedCollections: false
              }
            }
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error.message || 'DAS API error');
        }
        
        const result = data.result;
        if (!result) {
          throw new Error('Invalid response from DAS API');
        }

        const items: WhaleAsset[] = result.items || [];
        allItems = allItems.concat(items);

        // 保存原生余额（只在第一页获取）
        if (page === 1 && result.nativeBalance) {
          nativeBalance = result.nativeBalance;
        }

        // 检查是否还有更多页面
        // DAS API 返回 items.length，如果等于 limit，可能还有更多
        const currentPageItems = items.length;
        hasMore = currentPageItems === 1000; // 如果返回了完整的 1000 条，可能还有更多
        
        if (hasMore) {
          console.log(`[DAS] Page ${page}: ${currentPageItems} items, fetching next page...`);
        }
        
        page++;
      } catch (pageError) {
        console.error(`[DAS] Error fetching page ${page}:`, pageError);
        // 如果第一页就失败，抛出错误
        if (page === 1) {
          throw pageError;
        }
        // 如果后续页面失败，使用已获取的数据
        break;
      }
    }

    if (page > maxPages) {
      console.warn(`[DAS] Reached max pages (${maxPages}) for ${address.slice(0, 8)}...`);
    }

    console.log(`[DAS] Fetched ${allItems.length} total assets for ${address.slice(0, 8)}...`);

    // 处理可替代代币（FungibleToken 和 FungibleAsset）
    const tokens: TokenInfo[] = allItems
      .filter(item => {
        // 只处理可替代代币，排除 NFT
        const isFungible = item.interface === 'FungibleToken' || item.interface === 'FungibleAsset';
        // 确保有 token_info 和余额信息
        if (!item.token_info) return false;
        const hasBalance = item.token_info.balance && item.token_info.balance > 0;
        return isFungible && hasBalance;
      })
      .map(item => {
        const info = item.token_info!;
        const metadata = item.content?.metadata;
        const balance = info.balance || 0;
        const decimals = info.decimals || 0;
        const balanceFormatted = decimals > 0 ? balance / Math.pow(10, decimals) : balance;

        // 获取代币名称和符号
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
      // 过滤掉余额为 0 的代币
      .filter(token => token.balance > 0);

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
    
    console.log(`[DAS] Processed ${result.length} tokens for ${address.slice(0, 8)}...`);
    return result;
  } catch (error) {
    console.error('[DAS] Fetch failed:', error);
    // 如果 API 调用失败，返回模拟数据
    return getMockHoldings(address);
  }
};

/**
 * 获取地址的近期交易记录
 * @param address 钱包地址
 * @param useCache 是否使用缓存（默认 true）
 */
export const getRecentTransactions = async (address: string, useCache: boolean = true): Promise<WhaleTransaction[]> => {
  if (!API_KEY) return getMockTransactions(address);
  
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
    const url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${API_KEY}&limit=10`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Tx Fetch failed');

    const data = await response.json();
    if (!Array.isArray(data)) return getMockTransactions(address);

    const transactions = data.map((tx: any) => ({
      signature: tx.signature,
      timestamp: tx.timestamp,
      type: tx.type,
      description: tx.description || 'On-chain verification pending',
      source: tx.source,
      fee: tx.fee / 1e9,
      isMock: false
    }));

    // 缓存结果
    if (useCache) {
      const cacheKey = `transactions:${address}`;
      cache.set(cacheKey, transactions, TRANSACTIONS_CACHE_TTL);
    }

    return transactions;
  } catch (error) {
    return getMockTransactions(address);
  }
};

// --- 模拟数据生成器 ---

function getMockHoldings(address: string): TokenInfo[] {
  // 知名地址的定制模拟
  if (address.includes('vines1')) {
    return [
      { mint: '1', symbol: 'SOL', name: 'Solana', balance: 42069.5, decimals: 9, price_info: { price_per_token: 145.2, total_price: 6108418 }, isMock: true },
      { mint: '2', symbol: 'JUP', name: 'Jupiter', balance: 1250000, decimals: 6, price_info: { price_per_token: 1.12, total_price: 1400000 }, isMock: true }
    ];
  }
  // 通用模拟
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
