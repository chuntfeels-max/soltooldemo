
import { createClient } from '@supabase/supabase-js';

// 使用 service_role key 用于服务端操作（绕过 RLS）
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

