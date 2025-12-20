
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { holdings, history, lang = 'zh' } = await request.json();

    if (!holdings || !Array.isArray(holdings)) {
      return NextResponse.json(
        { error: 'Invalid holdings parameter' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const tokenSummary = holdings
      .slice(0, 10)
      .map((t: any) => `${t.symbol}: ${t.balance?.toLocaleString() || 0} (Price: ${t.price_info?.price_per_token || 'N/A'})`)
      .join('\n');

    const languageInstruction = lang === 'zh' ? '请使用简体中文进行分析。' : 'Please provide the analysis in English.';

    const prompt = `
      Analyze this Solana whale wallet holdings:
      Current Top Holdings:
      ${tokenSummary}
      
      ${history ? `Transaction History: ${JSON.stringify(history)}` : ''}
      
      Tasks:
      1. Determine if this is a "Smart Money" wallet based on the diversity and nature of assets.
      2. Assess the risk level (Low/Medium/High).
      3. Identify if the portfolio is biased towards Memecoins or Bluechips.
      4. Provide a punchy summary for a professional crypto trader.

      Constraint: ${languageInstruction}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING, enum: ['Bullish', 'Bearish', 'Neutral'] },
              summary: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              smartMoneyReasoning: { type: Type.STRING }
            },
            required: ['sentiment', 'summary', 'riskLevel', 'smartMoneyReasoning'],
            propertyOrdering: ['sentiment', 'summary', 'riskLevel', 'smartMoneyReasoning']
          }
        }
      });

      const jsonStr = response.text?.trim() || '{}';
      const result = JSON.parse(jsonStr);

      return NextResponse.json(result);
    } catch (aiError) {
      console.error('[Gemini Analyze] AI Error:', aiError);
      return NextResponse.json(
        {
          sentiment: 'Neutral',
          summary: lang === 'zh' ? 'AI 分析暂时不可用，请稍后再试。' : 'AI analysis temporarily unavailable. Please try again later.',
          riskLevel: 'Medium',
          smartMoneyReasoning: 'AI service error occurred.'
        },
        { status: 200 } // 返回默认值而不是错误
      );
    }
  } catch (error) {
    console.error('[Gemini Analyze API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze' },
      { status: 500 }
    );
  }
}

