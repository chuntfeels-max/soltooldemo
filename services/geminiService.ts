
import { GoogleGenAI, Type } from "@google/genai";
import { TokenInfo, AnalysisResult } from '../types';
import { Language } from './i18n';

/**
 * Analyzes a Solana whale wallet using Gemini 3 Pro for advanced reasoning.
 * Follows strict @google/genai guidelines for initialization and content generation.
 */
export const analyzeWhaleWallet = async (address: string, tokens: TokenInfo[], lang: Language = 'en'): Promise<AnalysisResult> => {
  // Initialize Gemini client directly using process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });

  const tokenSummary = tokens
    .slice(0, 10)
    .map(t => `${t.symbol}: ${t.balance.toLocaleString()} (Price: ${t.price_info?.price_per_token || 'N/A'})`)
    .join('\n');

  const languageInstruction = lang === 'zh' ? '请使用简体中文进行分析。' : 'Please provide the analysis in English.';

  const prompt = `
    Analyze this Solana whale wallet: ${address}
    Current Top Holdings:
    ${tokenSummary}
    
    Tasks:
    1. Determine if this is a "Smart Money" wallet based on the diversity and nature of assets.
    2. Assess the risk level (Low/Medium/High).
    3. Identify if the portfolio is biased towards Memecoins or Bluechips.
    4. Provide a punchy summary for a professional crypto trader.

    Constraint: ${languageInstruction}
  `;

  try {
    // Using gemini-3-pro-preview for complex analysis tasks involving strategy reasoning
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ['Bullish', 'Bearish', 'Neutral'] },
            summary: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            smartMoneyReasoning: { type: Type.STRING }
          },
          required: ['sentiment', 'summary', 'riskLevel', 'smartMoneyReasoning'],
          propertyOrdering: ["sentiment", "summary", "riskLevel", "smartMoneyReasoning"]
        }
      }
    });

    // Extract text from GenerateContentResponse property directly
    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      sentiment: 'Neutral',
      summary: lang === 'zh' ? 'AI 分析暂时不可用，请稍后再试。' : 'Analysis currently unavailable. Please check back later.',
      riskLevel: 'Medium',
      smartMoneyReasoning: 'AI model is warming up or API limit reached.'
    };
  }
};
