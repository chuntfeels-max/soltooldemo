'use client';

import React from 'react';
import { TokenInfo } from '../types';
import { Language, translations } from '../services/i18n';

interface PortfolioTableProps {
  tokens: TokenInfo[];
  isLoading: boolean;
  lang: Language;
  valueThreshold?: number;
  hideStablecoins?: boolean;
}

// 稳定币列表
const STABLECOINS = ['USDC', 'USDT', 'USD1', 'USDB', 'BUSD', 'DAI', 'FIDA', 'USDY'];

const PortfolioTable: React.FC<PortfolioTableProps> = ({ 
  tokens, 
  isLoading, 
  lang, 
  valueThreshold = 100,
  hideStablecoins = false 
}) => {
  const t = translations[lang].holdings;
  
  // 过滤代币：余额>0，价值>=阈值，可选隐藏稳定币
  const valuableTokens = tokens.filter(token => {
    const balance = token.balance || 0;
    const value = token.price_info?.total_price || 0;
    const isStablecoin = STABLECOINS.includes(token.symbol.toUpperCase());
    
    // 基本过滤：余额>0且价值>=阈值
    if (balance <= 0 || value < valueThreshold) {
      return false;
    }
    
    // 如果启用隐藏稳定币，则过滤掉稳定币
    if (hideStablecoins && isStablecoin) {
      return false;
    }
    
    return true;
  });
  
  const totalValue = valuableTokens.reduce((acc, t) => acc + (t.price_info?.total_price || 0), 0);

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-900/40 animate-pulse rounded-2xl border border-slate-800/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-md shadow-2xl">
      {/* 移动端卡片式布局 */}
      <div className="block md:hidden">
        <div className="divide-y divide-slate-800/40">
          {valuableTokens.map((token) => {
            const value = token.price_info?.total_price || 0;
            
            return (
              <div key={token.mint} className="p-3 hover:bg-slate-800/30 transition-all">
                {/* 第一行：图标 + 名称 + 价值 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 overflow-hidden flex items-center justify-center shadow-lg shadow-black/50">
                      {token.image_url ? (
                        <img src={token.image_url} alt={token.symbol} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-black text-slate-600">{token.symbol.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="text-sm font-black text-white uppercase tracking-tight">{token.symbol}</div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-base font-black text-white tabular-nums">
                      ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
                {/* 第二行：余额 */}
                <div className="flex items-center text-xs text-slate-400 pl-11">
                  <span className="font-bold">余额: </span>
                  <span className="text-slate-300 font-bold tabular-nums ml-1">
                    {token.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })}
          {valuableTokens.length === 0 && (
            <div className="px-6 py-20 text-center text-slate-700 italic font-black uppercase tracking-[0.2em] text-xs">
              {t.empty}
            </div>
          )}
        </div>
      </div>

      {/* 桌面端表格布局 */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800/60">
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.asset}</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.balance}</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Weight</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.value}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {valuableTokens.map((token) => {
              const value = token.price_info?.total_price || 0;
              const weight = totalValue > 0 ? (value / totalValue) * 100 : 0;
              
              return (
                <tr key={token.mint} className="hover:bg-slate-800/30 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-black/50">
                        {token.image_url ? (
                          <img src={token.image_url} alt={token.symbol} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-black text-slate-600">{token.symbol.slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{token.symbol}</div>
                        <div className="text-[9px] text-slate-500 font-bold font-mono tracking-tighter truncate max-w-[120px]">{token.mint}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-slate-300 tabular-nums">
                      {token.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      ${token.price_info?.price_per_token?.toFixed(4) || '0.00'}
                    </div>
                  </td>
                  <td className="px-6 py-5 min-w-[160px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all duration-1000"
                          style={{ width: `${weight}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-black text-slate-400 w-10 tabular-nums">{weight.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-black text-white tabular-nums">
                      ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </td>
                </tr>
              );
            })}
            {valuableTokens.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-slate-700 italic font-black uppercase tracking-[0.2em] text-xs">
                  {t.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable;
