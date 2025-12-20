
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

// PATCH: 更新备注
export async function PATCH(request: NextRequest) {
  try {
    const { id, remark } = await request.json();

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid id parameter' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('watchlist')
      .update({ remark: remark || null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Watchlist PATCH] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update watchlist item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[Watchlist PATCH] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

