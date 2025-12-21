import { useState, useEffect, useCallback, useRef } from 'react';
import { TokenInfo, WhaleTransaction, AnalysisResult } from '../types';
import { Language } from '../services/i18n';
import { getHoldings, getRecentTransactions } from '../services/heliusServiceClient';
import { analyzeWhaleWallet } from '../services/geminiServiceClient';
import { cache } from '../utils/cache';

interface WalletDataCache {
  tokens: TokenInfo[];
  transactions: WhaleTransaction[];
  analysis: AnalysisResult | null;
  timestamp: number;
}

interface UseWalletDataReturn {
  tokens: TokenInfo[];
  transactions: WhaleTransaction[];
  analysis: AnalysisResult | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  fetchWalletData: (address: string, lang: Language, forceRefresh?: boolean) => Promise<void>;
  refreshData: (forceRefresh?: boolean) => Promise<void>;
}

// 缓存 TTL：10 分钟
const WALLET_DATA_CACHE_TTL = 10 * 60 * 1000;
const AI_ANALYSIS_CACHE_TTL = 30 * 60 * 1000; // AI 分析缓存 30 分钟

export const useWalletData = (initialAddress: string, lang: Language): UseWalletDataReturn => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>(initialAddress);
  const lastFetchedAddress = useRef<string>('');

  const fetchWalletData = useCallback(async (address: string, currentLang: Language, forceRefresh: boolean = false) => {
    // 如果是同一个地址且不是强制刷新，检查缓存
    if (!forceRefresh && address === lastFetchedAddress.current) {
      const cacheKey = `wallet:${address}`;
      const cached = cache.get<WalletDataCache>(cacheKey);
      
      if (cached) {
        // 使用缓存数据
        setTokens(cached.tokens);
        setTransactions(cached.transactions);
        setAnalysis(cached.analysis);
        setIsLoading(false);
        setIsAnalyzing(false);
        setCurrentAddress(address);
        console.log(`[Cache] Using cached data for ${address.slice(0, 8)}...`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setCurrentAddress(address);
    lastFetchedAddress.current = address;

    // 如果不是强制刷新，先尝试从缓存加载
    if (!forceRefresh) {
      const cacheKey = `wallet:${address}`;
      const cached = cache.get<WalletDataCache>(cacheKey);
      
      if (cached) {
        setTokens(cached.tokens);
        setTransactions(cached.transactions);
        setAnalysis(cached.analysis);
        setIsLoading(false);
        setIsAnalyzing(false);
        console.log(`[Cache] Loaded from cache for ${address.slice(0, 8)}...`);
        return;
      }
    }

    try {
      const [tokenData, txData] = await Promise.all([
        getHoldings(address, !forceRefresh).catch((err) => {
          console.error('Failed to fetch holdings:', err);
          return [];
        }),
        getRecentTransactions(address, !forceRefresh).catch((err) => {
          console.error('Failed to fetch transactions:', err);
          return [];
        })
      ]);
      
      setTokens(tokenData || []);
      setTransactions(txData || []);

      // 检查 AI 分析缓存
      let aiResponse: AnalysisResult | null = null;
      const aiCacheKey = `ai:${address}:${currentLang}`;
      
      if (!forceRefresh) {
        aiResponse = cache.get<AnalysisResult>(aiCacheKey);
      }

      if (tokenData && tokenData.length > 0) {
        if (!aiResponse) {
          setIsAnalyzing(true);
          try {
            aiResponse = await analyzeWhaleWallet(address, tokenData, currentLang);
            // 缓存 AI 分析结果
            cache.set(aiCacheKey, aiResponse, AI_ANALYSIS_CACHE_TTL);
          } catch (aiError) {
            console.error('AI analysis failed:', aiError);
            aiResponse = {
              sentiment: 'Neutral',
              summary: currentLang === 'zh' 
                ? 'AI 分析暂时不可用，请稍后再试。' 
                : 'AI analysis temporarily unavailable. Please try again later.',
              riskLevel: 'Medium',
              smartMoneyReasoning: 'AI service error occurred.'
            };
          } finally {
            setIsAnalyzing(false);
          }
        }
        setAnalysis(aiResponse);
      } else {
        aiResponse = {
          sentiment: 'Neutral',
          summary: currentLang === 'zh' 
            ? '该钱包目前资产规模较小，AI 建议持续观测。' 
            : 'Small asset scale detected, AI suggests continued observation.',
          riskLevel: 'Low',
          smartMoneyReasoning: 'Minimal on-chain footprint for high-fidelity classification.'
        };
        setAnalysis(aiResponse);
      }

      // 缓存完整数据
      const cacheKey = `wallet:${address}`;
      cache.set<WalletDataCache>(cacheKey, {
        tokens: tokenData || [],
        transactions: txData || [],
        analysis: aiResponse,
        timestamp: Date.now()
      }, WALLET_DATA_CACHE_TTL);

      console.log(`[API] Fetched fresh data for ${address.slice(0, 8)}...`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Wallet data fetch error:', err);
      
      // 如果获取失败，清空数据并设置错误状态
      setTokens([]);
      setTransactions([]);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  }, []);

  const refreshData = useCallback(async (forceRefresh: boolean = false) => {
    if (currentAddress) {
      await fetchWalletData(currentAddress, lang, forceRefresh);
    }
  }, [currentAddress, lang, fetchWalletData]);

  useEffect(() => {
    fetchWalletData(initialAddress, lang);
  }, [initialAddress, lang, fetchWalletData]);

  return {
    tokens,
    transactions,
    analysis,
    isLoading,
    isAnalyzing,
    error,
    fetchWalletData,
    refreshData
  };
};

