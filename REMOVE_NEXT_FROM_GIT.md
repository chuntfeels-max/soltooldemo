# 重要：从 Git 仓库中删除 .next 目录

## 问题

你的 Git 仓库中包含了 `.next` 目录，这是错误的！

`.next` 是 Next.js 的构建产物，不应该提交到 Git。如果 `.next` 在仓库中，Vercel 可能会认为项目已经构建好了，所以跳过构建步骤（这就是为什么构建只花了 81ms）。

## 解决方案

### 步骤 1: 从 Git 仓库中删除 .next 目录

在项目根目录运行以下命令：

```bash
# 从 Git 中删除 .next 目录（但保留本地文件）
git rm -r --cached .next

# 提交更改
git commit -m "Remove .next directory from Git repository"

# 推送到远程仓库
git push
```

### 步骤 2: 验证 .gitignore

确保 `.gitignore` 文件包含 `.next/`（我已经检查过了，应该已经有了）。

### 步骤 3: 重新部署

1. 推送到 Git 后，Vercel 会自动触发新的部署
2. 这次应该会执行完整的构建过程
3. 构建日志应该显示 `npm install` 和 `npm run build` 的输出

## 验证

部署后，检查新的构建日志，应该看到：

```
Installing dependencies...
added 225 packages in 12s

> sol-whale-tracker@0.1.0 build
> next build

   ▲ Next.js 15.5.9
   Creating an optimized production build ...
 ✓ Compiled successfully in X.Xs
   Generating static pages (9/9)
```

而不是只有 81ms。

## 如果使用 Git 图形界面

如果你使用 GitHub Desktop 或其他图形界面：

1. 在文件浏览器中找到 `.next` 目录
2. 右键点击 → 如果使用 GitHub Desktop，选择 "Remove from Version Control"
3. 或者直接删除 `.next` 目录
4. 提交并推送更改

## 重要提示

**永远不要提交以下文件/目录到 Git**：
- `.next/` - Next.js 构建产物
- `node_modules/` - 依赖包
- `.env.local` - 本地环境变量（包含密钥）
- `.vercel/` - Vercel 配置

这些都应该在 `.gitignore` 中。

