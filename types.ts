
export interface TokenInfo {
  symbol: string;
  balance: number;
  decimals: number;
  name: string;
  price_info?: {
    price_per_token: number;
    total_price: number;
    currency?: string;
  };
  image_url?: string;
  mint: string;
  isNative?: boolean;
  isMock?: boolean; // 标记是否为模拟数据
}

export interface WhaleAsset {
  interface: string;
  id: string;
  content: any;
  token_info: {
    symbol?: string;
    balance: number;
    decimals: number;
    price_info?: {
      price_per_token: number;
      total_price: number;
    };
    mint: string;
  };
}

export interface WhaleTransaction {
  signature: string;
  timestamp: number;
  type: string;
  description: string;
  source: string;
  fee: number;
  isMock?: boolean;
}

export type RankingCategory = 'todayPnl' | 'weeklyWinRate' | 'earlyEntry' | 'heavyPosition';

export interface WhaleProfile {
  address: string;
  label: string;
  winRate: number;
  pnl30d: string;
  trustScore: number;
  tags: string[];
  notes?: string; // 用户备注
  // 动态排名数据
  todayPnl?: number; // 今日收益（百分比）
  weeklyWinRate?: number; // 本周胜率（百分比）
  earlyEntryScore?: number; // 早期入场分数
  heavyPositionScore?: number; // 持仓集中度分数
  followReason?: string; // 跟单理由
}

export interface AnalysisResult {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  summary: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  smartMoneyReasoning: string;
}
