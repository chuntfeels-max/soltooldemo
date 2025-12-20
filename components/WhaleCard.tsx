
import React, { useState } from 'react';
import { WhaleProfile } from '../types';
import { TrendingUp, ShieldCheck, Zap, ExternalLink, Trash2, Edit2, Check, X } from 'lucide-react';
import { Language, translations } from '../services/i18n';

interface WhaleCardProps {
  whale: WhaleProfile;
  onClick: (address: string) => void;
  onDelete?: (address: string) => void;
  onUpdateNotes?: (address: string, notes: string) => void;
  isActive: boolean;
  lang: Language;
}

const WhaleCard: React.FC<WhaleCardProps> = ({ whale, onClick, onDelete, onUpdateNotes, isActive, lang }) => {
  const t = translations[lang].whaleCard;
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(whale.notes || '');
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(whale.address);
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleEditNotes = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingNotes(true);
    setNotesValue(whale.notes || '');
  };

  const handleSaveNotes = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateNotes) {
      onUpdateNotes(whale.address, notesValue.trim());
    }
    setIsEditingNotes(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotesValue(whale.notes || '');
    setIsEditingNotes(false);
  };

  return (
    <div 
      onClick={() => onClick(whale.address)}
      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 group transform relative ${
        isActive 
          ? 'bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]' 
          : 'bg-slate-900/50 border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/10'
      }`}
    >
      {onDelete && (
        <button 
          onClick={handleDelete}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
          title={t.delete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="max-w-[70%]">
          <h3 className="text-white font-bold text-lg flex items-center gap-2 group-hover:text-blue-400 transition-colors truncate">
            {whale.label}
            {whale.trustScore > 90 && <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
          </h3>
          <p className="text-slate-400 text-xs font-mono">{whale.address.slice(0, 6)}...{whale.address.slice(-4)}</p>
        </div>
        {!onDelete && (
          <div className="flex flex-col items-end">
            <span className="text-emerald-400 font-bold flex items-center gap-1 text-sm">
              <TrendingUp className="w-3 h-3" /> {whale.pnl30d}
            </span>
            <span className="text-slate-500 text-[10px] uppercase tracking-wider">{t.pnl30d}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {whale.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700 group-hover:border-blue-500/30 transition-colors">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3 group-hover:border-slate-700">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-yellow-400" />
          <span>{t.winRate}: <span className="text-white font-semibold">{whale.winRate}%</span></span>
        </div>
        <a 
          href={`https://solscan.io/account/${whale.address}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleExternalClick}
          className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"
        >
          <span className="text-[10px] uppercase">{t.solscan}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 备注编辑区域（仅在关注列表中显示） */}
      {onUpdateNotes && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          {isEditingNotes ? (
            <div className="flex items-start gap-2">
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder={lang === 'zh' ? '添加备注...' : 'Add notes...'}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 resize-none outline-none focus:border-blue-500/50"
                rows={2}
              />
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleSaveNotes}
                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                  title={lang === 'zh' ? '保存' : 'Save'}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                  title={lang === 'zh' ? '取消' : 'Cancel'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-h-[20px]">
                {whale.notes ? (
                  <p className="text-xs text-slate-400 leading-relaxed">{whale.notes}</p>
                ) : (
                  <p className="text-xs text-slate-600 italic">{lang === 'zh' ? '点击添加备注' : 'Click to add notes'}</p>
                )}
              </div>
              <button
                onClick={handleEditNotes}
                className="p-1.5 rounded-lg bg-slate-800/50 text-slate-500 hover:bg-slate-700 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                title={lang === 'zh' ? '编辑备注' : 'Edit notes'}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhaleCard;
