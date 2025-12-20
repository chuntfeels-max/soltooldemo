
import { TokenInfo, AnalysisResult, WhaleTransaction } from '../types';
import { Language } from './i18n';
import { analyzeWalletFromAPI } from './apiClient';

/**
 * 使用 API Route 分析 Solana 鲸鱼钱包
 */
export const analyzeWhaleWallet = async (
  address: string,
  tokens: TokenInfo[],
  lang: Language = 'zh'
): Promise<AnalysisResult> => {
  try {
    // 调用 API Route（暂时不传交易历史，未来可以添加）
    const history: WhaleTransaction[] = [];
    return await analyzeWalletFromAPI(tokens, history, lang);
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    return {
      sentiment: 'Neutral',
      summary: lang === 'zh' ? 'AI 分析暂时不可用，请稍后再试。' : 'Analysis currently unavailable. Please check back later.',
      riskLevel: 'Medium',
      smartMoneyReasoning: 'AI model is warming up or API limit reached.'
    };
  }
};

