# Vercel 部署修复

## 问题

Vercel 部署时报错：
```
Build Failed
No Output Directory named "dist" found after the Build completed.
Update vercel.json#outputDirectory to ensure the correct output directory is generated.
```

## 原因

Next.js 默认的输出目录是 `.next`，而不是 `dist`。如果 `vercel.json` 中配置了 `outputDirectory: "dist"`，会导致部署失败。

## 解决方案

**已删除 `vercel.json` 文件**

Next.js 项目不需要 `vercel.json` 配置文件，Vercel 会自动识别 Next.js 项目并使用正确的构建配置。

Next.js 在 Vercel 上的默认行为：
- 输出目录：`.next`（自动处理）
- 构建命令：`npm run build`（自动检测）
- 框架预设：Next.js（自动识别）

## 验证

现在可以直接部署到 Vercel：
1. 推送到 GitHub
2. 在 Vercel 中连接仓库
3. Vercel 会自动检测 Next.js 项目
4. 部署应该会成功

## 环境变量

确保在 Vercel 项目设置中配置了以下环境变量：
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HELIUS_API_KEY`
- `GEMINI_API_KEY`

## 注意事项

如果未来需要自定义 Vercel 配置，可以使用 `vercel.json`，但**不要**设置 `outputDirectory`，因为 Next.js 已经处理好了。

正确的 `vercel.json` 示例（如果需要）：
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

但通常不需要这个文件，Vercel 会自动处理 Next.js 项目。

