
# Next.js API Routes 迁移说明

## 已完成的工作

### 1. API Routes 创建

#### `/api/helius/assets` [POST]
- **功能**: 代理 Helius DAS getAssetsByOwner API
- **请求**: `{ address: string }`
- **响应**: `{ items: any[], nativeBalance: any, totalItems: number }`
- **说明**: 隐藏了 HELIUS_API_KEY，所有请求通过后端代理

#### `/api/gemini/analyze` [POST]
- **功能**: 代理 Gemini Flash 分析
- **请求**: `{ holdings: TokenInfo[], history?: WhaleTransaction[], lang?: 'zh' | 'en' }`
- **响应**: `AnalysisResult`
- **说明**: 使用 GEMINI_API_KEY（环境变量）

#### `/api/watchlist`
- **GET**: 返回所有关注地址（按 added_at 降序）
- **POST**: 添加新地址 `{ wallet_address: string, remark?: string }`
- **DELETE**: 删除地址 `?id=xxx`
- **说明**: 使用 Supabase service_role key，所有操作存储在 `watchlist` 表

#### `/api/cron/update-elite` [GET]
- **功能**: 定时任务占位（返回 { status: 'ok' }）
- **说明**: 未来每30分钟计算精英榜存 `elite_candidates` 表

### 2. 客户端服务文件

#### `services/apiClient.ts`
- 封装了所有 API 调用的客户端函数
- `fetchAssetsFromAPI`: 调用 Helius assets API
- `analyzeWalletFromAPI`: 调用 Gemini analyze API
- `fetchWatchlistFromAPI`, `addToWatchlistAPI`, `removeFromWatchlistAPI`: Watchlist CRUD 操作

#### `services/heliusServiceClient.ts`
- 替代原来的 `heliusService.ts`
- 使用 API Route 而不是直接调用 Helius
- 保持相同的数据处理逻辑（过滤、格式化、排序）

#### `services/geminiServiceClient.ts`
- 替代原来的 `geminiService.ts`
- 使用 API Route 而不是直接调用 Gemini

### 3. Hooks 更新

#### `hooks/useWatchlistClient.ts`
- 新的 watchlist hook，使用 Supabase API
- 所有操作都是异步的（Promise 返回）
- 自动从 API 加载数据
- 支持备注（notes）功能

#### `hooks/useWalletData.ts`
- 已更新使用 `heliusServiceClient` 和 `geminiServiceClient`
- 保持原有功能和缓存逻辑

### 4. 前端更新

#### `App.tsx`
- 更新使用 `useWatchlistClient` 替代 `useWatchlist`
- 所有 `addWhale`, `removeWhale` 调用改为异步（await）
- 保持所有 UI 和功能不变

## 环境变量配置

确保 `.env.local` 包含以下变量：

```env
HELIUS_API_KEY=your_helius_key
GEMINI_API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Supabase 表结构

### watchlist 表
```sql
- id (uuid, primary key)
- user_id (text)
- wallet_address (text)
- remark (text, nullable)
- added_at (timestamp)
```

### elite_candidates 表（未来使用）
```sql
- id (uuid, primary key)
- wallet_address (text)
- nickname (text)
- score (numeric)
- notes (text, nullable)
- last_active (timestamp)
```

## 迁移要点

1. **API Key 安全**: 所有敏感 API Key 都在服务端，不再暴露给客户端
2. **数据持久化**: Watchlist 现在存储在 Supabase，而不是 localStorage
3. **异步操作**: 所有数据库操作都是异步的，确保 UI 响应性
4. **错误处理**: 所有 API routes 都包含完整的错误处理
5. **向后兼容**: 客户端接口保持不变，只是底层实现改为 API 调用

## 下一步工作

1. 实现 `/api/cron/update-elite` 的完整逻辑
2. 添加用户认证（如果需要多用户支持）
3. 添加 API 限流和缓存策略
4. 优化错误处理和用户反馈

