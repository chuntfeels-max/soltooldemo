'use client';

import React from 'react';
import { WhaleProfile, RankingCategory } from '../types';
import { TrendingUp, Bookmark, ArrowRight, Zap } from 'lucide-react';
import { Language } from '../services/i18n';

interface EliteRankingCardProps {
  whale: WhaleProfile;
  rank: number;
  category: RankingCategory;
  onClick: (address: string) => void;
  onTrack: (whale: WhaleProfile) => void;
  isTracked: boolean;
  lang: Language;
}

const EliteRankingCard: React.FC<EliteRankingCardProps> = ({
  whale,
  rank,
  category,
  onClick,
  onTrack,
  isTracked,
  lang
}) => {
  const getDisplayValue = () => {
    switch (category) {
      case 'todayPnl':
        return whale.todayPnl ? `+${whale.todayPnl.toLocaleString()}%` : whale.pnl30d;
      case 'weeklyWinRate':
        return whale.weeklyWinRate ? `${whale.weeklyWinRate}%` : `${whale.winRate}%`;
      case 'earlyEntry':
        return whale.earlyEntryScore ? `${whale.earlyEntryScore}` : 'N/A';
      case 'heavyPosition':
        return whale.heavyPositionScore ? `${whale.heavyPositionScore}` : 'N/A';
      default:
        return whale.pnl30d;
    }
  };

  const getCategoryLabel = () => {
    if (lang === 'zh') {
      switch (category) {
        case 'todayPnl': return '24小时浮盈';
        case 'weeklyWinRate': return '本周胜率';
        case 'earlyEntry': return '早期入场分';
        case 'heavyPosition': return '持仓集中度';
        default: return '';
      }
    } else {
      switch (category) {
        case 'todayPnl': return '24h PnL';
        case 'weeklyWinRate': return 'Weekly Win Rate';
        case 'earlyEntry': return 'Early Entry';
        case 'heavyPosition': return 'Concentration';
        default: return '';
      }
    }
  };

  const handleTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTrack(whale);
  };

  return (
    <div
      onClick={() => onClick(whale.address)}
      className="p-4 rounded-xl cursor-pointer transition-all duration-300 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/50 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/10 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
            rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-950' :
            rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-950' :
            rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
            'bg-slate-800 text-slate-400'
          }`}>
            {rank}
          </div>
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2 group-hover:text-blue-400 transition-colors">
              {whale.label}
            </h3>
            <p className="text-slate-500 text-xs font-mono">{whale.address.slice(0, 6)}...{whale.address.slice(-4)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-emerald-400 font-bold flex items-center gap-1 text-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            {getDisplayValue()}
          </span>
          <span className="text-slate-500 text-[10px] uppercase tracking-wider">{getCategoryLabel()}</span>
        </div>
      </div>

      {/* 跟单理由 */}
      {whale.followReason && (
        <div className="mb-3 px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg">
          <p className="text-xs text-slate-400 leading-relaxed">{whale.followReason}</p>
        </div>
      )}

      {/* 标签和操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {whale.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded bg-slate-800/50 text-slate-300 text-[10px] font-medium border border-slate-700">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTrack}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              isTracked
                ? 'bg-slate-800 text-slate-400'
                : 'bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:text-blue-300'
            }`}
          >
            <Bookmark className={`w-3 h-3 ${isTracked ? 'fill-current' : ''}`} />
            {isTracked ? (lang === 'zh' ? '已关注' : 'Tracked') : (lang === 'zh' ? '+ 关注' : '+ Track')}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(whale.address);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
          >
            {lang === 'zh' ? '查看' : 'View'}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EliteRankingCard;

