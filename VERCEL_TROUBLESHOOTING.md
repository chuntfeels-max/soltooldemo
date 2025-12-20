# Vercel 部署问题排查

## 如果仍然显示 404 NOT_FOUND

### 1. 检查 Vercel 项目设置

在 Vercel Dashboard 中：

1. **进入项目设置 (Settings)**
2. **检查 General 设置**：
   - Framework Preset: 应该是 "Next.js"
   - Build Command: 应该是 `npm run build` 或留空（自动检测）
   - Output Directory: 应该是 `.next` 或留空（自动检测）
   - Install Command: 应该是 `npm install` 或留空

3. **检查 Environment Variables**：
   确保以下变量已设置：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `HELIUS_API_KEY`
   - `GEMINI_API_KEY`

### 2. 检查构建日志

在 Vercel Dashboard 的 Deployments 页面：
- 查看最新的部署日志
- 检查是否有构建错误
- 确认构建是否成功完成

### 3. 重新创建 vercel.json（可选）

如果 Vercel 无法自动识别 Next.js 项目，我已经创建了 `vercel.json`：

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### 4. 检查部署域名

确保访问的是正确的部署 URL：
- Vercel 会自动生成：`your-project.vercel.app`
- 不是 `localhost:5173`（那是本地开发服务器）

### 5. 常见问题

**问题：部署成功但显示 404**
- 可能是路由问题
- 检查是否有 `src/app/page.tsx` 文件（主页面）
- 确认项目根目录结构正确

**问题：构建失败**
- 检查 Environment Variables 是否设置
- 查看构建日志中的具体错误信息

**问题：页面显示但 API Routes 不工作**
- 确认 Environment Variables 已正确设置
- 检查 API routes 路径是否正确（应该是 `/api/...`）

### 6. 本地验证

在部署前，先在本地验证构建：

```bash
# 清除缓存
rm -rf .next node_modules/.cache

# 重新安装依赖
npm install

# 构建
npm run build

# 启动生产服务器测试
npm start
```

如果本地 `npm start` 正常工作，但 Vercel 不行，可能是环境变量或配置问题。

### 7. 检查项目根目录

确保项目结构如下：
```
solwhaletracker-mvp-1/
├── src/
│   └── app/
│       ├── page.tsx      # ✅ 必须有主页面
│       ├── layout.tsx    # ✅ 必须有布局
│       └── api/          # ✅ API routes
├── package.json
├── next.config.js
└── vercel.json           # ✅ 可选
```

### 8. 重新部署

如果以上都正确，尝试：
1. 在 Vercel Dashboard 中点击 "Redeploy"
2. 或者重新推送代码到 Git 仓库

