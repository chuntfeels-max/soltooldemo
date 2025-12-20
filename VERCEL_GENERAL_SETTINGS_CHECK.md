# Vercel General 设置检查清单

## 从你的截图看，Build and Deployment 设置是正确的：

✅ Framework Preset: Next.js
✅ Build Command: npm run build  
✅ Output Directory: Next.js default
✅ Install Command: 自动检测

## 但还需要检查 General 页面：

### 1. 在 Settings → General 页面检查：

**Project Name**: 应该是你的项目名称

**Team**: 确认是正确的团队

**Node.js Version**: 
- 应该设置为 **18.x** 或 **20.x**
- 不要使用 19.x（可能有兼容性问题）

**Environment Variables**: 
- 点击 "Environment Variables" 链接
- 确认所有变量都已设置：
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `HELIUS_API_KEY`
  - `GEMINI_API_KEY`

### 2. 检查部署日志：

1. 点击顶部导航的 **"Deployments"**
2. 点击最新的部署
3. 查看 **"Build Logs"** 标签页
4. **关键检查**：
   - 构建是否显示 "Build Completed"？
   - 是否有任何红色错误信息？
   - 最后几行显示什么？

### 3. 检查 Functions 标签页：

在部署详情页面，点击 **"Functions"** 标签：
- 应该看到 `/api/helius/assets`
- 应该看到 `/api/gemini/analyze`
- 应该看到 `/api/watchlist`
- 等等

如果 Functions 列表是空的，说明 API routes 没有正确构建。

### 4. 检查访问的 URL：

确认你访问的是：
- ✅ `https://soltooldemo.vercel.app` 或类似
- ❌ 不是 `https://soltooldemo.vercel.app/dist`
- ❌ 不是 `http://localhost:5173`

### 5. 如果构建日志显示成功但仍然是 404：

可能的原因：
1. **环境变量未设置** - 导致运行时错误
2. **Node.js 版本不兼容** - 检查 Node.js 版本设置
3. **构建缓存问题** - 尝试清除缓存重新部署

### 6. 尝试清除构建缓存：

在 Vercel Dashboard：
1. Settings → General
2. 滚动到底部
3. 找到 "Clear Build Cache" 或类似选项
4. 清除缓存后重新部署

## 请提供以下信息：

1. **General 页面的截图**（特别是 Node.js Version）
2. **最新部署的 Build Logs**（完整的日志，特别是最后几行）
3. **Functions 标签页的截图**（看看 API routes 是否被识别）
4. **你访问的完整 URL**

有了这些信息，我可以更准确地定位问题。

