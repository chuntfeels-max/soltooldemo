# 修复 Vercel 构建问题

## 问题原因

你的 Git 仓库中包含了 `.next` 目录，这导致 Vercel 认为项目已经构建好了，所以跳过构建步骤（只花了 81ms）。

## 解决方案

### 步骤 1: 从 Git 中删除 .next 目录

在项目根目录运行：

```bash
git rm -r --cached .next
git commit -m "Remove .next directory from Git (should not be committed)"
git push
```

这个命令会：
- 从 Git 中删除 `.next` 目录
- 但保留本地文件（不影响本地开发）
- 提交更改
- 推送到远程仓库

### 步骤 2: 验证

`.gitignore` 已经包含了 `/.next/`，所以以后 `.next` 不会再被提交。

### 步骤 3: 重新部署

推送后，Vercel 会自动触发新的部署。这次应该会：

1. 执行 `npm install`
2. 执行 `npm run build`
3. 构建过程会需要几秒钟（而不是 81ms）
4. 构建日志应该显示完整的 Next.js 构建信息

## 预期结果

新的构建日志应该类似：

```
Installing dependencies...
added 225 packages in 12s

> sol-whale-tracker@0.1.0 build
> next build

   ▲ Next.js 15.5.9
   Creating an optimized production build ...
 ✓ Compiled successfully in 5.2s
   Linting and checking validity of types ...
   Generating static pages (9/9)
   Finalizing page optimization ...
```

而不是只有 81ms。

## 如果使用 Git 图形界面

如果你使用 GitHub Desktop 或其他工具：

1. 在文件列表中找到 `.next` 目录
2. 右键选择 "Remove from Version Control" 或类似选项
3. 提交并推送

