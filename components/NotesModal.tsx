
import React, { useEffect, useRef } from 'react';
import { X, Bookmark, Send } from 'lucide-react';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  initialNotes?: string;
  title?: string;
  lang?: 'zh' | 'en';
}

const NotesModal: React.FC<NotesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialNotes = '',
  title,
  lang = 'zh'
}) => {
  const [notes, setNotes] = React.useState(initialNotes);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNotes(initialNotes);
      // 延迟聚焦，确保动画完成后
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, initialNotes]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onConfirm(notes.trim());
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const t = {
    title: lang === 'zh' ? '添加备注' : 'Add Notes',
    placeholder: lang === 'zh' ? '输入备注信息（可选）...' : 'Enter notes (optional)...',
    cancel: lang === 'zh' ? '取消' : 'Cancel',
    confirm: lang === 'zh' ? '确认' : 'Confirm'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
      
      {/* 模态框内容 */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in slide-in-from-bottom-2 duration-300">
        {/* 顶部装饰条 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-t-2xl" />
        
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                {title || t.title}
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                {lang === 'zh' ? '为钱包添加备注信息' : 'Add notes for this wallet'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
            {lang === 'zh' ? '备注内容' : 'Notes'}
          </label>
          <textarea
            ref={inputRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.placeholder}
            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleConfirm();
              }
            }}
          />
          <p className="mt-2 text-[10px] text-slate-600">
            {lang === 'zh' ? '按 Cmd/Ctrl + Enter 快速确认' : 'Press Cmd/Ctrl + Enter to confirm'}
          </p>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center gap-3 p-6 pt-0 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-black uppercase tracking-wider transition-all"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Send className="w-4 h-4" />
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;

