import { NextRequest, NextResponse } from 'next/server';

const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com';
const API_KEY = process.env.HELIUS_API_KEY || '';

/**
 * 获取地址的最近交易记录
 * 使用 Helius getSignaturesForAddress API
 */
export async function POST(request: NextRequest) {
  try {
    const { address, limit = 5 } = await request.json();

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

    // 获取交易签名列表
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'get-signatures',
        method: 'getSignaturesForAddress',
        params: [
          address,
          {
            limit: Math.min(limit, 1000) // 最多 1000 条
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'RPC API error');
    }

    const signatures = data.result || [];

    // 获取交易详情（可选：如果需要更多信息，可以使用 getParsedTransaction）
    const transactions = signatures.map((sig: any, index: number) => ({
      signature: sig.signature,
      slot: sig.slot,
      err: sig.err,
      memo: sig.memo || null,
      blockTime: sig.blockTime || null,
      confirmationStatus: sig.confirmationStatus || 'confirmed'
    }));

    return NextResponse.json({
      transactions,
      total: transactions.length
    });
  } catch (error) {
    console.error('[Helius Transactions API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

