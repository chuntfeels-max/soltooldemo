
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 管理员客户端（使用 service_role key）
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// GET: 返回所有关注地址（按added_at降序）
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('watchlist')
      .select('*')
      .order('added_at', { ascending: false });

    if (error) {
      console.error('[Watchlist GET] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch watchlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('[Watchlist GET] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: 添加新地址
export async function POST(request: NextRequest) {
  try {
    const { wallet_address, remark } = await request.json();

    if (!wallet_address || typeof wallet_address !== 'string') {
      return NextResponse.json(
        { error: 'Invalid wallet_address parameter' },
        { status: 400 }
      );
    }

    // 检查是否已存在
    const { data: existing } = await supabaseAdmin
      .from('watchlist')
      .select('id')
      .eq('wallet_address', wallet_address)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Wallet address already in watchlist' },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('watchlist')
      .insert({
        wallet_address,
        remark: remark || null,
        user_id: 'default' // 暂时使用默认用户ID，后续可以添加认证
      })
      .select()
      .single();

    if (error) {
      console.error('[Watchlist POST] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to add to watchlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[Watchlist POST] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: 删除地址（支持 id 或 wallet_address）
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const wallet_address = searchParams.get('wallet_address');

    if (!id && !wallet_address) {
      return NextResponse.json(
        { error: 'Missing id or wallet_address parameter' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from('watchlist').delete();

    if (id) {
      query = query.eq('id', id);
    } else if (wallet_address) {
      query = query.eq('wallet_address', wallet_address);
    }

    const { error } = await query;

    if (error) {
      console.error('[Watchlist DELETE] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete from watchlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Watchlist DELETE] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

