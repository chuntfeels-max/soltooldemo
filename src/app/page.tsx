
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Search, Activity, Wallet, Globe, Loader2, History, ArrowUpRight, 
  RefreshCw, Cpu, Database, Copy, CheckCircle2, TrendingUp, 
  LayoutDashboard, Users, Zap, Bookmark, ShieldCheck, Trash2, PieChart as PieIcon, Send,
  Info, Menu, X
} from 'lucide-react';
import WhaleCard from '../../components/WhaleCard';
import EliteRankingCard from '../../components/EliteRankingCard';
import PortfolioTable from '../../components/PortfolioTable';
import NotesModal from '../../components/NotesModal';
import { RankingCategory } from '../../types';
import { SMART_MONEY_WHALES } from '../../constants';
import { WhaleProfile } from '../../types';
import { Language, translations } from '../../services/i18n';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useWalletData } from '../../hooks/useWalletData';
import { useWatchlist } from '../../hooks/useWatchlistClient';
import { useMarketStats } from '../../hooks/useMarketStats';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { isValidSolanaAddress, formatAddress, copyToClipboard } from '../../utils/validation';

export default function HomePage() {
  // 使用 localStorage 持久化用户设置
  const [lang, setLang] = useLocalStorage<Language>('sw_lang', 'zh');
  const [activeAddress, setActiveAddress] = useLocalStorage<string>('sw_activeAddress', SMART_MONEY_WHALES[0].address);
  const [sidebarTab, setSidebarTab] = useLocalStorage<'elite' | 'watchlist'>('sw_sidebarTab', 'elite');
  const [valueThreshold, setValueThreshold] = useLocalStorage<number>('sw_valueThreshold', 100);
  const [hideStablecoins, setHideStablecoins] = useLocalStorage<boolean>('sw_hideStablecoins', false);
  const [rankingCategory, setRankingCategory] = useLocalStorage<RankingCategory>('sw_rankingCategory', 'todayPnl');

  // 不需要持久化的状态
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [showBotModal, setShowBotModal] = useState<boolean>(false);
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [pendingWhaleAddress, setPendingWhaleAddress] = useState<string>('');
  const [newWhaleAddr, setNewWhaleAddr] = useState('');
  const [newWhaleLabel, setNewWhaleLabel] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // 移动端侧边栏开关

  // 精英榜数据状态（用于定时更新）
  const [eliteWhalesData, setEliteWhalesData] = useState<WhaleProfile[]>(SMART_MONEY_WHALES);
  const [lastUpdateTime, setLastUpdateTime] = useLocalStorage<number>('sw_eliteLastUpdate', Date.now());
  const [formattedUpdateTime, setFormattedUpdateTime] = useState<string>('');

  // 使用自定义 Hooks
  const { tokens, transactions, analysis, isLoading, isAnalyzing, error, fetchWalletData, refreshData } = useWalletData(activeAddress, lang);
  const { watchlist, addWhale, removeWhale, updateWhaleNotes, isInWatchlist, isLoading: watchlistLoading } = useWatchlist();
  const marketStats = useMarketStats(true);
  const { recentSearches, addSearch } = useSearchHistory();

  const t = translations[lang];

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddr = searchQuery.trim();
    if (isValidSolanaAddress(cleanAddr)) {
      setActiveAddress(cleanAddr);
      setSearchQuery('');
      addSearch(cleanAddr);
    }
  }, [searchQuery, setActiveAddress, addSearch]);

  const handleCopyAddress = useCallback(async () => {
    const success = await copyToClipboard(activeAddress);
    setCopySuccess(success);
    setTimeout(() => setCopySuccess(false), 2000);
  }, [activeAddress]);

  const handleAddWhale = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = newWhaleAddr.trim();
    if (!isValidSolanaAddress(addr)) {
      alert(lang === 'zh' ? '请输入有效的 Solana 钱包地址' : 'Please enter a valid Solana wallet address');
      return;
    }
    
    if (isInWatchlist(addr)) {
      alert(t.sidebar.alreadyIn);
      return;
    }

    const newWhale: WhaleProfile = {
      address: addr,
      label: newWhaleLabel.trim() || (lang === 'zh' ? '自定义追踪' : 'Custom Insight'),
      winRate: 0,
      pnl30d: '--',
      trustScore: 50,
      tags: ['Watchlist']
    };

    await addWhale(newWhale);
    setNewWhaleAddr('');
    setNewWhaleLabel('');
  }, [newWhaleAddr, newWhaleLabel, isInWatchlist, addWhale, t.sidebar.alreadyIn, lang]);

  const handleQuickTrack = useCallback(async (whale: WhaleProfile) => {
    const success = await addWhale(whale);
    if (success) {
      setSidebarTab('watchlist');
    }
  }, [addWhale, setSidebarTab]);

  const handleNotesConfirm = useCallback(async (notes: string) => {
    const existingWhale = SMART_MONEY_WHALES.find(w => w.address === pendingWhaleAddress);
    const whaleProfile: WhaleProfile = existingWhale || {
      address: pendingWhaleAddress,
      label: formatAddress(pendingWhaleAddress),
      winRate: 0,
      pnl30d: '0%',
      trustScore: 0,
      tags: []
    };
    if (notes.trim()) {
      whaleProfile.notes = notes.trim();
    }
    const success = await addWhale(whaleProfile);
    if (success) {
      setSidebarTab('watchlist');
    }
  }, [pendingWhaleAddress, addWhale, setSidebarTab]);

  // 更新精英榜数据（模拟数据更新，实际应用中应调用API）
  const updateEliteRanking = useCallback(() => {
    // 在实际应用中，这里应该调用API获取最新的排名数据
    // 例如：const response = await fetch('/api/elite-ranking');
    // const updatedData = await response.json();
    
    // 目前使用模拟数据，添加轻微随机变化来模拟实时数据更新
    const updatedData = SMART_MONEY_WHALES.map(whale => ({
      ...whale,
      // 模拟数据变化（轻微波动，±5%范围内）
      todayPnl: whale.todayPnl ? Math.round(whale.todayPnl * (0.95 + Math.random() * 0.1)) : whale.todayPnl,
      weeklyWinRate: whale.weeklyWinRate ? Math.max(0, Math.min(100, Math.round((whale.weeklyWinRate + (Math.random() - 0.5) * 2) * 10) / 10)) : whale.weeklyWinRate,
    }));
    setEliteWhalesData(updatedData);
    setLastUpdateTime(Date.now());
    console.log('[Elite Ranking] Updated at', new Date().toLocaleTimeString());
  }, [setLastUpdateTime]);

  // 格式化更新时间（只在客户端执行，避免 hydration 错误）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFormattedUpdateTime(
        new Date(lastUpdateTime).toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      );
    }
  }, [lastUpdateTime, lang]);

  // 每30分钟自动更新精英榜
  useEffect(() => {
    // 首次加载时检查是否需要更新（距离上次更新超过30分钟）
    const timeSinceLastUpdate = Date.now() - lastUpdateTime;
    const UPDATE_INTERVAL = 30 * 60 * 1000; // 30分钟

    if (timeSinceLastUpdate >= UPDATE_INTERVAL) {
      updateEliteRanking();
    }

    // 设置定时器，每30分钟更新一次
    const interval = setInterval(() => {
      updateEliteRanking();
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [lastUpdateTime, updateEliteRanking]);

  // 根据排序类别对鲸鱼列表进行排序
  const sortedEliteWhales = useMemo(() => {
    const whales = [...eliteWhalesData];
    return whales.sort((a, b) => {
      switch (rankingCategory) {
        case 'todayPnl':
          return (b.todayPnl || 0) - (a.todayPnl || 0);
        case 'weeklyWinRate':
          return (b.weeklyWinRate || b.winRate) - (a.weeklyWinRate || a.winRate);
        case 'earlyEntry':
          return (b.earlyEntryScore || 0) - (a.earlyEntryScore || 0);
        case 'heavyPosition':
          return (b.heavyPositionScore || 0) - (a.heavyPositionScore || 0);
        default:
          return 0;
      }
    }).slice(0, 5); // 只显示前5名
  }, [rankingCategory, eliteWhalesData]);

  const COLORS = useMemo(() => ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'], []);
  
  const chartData = useMemo(() => {
    return tokens
      .slice(0, 6)
      .map(t => ({ 
        name: t.symbol, 
        value: t.price_info?.total_price || 0 
      }))
      .filter(d => d.value > 0);
  }, [tokens]);
  
  const totalValue = useMemo(() => {
    return tokens.reduce((acc, t) => acc + (t.price_info?.total_price || 0), 0);
  }, [tokens]);

  const handleRefresh = useCallback(() => {
    refreshData(true);
  }, [refreshData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30">
      {/* 跑马灯 */}
      <div className="bg-blue-600/5 border-b border-blue-500/10 py-1.5 px-4 overflow-hidden whitespace-nowrap text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 flex gap-12">
        <div className="flex items-center gap-2 shrink-0"><Zap className="w-3 h-3 animate-pulse" /> NETWORK STATUS: OPTIMAL</div>
        <div className="flex gap-16 animate-infinite-scroll">
          <span>SOL: ${marketStats.solPrice.toFixed(2)}</span>
          <span>TPS: {marketStats.tps}</span>
          <span>FEE: 0.000005 SOL</span>
          <span className="text-slate-700">|</span>
          <span>ALPHA DETECTED IN JUPITER AGGREGATOR</span>
        </div>
      </div>

      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          {/* 移动端侧边栏按钮 */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Activity className="text-white w-4 h-4 md:w-5 md:h-5" />
          </div>
          <h1 className="text-base md:text-lg font-black tracking-tighter uppercase italic">WhaleTracker <span className="text-blue-500">v0.2</span></h1>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <button onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')} className="p-2 text-slate-400 hover:text-white transition-colors"><Globe className="w-4 h-4 md:w-5 md:h-5" /></button>
          <button onClick={() => setShowBotModal(true)} className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 md:gap-2 shadow-lg shadow-blue-600/20"><Send className="w-3 h-3" /> <span className="hidden sm:inline">{t.nav.tgBot}</span></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-4 md:py-6">
        {/* 移动端侧边栏遮罩 */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
        {/* 左侧栏 - 移动端抽屉 */}
        <aside className={`lg:col-span-3 space-y-4 md:space-y-6 fixed lg:static top-0 left-0 h-full lg:h-auto w-80 md:w-96 lg:w-auto bg-slate-950 lg:bg-transparent z-50 lg:z-auto transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } overflow-y-auto lg:overflow-visible border-r lg:border-r-0 border-white/5 lg:border-none p-4 md:p-6 lg:p-0`}>
          {/* 移动端关闭按钮 */}
          <div className="lg:hidden flex items-center justify-between mb-4 pb-4 border-b border-white/5">
            <h2 className="text-sm font-black text-white uppercase">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-slate-900/40 p-1 rounded-xl border border-white/5 flex">
            <button onClick={() => setSidebarTab('elite')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${sidebarTab === 'elite' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>{t.sidebar.tabElite}</button>
            <button onClick={() => setSidebarTab('watchlist')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${sidebarTab === 'watchlist' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>{t.sidebar.tabWatchlist}</button>
          </div>

          {sidebarTab === 'watchlist' && (
            <form onSubmit={handleAddWhale} className="bg-slate-900/30 border border-white/5 rounded-xl p-4 space-y-3">
              <input type="text" placeholder={t.sidebar.addPlaceholder} className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-mono outline-none focus:border-blue-500/50" value={newWhaleAddr} onChange={e => setNewWhaleAddr(e.target.value)} />
              <div className="flex gap-2">
                <input type="text" placeholder={t.sidebar.addLabel} className="flex-1 bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-blue-500/50" value={newWhaleLabel} onChange={e => setNewWhaleLabel(e.target.value)} />
                <button type="submit" className="bg-blue-600 px-3 rounded-lg hover:bg-blue-500 transition-colors"><RefreshCw className="w-3 h-3" /></button>
              </div>
            </form>
          )}

          {sidebarTab === 'elite' && (
            <>
              {/* 桌面端显示排序按钮，移动端在横向滚动头像框上方不显示 */}
              <div className="hidden lg:block bg-slate-900/40 border border-white/5 rounded-xl p-1 mb-3 flex gap-1">
                <button
                  onClick={() => setRankingCategory('todayPnl')}
                  className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black transition-all ${
                    rankingCategory === 'todayPnl'
                      ? 'bg-blue-600 text-white shadow-md border border-blue-500/50'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {lang === 'zh' ? '收益' : 'PnL'}
                </button>
                <button
                  onClick={() => setRankingCategory('weeklyWinRate')}
                  className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black transition-all ${
                    rankingCategory === 'weeklyWinRate'
                      ? 'bg-blue-600 text-white shadow-md border border-blue-500/50'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {lang === 'zh' ? '胜率' : 'Win Rate'}
                </button>
                <button
                  onClick={() => setRankingCategory('earlyEntry')}
                  className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black transition-all ${
                    rankingCategory === 'earlyEntry'
                      ? 'bg-blue-600 text-white shadow-md border border-blue-500/50'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {lang === 'zh' ? '狙击' : 'Snipe'}
                </button>
                <button
                  onClick={() => setRankingCategory('heavyPosition')}
                  className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black transition-all ${
                    rankingCategory === 'heavyPosition'
                      ? 'bg-blue-600 text-white shadow-md border border-blue-500/50'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {lang === 'zh' ? '重仓' : 'Heavy'}
                </button>
              </div>
              {/* 最后更新时间 - 只在桌面端显示 */}
              <div className="hidden lg:flex bg-slate-900/30 border border-white/5 rounded-xl px-3 py-2 mb-3 items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {lang === 'zh' ? '更新于' : 'Updated'}: {formattedUpdateTime || '--:--'}
                  </span>
                </div>
                <button
                  onClick={updateEliteRanking}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                  title={lang === 'zh' ? '手动刷新' : 'Manual Refresh'}
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </>
          )}

          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 scrollbar-hide">
            {sidebarTab === 'elite' ? (
              // 桌面端显示精英榜卡片，移动端已在搜索框下方显示横向滚动头像框
              <div className="hidden lg:block">
                {sortedEliteWhales.map((whale, index) => (
                  <EliteRankingCard
                    key={whale.address}
                    whale={whale}
                    rank={index + 1}
                    category={rankingCategory}
                    onClick={(address) => setActiveAddress(address)}
                    onTrack={handleQuickTrack}
                    isTracked={isInWatchlist(whale.address)}
                    lang={lang}
                  />
                ))}
              </div>
            ) : (
              watchlist.length > 0 ? (
                watchlist.map(whale => (
                  <WhaleCard 
                    key={whale.address} 
                    whale={whale} 
                    onClick={() => setActiveAddress(whale.address)} 
                    isActive={activeAddress === whale.address} 
                    lang={lang} 
                    onDelete={removeWhale}
                    onUpdateNotes={updateWhaleNotes}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-sm">
                  {t.sidebar.noWatchlist}
                </div>
              )
            )}
          </div>
        </aside>

        {/* 右侧主内容区 */}
        <div className="lg:col-span-9 space-y-4 md:space-y-6 lg:space-y-8">
          {/* 搜索栏 */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search.placeholder}
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 text-sm font-mono outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all"
              />
            </div>
            <button type="submit" className="w-full sm:w-auto px-6 py-3 md:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-wider text-xs transition-all shadow-lg shadow-blue-600/20">
              {t.search.button}
            </button>
          </form>

          {/* 移动端精英榜横向滚动快捷头像框 */}
          <div className="lg:hidden">
            <div className="mb-2 px-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.sidebar.tabElite}</span>
                <span className="text-[9px] text-slate-600">({sortedEliteWhales.length})</span>
              </div>
              <div className="overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
                <div className="flex gap-2 min-w-max">
                  {sortedEliteWhales.slice(0, 10).map((whale, index) => {
                    const displayValue = rankingCategory === 'todayPnl' 
                      ? (whale.todayPnl ? `+${whale.todayPnl.toLocaleString()}%` : whale.pnl30d)
                      : rankingCategory === 'weeklyWinRate'
                      ? (whale.weeklyWinRate ? `${whale.weeklyWinRate}%` : `${whale.winRate}%`)
                      : rankingCategory === 'earlyEntry'
                      ? (whale.earlyEntryScore ? `${whale.earlyEntryScore}` : 'N/A')
                      : (whale.heavyPositionScore ? `${whale.heavyPositionScore}` : 'N/A');
                    
                    return (
                      <button
                        key={whale.address}
                        onClick={() => {
                          setActiveAddress(whale.address);
                          setSidebarOpen(false);
                        }}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all min-w-[70px] ${
                          activeAddress === whale.address
                            ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-600/10'
                            : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 border-2 border-white/10 flex items-center justify-center text-white font-black text-xs shadow-lg">
                          {index + 1}
                        </div>
                        <div className="text-[9px] font-black text-slate-300 text-center truncate w-full max-w-[60px]">
                          {whale.label.slice(0, 6)}
                        </div>
                        <div className="text-[8px] font-black text-blue-400 tabular-nums">
                          {displayValue}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 钱包地址和状态 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t.header.activeIntelligence}</span>
                {isLoading ? (
                  <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    LOADING...
                  </span>
                ) : error ? (
                  <span className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-[8px] font-black uppercase tracking-widest border border-red-500/20">• ERROR</span>
                ) : (
                  <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">• LIVE DATA</span>
                )}
              </div>
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
                <span className="text-slate-300 break-all sm:break-normal">{activeAddress.slice(0, 8)}...{activeAddress.slice(-8)}</span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors flex-shrink-0"
                  title={t.header.copyAddress}
                >
                  {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-12 relative z-10 shrink-0">
              <div className="text-left sm:text-right">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">{t.header.portfolioValue}</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tabular-nums break-words">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <button onClick={handleRefresh} className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-lg">
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* AI分析和持仓矩阵 - 移动端上下排列，桌面端左右排列 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-4 md:p-6 space-y-4 md:space-y-6 shadow-xl relative overflow-hidden">
              {isLoading && <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-20 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>}
              <div className="flex items-center justify-between border-b border-white/5 pb-3 md:pb-4">
                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2"><Cpu className="w-4 h-4" /> AI Tactical Scan</h3>
                {analysis && <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${analysis.sentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>{analysis.sentiment}</span>}
              </div>
              {analysis ? (
                <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium italic">"{analysis.summary}"</p>
                  <div className="bg-black/30 p-3 md:p-4 rounded-xl border border-white/5">
                    <p className="text-[9px] text-slate-500 uppercase font-black mb-2 tracking-widest">Logic Reasoning</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed font-mono">{analysis.smartMoneyReasoning}</p>
                  </div>
                  {/* 快捷加入关注按钮 */}
                  <div className="pt-2">
                    {isInWatchlist(activeAddress) ? (
                      <button
                        onClick={async () => {
                          await removeWhale(activeAddress);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-xs font-black text-slate-400 hover:text-slate-300 transition-all uppercase tracking-wider"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                        <span>已关注 - 点击取消</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setPendingWhaleAddress(activeAddress);
                          setShowNotesModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-xl text-xs font-black text-blue-400 hover:text-blue-300 transition-all uppercase tracking-wider"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>加入关注列表</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : error ? (
                <div className="py-20 text-center space-y-4">
                  <div className="text-red-400 text-[10px] font-black uppercase tracking-widest">Error Loading Analysis</div>
                  <div className="text-slate-500 text-xs font-mono">{error}</div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-700 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  {isAnalyzing ? 'Running Neural Analytics...' : 'No data available'}
                </div>
              )}
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-4 md:p-6 flex flex-col shadow-xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2"><PieIcon className="w-4 h-4" /> Exposure Matrix</h3>
              <div className="w-full h-[240px] sm:h-[280px] md:h-[320px] relative">
                {chartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={chartData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius="45%" 
                          outerRadius="65%" 
                          paddingAngle={2} 
                          dataKey="value" 
                          stroke="none"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {chartData.map((entry, i) => (
                            <Cell 
                              key={`cell-${i}`} 
                              fill={COLORS[i % COLORS.length]}
                              stroke="#0f172a"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0];
                              return (
                                <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 shadow-xl">
                                  <div className="text-xs font-black text-slate-300 uppercase tracking-wider mb-1">
                                    {data.name}
                                  </div>
                                  <div className="text-sm font-black text-white">
                                    ${(data.value as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* 中心显示总价值和主要资产 */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center px-2">
                        <div className="text-[9px] sm:text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          TOTAL VALUE
                        </div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-black text-white tabular-nums mb-1 md:mb-2 break-words">
                          ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        {chartData.length > 0 && (
                          <div className="text-xs font-black text-blue-400">
                            {chartData[0].name} {((chartData[0].value / totalValue) * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 图例 */}
                    <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-3 justify-center pt-4">
                      {chartData.slice(0, 6).map((entry, i) => {
                        const percent = (entry.value / totalValue * 100).toFixed(1);
                        return (
                          <div key={entry.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-[10px] font-black text-slate-400">{entry.name} {percent}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-700 text-[10px] font-black uppercase">
                    {tokens.length === 0 ? 'No Data Available' : 'Insufficient Data for Chart'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 价值过滤控件 */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                价值阈值:
              </label>
              <select 
                value={valueThreshold} 
                onChange={(e) => setValueThreshold(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value={50}>≥ $50</option>
                <option value={100}>≥ $100</option>
                <option value={500}>≥ $500</option>
                <option value={1000}>≥ $1000</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={hideStablecoins}
                onChange={(e) => setHideStablecoins(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                隐藏稳定币
              </span>
            </label>
          </div>

          <PortfolioTable 
            tokens={tokens} 
            isLoading={isLoading} 
            lang={lang}
            valueThreshold={valueThreshold}
            hideStablecoins={hideStablecoins}
          />
          
          <div className="bg-slate-900/20 border border-white/5 rounded-3xl overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Transaction Stream</h3>
              <RefreshCw className={`w-3 h-3 text-slate-700 ${isLoading ? 'animate-spin' : ''}`} />
            </div>
            <div className="divide-y divide-white/5">
              {transactions.map(tx => (
                <div key={tx.signature} className="px-4 md:px-6 py-4 md:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 flex-shrink-0">
                      <ArrowUpRight className={`w-4 h-4 md:w-5 md:h-5 ${tx.type === 'SWAP' ? 'text-blue-500' : 'text-slate-600'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[8px] text-blue-500 font-black uppercase tracking-widest">{tx.type}</span>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed break-words">{tx.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <a href={`https://solscan.io/tx/${tx.signature}`} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-slate-600 hover:text-white uppercase transition-colors whitespace-nowrap">Explorer</a>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && !isLoading && (
                <div className="py-16 text-center space-y-2">
                  {error ? (
                    <>
                      <div className="text-red-400 text-[10px] font-black uppercase tracking-widest">Error Loading Transactions</div>
                      <div className="text-slate-600 text-xs font-mono">{error}</div>
                    </>
                  ) : (
                    <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No Recent Transactions</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </main>

      <footer className="py-20 text-center opacity-20 mt-auto border-t border-white/5">
        <p className="text-[10px] font-black uppercase tracking-[0.8em]">SolWhaleTracker Terminal v0.2</p>
      </footer>

      {/* 备注输入模态框 */}
      <NotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        onConfirm={handleNotesConfirm}
        lang={lang}
      />
    </div>
  );
}

