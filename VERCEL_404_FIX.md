# Vercel 404 错误完整解决方案

## 重要：必须在 Vercel Dashboard 中检查以下设置

### 步骤 1: 检查 Framework Preset

1. 登录 Vercel Dashboard
2. 进入你的项目
3. 点击 **Settings** → **General**
4. **检查 "Framework Preset"**：
   - 如果显示 "Other" 或空白，**必须手动选择 "Next.js"**
   - 如果已经显示 "Next.js"，跳到步骤 2

### 步骤 2: 检查构建命令

在 **Settings** → **General** 中：

- **Build Command**: 应该留空（自动）或设置为 `npm run build`
- **Output Directory**: **必须留空**（不要填写任何内容）
- **Install Command**: 应该留空（自动）或设置为 `npm install`
- **Root Directory**: 留空（如果项目在仓库根目录）

⚠️ **关键**：Output Directory 必须留空！Next.js 会自动处理输出目录。

### 步骤 3: 查看构建日志

1. 在 Vercel Dashboard 点击 **Deployments**
2. 点击最新的部署
3. 查看 **Build Logs**
4. **检查是否有任何错误**

如果构建日志显示：
- ✅ "Build Completed" - 构建成功，但路由有问题
- ❌ "Build Failed" - 查看具体错误信息
- ⚠️ 任何错误 - 记录下来

### 步骤 4: 检查部署 URL

确认你访问的是：
- ✅ `https://your-project.vercel.app` - 正确
- ❌ `http://localhost:5173` - 错误（那是本地开发）
- ❌ `https://your-project.vercel.app/dist` - 错误（Next.js 不使用 dist）

### 步骤 5: 重新导入项目（如果上述都正确）

如果所有设置都正确但仍然 404，尝试：

1. 在 Vercel Dashboard → **Settings** → **General**
2. 滚动到底部
3. 找到 **"Delete Project"**（删除项目）
4. **重新导入项目**：
   - 点击 "Add New" → "Project"
   - 选择你的 Git 仓库
   - **这次确保 Framework Preset 选择 "Next.js"**
   - 添加环境变量
   - 点击 "Deploy"

### 步骤 6: 检查环境变量

在 **Settings** → **Environment Variables**，确认设置了：

```
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
HELIUS_API_KEY=your_key
GEMINI_API_KEY=your_key
```

⚠️ **重要**：环境变量设置后，必须点击 **"Redeploy"** 才能生效！

### 步骤 7: 本地验证

在部署前，先在本地测试生产构建：

```bash
# 清除缓存
rm -rf .next node_modules/.cache

# 构建
npm run build

# 启动生产服务器（注意：Next.js 默认端口是 3000，不是 5173）
npm start
```

然后访问 `http://localhost:3000` 测试。

如果本地 `npm start` 正常工作，但 Vercel 不行，问题在于 Vercel 配置。

## 常见错误原因

### 原因 1: Framework Preset 错误
- **症状**: 404 NOT_FOUND
- **解决**: 在 Vercel Settings 中手动选择 "Next.js"

### 原因 2: Output Directory 设置了错误值
- **症状**: 404 NOT_FOUND
- **解决**: 将 Output Directory 留空

### 原因 3: 构建失败但没有注意
- **症状**: 404 NOT_FOUND
- **解决**: 查看构建日志，修复错误

### 原因 4: 环境变量未设置
- **症状**: 构建可能成功但运行时错误
- **解决**: 在 Settings 中添加环境变量并重新部署

## 如果还是不行

请提供以下信息：

1. **Vercel Dashboard → Settings → General** 的截图
   - 特别是 Framework Preset 的值
   - Build Command 的值
   - Output Directory 的值

2. **构建日志**（Deployments → 最新部署 → Build Logs）
   - 是否有任何错误
   - 构建是否显示成功

3. **你访问的 URL**
   - 完整的 URL 地址

有了这些信息，我可以更准确地帮你解决问题。

