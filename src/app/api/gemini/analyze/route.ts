import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    // 计算资产总值和分布
    const totalValue = holdings.reduce((sum, t) => sum + (t.price_info?.total_price || 0), 0);
    const topHoldings = holdings
      .slice(0, 15)
      .map((t: any) => {
        const value = t.price_info?.total_price || 0;
        const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(2) : '0';
        return {
          symbol: t.symbol || 'UNKNOWN',
          name: t.name || 'Unknown Token',
          balance: t.balance?.toLocaleString('en-US', { maximumFractionDigits: 6 }) || '0',
          value: value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
          percentage: `${percentage}%`,
          price: t.price_info?.price_per_token || 0
        };
      });

    const languageInstruction = lang === 'zh' 
      ? '请使用简体中文进行分析和回复。' 
      : 'Please provide the analysis in English.';

    const prompt = `你是一位资深的链上分析师，专门分析 Solana 生态中的钱包地址。请基于以下真实的链上资产数据，生成一份专业的钱包画像报告。

**钱包资产概况：**
- 资产总数：${holdings.length} 种代币
- 资产总值：$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}

**主要持仓（前 15 名）：**
${topHoldings.map((h, i) => `${i + 1}. ${h.symbol} (${h.name}): ${h.balance} 枚 | 价值 ${h.value} (${h.percentage}) | 单价 $${h.price?.toFixed(6) || 'N/A'}`).join('\n')}

${history && history.length > 0 ? `\n**近期交易活动：**\n${JSON.stringify(history.slice(0, 5), null, 2)}` : ''}

**分析任务：**
请扮演专业链上分析师的角色，深入分析这个钱包地址，并回答以下问题：

1. **钱包类型判断**：这是哪类交易者？
   - 高频波段者（频繁交易，持仓周期短）
   - 钻石手（长期持有，很少交易）
   - 被套牢的散户（高买低卖，资产配置不合理）
   - 专业机构/基金（分散投资，配置均衡）
   - 其他类型（请说明）

2. **风险评估**：根据资产集中度、代币类型、持仓结构，评估风险等级（Low/Medium/High）

3. **投资风格**：分析其投资偏好
   - 偏向 Memecoins（高风险高收益代币）
   - 偏向 Bluechips（主流优质资产）
   - 混合型投资
   - 稳定币为主

4. **专业评价**：生成一份简洁但专业的评价（2-3 句话），用专业术语描述这个钱包的特点和投资风格。

**输出格式要求：**
请以 JSON 格式返回，包含以下字段：
- sentiment: "Bullish" | "Bearish" | "Neutral"（基于持仓结构和市场趋势判断）
- summary: 一段专业的钱包画像总结（${lang === 'zh' ? '中文' : 'English'}，2-3 句话）
- riskLevel: "Low" | "Medium" | "High"
- smartMoneyReasoning: 详细的分析推理过程（${lang === 'zh' ? '中文' : 'English'}，解释为什么给出这个评价）

${languageInstruction}

请确保返回的是有效的 JSON 格式，不要包含任何 Markdown 代码块标记。`;

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 尝试解析 JSON（移除可能的代码块标记）
      let jsonStr = text.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const parsedResult = JSON.parse(jsonStr);

      // 验证必需字段
      if (!parsedResult.sentiment || !parsedResult.summary || !parsedResult.riskLevel || !parsedResult.smartMoneyReasoning) {
        throw new Error('Invalid response format from Gemini');
      }

      return NextResponse.json({
        sentiment: parsedResult.sentiment || 'Neutral',
        summary: parsedResult.summary || '',
        riskLevel: parsedResult.riskLevel || 'Medium',
        smartMoneyReasoning: parsedResult.smartMoneyReasoning || ''
      });
    } catch (aiError: any) {
      console.error('[Gemini Analyze] AI Error:', aiError);
      console.error('[Gemini Analyze] Error details:', JSON.stringify(aiError, null, 2));
      
      return NextResponse.json(
        {
          sentiment: 'Neutral',
          summary: lang === 'zh' 
            ? 'AI 分析服务暂时不可用，请稍后再试。如果问题持续存在，请联系技术支持。' 
            : 'AI analysis service temporarily unavailable. Please try again later. If the issue persists, please contact support.',
          riskLevel: 'Medium',
          smartMoneyReasoning: lang === 'zh'
            ? '由于 AI 服务暂时不可用，无法进行深度分析。建议手动检查钱包的资产配置和交易历史。'
            : 'Unable to perform deep analysis due to AI service unavailability. Please manually review the wallet\'s asset allocation and transaction history.'
        },
        { status: 200 }
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
