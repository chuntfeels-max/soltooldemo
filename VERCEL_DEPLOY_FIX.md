# Vercel 部署修复

## 问题

Vercel 部署时报错：
```
Error: supabaseUrl is required.
```

## 原因

API routes 在文件顶层直接创建 Supabase 客户端，在构建时 Next.js 会尝试执行这些代码，但环境变量可能未设置，导致 `createClient` 接收到 `undefined`。

## 解决方案

将 Supabase 客户端创建移到函数内部，使用一个辅助函数 `getSupabaseAdmin()`，这样只有在实际请求时才会创建客户端，构建时不会执行。

### 修改的文件

1. **`src/app/api/watchlist/route.ts`**
   - 将所有 `supabaseAdmin` 的使用改为在函数内部调用 `getSupabaseAdmin()`
   - GET、POST、DELETE 方法都已更新

2. **`src/app/api/watchlist/update-notes/route.ts`**
   - PATCH 方法已更新

### 代码示例

**修改前（会导致构建错误）：**
```typescript
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  // ...
);

export async function GET(request: NextRequest) {
  const { data } = await supabaseAdmin.from('watchlist')...
}
```

**修改后（构建时不会执行）：**
```typescript
function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin.from('watchlist')...
}
```

## 验证

构建已成功完成，输出：
```
✓ Compiled successfully
✓ Generating static pages (9/9)
✓ Finalizing page optimization
```

## Vercel 环境变量配置

确保在 Vercel 项目中配置了以下环境变量：

1. 进入 Vercel 项目设置
2. 打开 "Environment Variables"
3. 添加：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `HELIUS_API_KEY`
   - `GEMINI_API_KEY`

## 注意事项

- localStorage 警告是正常的（SSR 时 window 不存在）
- 所有 API routes 现在都是惰性初始化，只在请求时创建客户端
- 构建时不会访问环境变量，避免了构建错误

