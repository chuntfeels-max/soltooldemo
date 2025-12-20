
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabase';

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

