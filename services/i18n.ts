
export type Language = 'en' | 'zh';

export const translations = {
  en: {
    nav: {
      dashboard: "Dashboard",
      eliteWallets: "Elite Wallets",
      trends: "Trends",
      tgBot: "Telegram Bot",
      betaTag: "MVP Phase 1"
    },
    sidebar: {
      tabElite: "Elite",
      tabWatchlist: "My List",
      addPlaceholder: "Add custom address...",
      addLabel: "Remark/Name",
      addBtn: "Track",
      noWatchlist: "No addresses in your watchlist yet.",
      alreadyIn: "Address already in watchlist"
    },
    feed: {
      title: "Smart Money Feed",
      denoise: "Denoising applied: Only showing addresses with PNL > 50% and high confidence scores.",
      aiDesc: "Gemini Flash AI analyzes trading strategies, risk profiles, and identifies personas like Snipers or OGs."
    },
    search: {
      placeholder: "Paste any Solana wallet address...",
      button: "Analyze",
      analyzing: "Analyzing..."
    },
    header: {
      liveData: "Live Data",
      netWorth: "Total Net Worth",
      refresh: "Refresh DAS",
      activeIntelligence: "ACTIVE INTELLIGENCE",
      portfolioValue: "Portfolio Value",
      copyAddress: "Copy address"
    },
    analysis: {
      title: "Gemini Smart Insight",
      processing: "Processing...",
      awaiting: "Awaiting Helius payload analysis...",
      reasoning: "Reasoning",
      sentiment: "Sentiment",
      risk: "Risk"
    },
    distribution: {
      title: "Asset Distribution",
      noData: "Not enough data for visualization"
    },
    holdings: {
      title: "Verified Holdings (Helius DAS)",
      accuracy: "100% On-Chain Accuracy",
      asset: "Asset",
      balance: "Balance",
      price: "Price",
      value: "Value",
      empty: "No tokens found."
    },
    activity: {
      title: "Recent Smart Activity",
      type: "Type",
      desc: "Description",
      time: "Time",
      empty: "No recent transactions found."
    },
    whaleCard: {
      pnl30d: "30D PNL",
      winRate: "Win Rate",
      solscan: "SOLSCAN",
      delete: "Remove"
    },
    footer: {
      desc: "Next-gen Solana intelligence powered by Helius DAS and Gemini Flash AI.",
      docs: "Documentation",
      subscribe: "Join 10,000+ traders",
      emailPlaceholder: "your@email.com",
      subscribeBtn: "Get Beta Access"
    },
    modal: {
      title: "MVP Telegram Bot",
      desc: "Step 3 of our roadmap. We are currently configuring the webhook for real-time alerts. /query [address] will soon be available.",
      button: "Join Private Beta"
    }
  },
  zh: {
    nav: {
      dashboard: "仪表盘",
      eliteWallets: "精英钱包",
      trends: "市场趋势",
      tgBot: "电报机器人",
      betaTag: "MVP 阶段 1"
    },
    sidebar: {
      tabElite: "精英榜",
      tabWatchlist: "关注列表",
      addPlaceholder: "添加自定义地址...",
      addLabel: "备注/名称",
      addBtn: "追踪",
      noWatchlist: "关注列表为空，请添加地址。",
      alreadyIn: "该地址已在关注列表中"
    },
    feed: {
      title: "聪明钱看板",
      denoise: "已开启降噪：仅显示收益率 > 50% 且置信度较高的地址。",
      aiDesc: "Gemini Flash AI 深度解析交易策略与风险画像，精准识别狙击手 (Sniper) 与长期持有者 (OG)。"
    },
    search: {
      placeholder: "粘贴任何 Solana 钱包地址...",
      button: "智能分析",
      analyzing: "正在分析..."
    },
    header: {
      liveData: "实时数据",
      netWorth: "账户总净值",
      refresh: "刷新数据",
      activeIntelligence: "ACTIVE INTELLIGENCE",
      portfolioValue: "Portfolio Value",
      copyAddress: "Copy address"
    },
    analysis: {
      title: "Gemini 智能分析",
      processing: "分析中...",
      awaiting: "等待解析 Helius 数据载荷...",
      reasoning: "分析逻辑",
      sentiment: "市场情绪",
      risk: "风险等级"
    },
    distribution: {
      title: "资产分布图",
      noData: "数据不足，无法生成图表"
    },
    holdings: {
      title: "已验证持仓 (Helius DAS)",
      accuracy: "100% 链上数据准确性",
      asset: "资产",
      balance: "余额",
      price: "价格",
      value: "价值",
      empty: "未发现代币。"
    },
    activity: {
      title: "近期智能活动",
      type: "类型",
      desc: "交易描述",
      time: "时间",
      empty: "未发现近期交易。"
    },
    whaleCard: {
      pnl30d: "30日收益",
      winRate: "胜率",
      solscan: "浏览器查看",
      delete: "移除"
    },
    footer: {
      desc: "由 Helius DAS 和 Gemini Flash AI 驱动的下一代 Solana 智能分析工具。",
      docs: "技术文档",
      subscribe: "加入 10,000+ 交易者行列",
      emailPlaceholder: "您的邮箱地址",
      subscribeBtn: "获取测试资格"
    },
    modal: {
      title: "MVP 电报机器人",
      desc: "路线图第 3 步。我们正在配置实时警报的 Webhook。/query [地址] 功能即将上线。",
      button: "加入内测"
    }
  }
};
