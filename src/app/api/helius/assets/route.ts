
import { NextRequest, NextResponse } from 'next/server';

const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com';
const API_KEY = process.env.HELIUS_API_KEY || '';
const JUPITER_PRICE_API = 'https://price.jup.ag/v4/price';

/**
 * 从 Jupiter Price API 获取代币价格
 */
async function getTokenPrice(mint: string): Promise<number | null> {
  try {
    const response = await fetch(`${JUPITER_PRICE_API}?ids=${mint}`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const priceData = data.data?.[mint];
    return priceData?.price || null;
  } catch (error) {
    console.error(`[Jupiter] Failed to fetch price for ${mint}:`, error);
    return null;
  }
}

/**
 * 批量获取代币价格（Jupiter API 支持批量查询）
 */
async function getTokenPrices(mints: string[]): Promise<Record<string, number>> {
  if (mints.length === 0) return {};
  
  try {
    const ids = mints.join(',');
    const response = await fetch(`${JUPITER_PRICE_API}?ids=${ids}`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    const prices: Record<string, number> = {};
    
    if (data.data) {
      for (const [mint, priceData] of Object.entries(data.data)) {
        const priceInfo = priceData as any;
        if (priceInfo?.price) {
          prices[mint] = priceInfo.price;
        }
      }
    }
    
    return prices;
  } catch (error) {
    console.error('[Jupiter] Failed to fetch prices:', error);
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Invalid address parameter' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Helius API key not configured' },
        { status: 500 }
      );
    }

    const baseUrl = HELIUS_RPC_URL.endsWith('/') ? HELIUS_RPC_URL.slice(0, -1) : HELIUS_RPC_URL;
    const url = `${baseUrl}/?api-key=${API_KEY}`;

    // 获取所有资产（处理分页）
    let allItems: any[] = [];
    let page = 1;
    let hasMore = true;
    let nativeBalance: any = null;
    const maxPages = 100; // 最大页数限制

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
              limit: 1000,
              displayOptions: {
                showFungible: true,
                showNativeBalance: page === 1,
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

        const items: any[] = result.items || [];
        allItems = allItems.concat(items);

        if (page === 1 && result.nativeBalance) {
          nativeBalance = result.nativeBalance;
        }

        const currentPageItems = items.length;
        hasMore = currentPageItems === 1000;

        page++;
      } catch (pageError) {
        console.error(`[DAS] Error fetching page ${page}:`, pageError);
        if (page === 1) {
          throw pageError;
        }
        break;
      }
    }

    // 提取所有代币的 mint 地址，用于批量获取价格
    const fungibleTokens = allItems.filter(item => 
      (item.interface === 'FungibleToken' || item.interface === 'FungibleAsset') && 
      item.token_info?.mint
    );
    
    const mints = fungibleTokens.map(item => item.token_info.mint);
    const prices = await getTokenPrices(mints);

    // 为代币添加价格信息
    const itemsWithPrices = allItems.map(item => {
      if ((item.interface === 'FungibleToken' || item.interface === 'FungibleAsset') && item.token_info?.mint) {
        const mint = item.token_info.mint;
        const price = prices[mint];
        
        if (price !== undefined) {
          const balance = item.token_info.balance || 0;
          const decimals = item.token_info.decimals || 0;
          const balanceFormatted = decimals > 0 ? balance / Math.pow(10, decimals) : balance;
          const totalPrice = balanceFormatted * price;
          
          item.token_info.price_info = {
            price_per_token: price,
            total_price: totalPrice
          };
        }
      }
      return item;
    });

    // 如果 Helius 返回了 SOL 价格，使用它；否则从 Jupiter 获取
    if (nativeBalance && !nativeBalance.price_per_sol) {
      const solMint = 'So11111111111111111111111111111111111111112';
      const solPrice = prices[solMint] || await getTokenPrice(solMint);
      
      if (solPrice) {
        const solBalance = nativeBalance.lamports / 1e9;
        nativeBalance.price_per_sol = solPrice;
        nativeBalance.total_price = solBalance * solPrice;
      }
    }

    return NextResponse.json({
      items: itemsWithPrices,
      nativeBalance,
      totalItems: itemsWithPrices.length
    });
  } catch (error) {
    console.error('[Helius Assets API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

