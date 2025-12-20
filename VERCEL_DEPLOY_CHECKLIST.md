# Vercel 部署检查清单

## 如果显示 404 NOT_FOUND，请检查：

### 1. ✅ 确保代码已推送到 Git 仓库

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### 2. ✅ 在 Vercel Dashboard 检查项目设置

访问：https://vercel.com/dashboard

1. **进入你的项目**
2. **Settings → General**：
   - Framework Preset: 应该显示 **"Next.js"** 或自动检测到
   - Build Command: 留空（自动）或 `npm run build`
   - Output Directory: **留空**（不要设置 `dist`）
   - Install Command: 留空（自动）或 `npm install`
   - Root Directory: 留空（如果项目在根目录）

### 3. ✅ 检查环境变量

**Settings → Environment Variables**，确保设置了：

- `SUPABASE_URL` = `your_supabase_url`
- `SUPABASE_SERVICE_ROLE_KEY` = `your_service_role_key`
- `HELIUS_API_KEY` = `your_helius_key`
- `GEMINI_API_KEY` = `your_gemini_key`

⚠️ **重要**：环境变量设置后，需要 **重新部署** 才能生效！

### 4. ✅ 查看部署日志

在 Vercel Dashboard 的 **Deployments** 页面：

1. 点击最新的部署
2. 查看 **Build Logs**
3. 确认构建是否成功
4. 如果有错误，查看具体错误信息

### 5. ✅ 确认访问正确的 URL

- Vercel 会生成：`your-project.vercel.app`
- 或者你的自定义域名
- **不是** `localhost:5173`（那是本地开发）

### 6. ✅ 本地验证构建

在部署前，先在本地测试生产构建：

```bash
# 清除缓存
rm -rf .next node_modules/.cache

# 构建
npm run build

# 测试生产服务器
npm start
```

访问 `http://localhost:3000` 测试是否正常。

### 7. ✅ 重新部署

如果以上都正确：

1. 在 Vercel Dashboard 点击 **"Redeploy"**
2. 或者推送新的 commit 到 Git 仓库

## 常见错误解决

### 错误：404 NOT_FOUND

**可能原因**：
- 部署没有成功完成
- 路由配置有问题
- Vercel 没有识别 Next.js 项目

**解决方法**：
1. 检查构建日志，确认构建成功
2. 确认 `src/app/page.tsx` 存在
3. 尝试重新部署

### 错误：Environment variables not found

**解决方法**：
1. 在 Vercel Settings 中添加环境变量
2. 点击 "Redeploy" 使环境变量生效

### 错误：Build failed

**解决方法**：
1. 查看构建日志中的具体错误
2. 检查 `package.json` 中的依赖是否正确
3. 确认 `next.config.js` 配置正确

## 项目结构确认

确保项目结构如下：
```
solwhaletracker-mvp-1/
├── src/
│   └── app/
│       ├── page.tsx          ✅ 主页面
│       ├── layout.tsx        ✅ 布局
│       ├── globals.css       ✅ 样式
│       └── api/              ✅ API routes
├── package.json              ✅
├── next.config.js            ✅
├── tsconfig.json             ✅
└── tailwind.config.js        ✅
```

## 如果问题仍然存在

1. 查看 Vercel Dashboard 的构建日志
2. 检查是否有 TypeScript 错误
3. 确认所有依赖都已正确安装
4. 尝试删除 `.next` 目录后重新构建

