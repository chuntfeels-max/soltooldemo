
import { NextRequest, NextResponse } from 'next/server';

const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com';
const API_KEY = process.env.HELIUS_API_KEY || '';

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

    return NextResponse.json({
      items: allItems,
      nativeBalance,
      totalItems: allItems.length
    });
  } catch (error) {
    console.error('[Helius Assets API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

