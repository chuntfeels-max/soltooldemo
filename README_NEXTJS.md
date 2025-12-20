
# Next.js App Router 迁移完成

## 项目结构

```
solwhaletracker-mvp-1/
├── src/
│   └── app/
│       ├── layout.tsx          # 根布局（包含全局样式和字体）
│       ├── page.tsx            # 主页面（原 App.tsx）
│       ├── globals.css         # 全局样式（Tailwind）
│       └── api/                # API Routes
│           ├── helius/
│           │   └── assets/route.ts
│           ├── gemini/
│           │   └── analyze/route.ts
│           ├── watchlist/
│           │   ├── route.ts
│           │   └── update-notes/route.ts
│           └── cron/
│               └── update-elite/route.ts
├── components/                 # React 组件（所有都有 'use client'）
├── hooks/                      # Custom Hooks
├── services/                   # 服务层
│   ├── apiClient.ts           # API 调用封装（客户端）
│   ├── heliusServiceClient.ts # Helius 客户端服务
│   └── geminiServiceClient.ts # Gemini 客户端服务
├── lib/
│   └── supabase.ts            # Supabase 管理员客户端
├── types.ts                   # TypeScript 类型定义
├── constants.tsx              # 常量定义
├── utils/                     # 工具函数
├── next.config.js             # Next.js 配置
├── tailwind.config.js         # Tailwind CSS 配置
├── postcss.config.js          # PostCSS 配置
└── tsconfig.json              # TypeScript 配置
```

## 环境变量

在 `.env.local` 中配置：

```env
HELIUS_API_KEY=your_helius_key
GEMINI_API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 运行项目

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 主要变化

### 1. API Routes
- 所有外部 API 调用（Helius、Gemini）现在通过 Next.js API Routes 代理
- API Keys 不再暴露给客户端
- Watchlist 数据存储在 Supabase

### 2. 客户端服务
- `services/apiClient.ts`: 封装所有 API 调用
- `services/heliusServiceClient.ts`: 使用 API Route 替代直接调用
- `services/geminiServiceClient.ts`: 使用 API Route 替代直接调用

### 3. Hooks 更新
- `hooks/useWatchlistClient.ts`: 新的 watchlist hook，使用 Supabase API
- `hooks/useWalletData.ts`: 已更新使用新的客户端服务

### 4. 组件
- 所有组件都添加了 `'use client'` 指令（Next.js App Router 要求）
- 保持原有功能和样式不变

### 5. 样式
- 使用 Tailwind CSS（通过 `globals.css`）
- 自定义字体（Inter 和 JetBrains Mono）
- 保持原有暗黑主题样式

## 功能完整性

✅ 所有原有功能已迁移
✅ UI 和样式保持一致
✅ API Routes 正常工作
✅ Supabase 集成完成
✅ 类型安全（TypeScript）

## 下一步

1. 实现 `/api/cron/update-elite` 的完整逻辑
2. 添加用户认证（如需要）
3. 优化性能和缓存策略
4. 添加错误边界和更好的错误处理

