import React, { useState, useRef, useEffect } from 'react';
import { Copy, RefreshCw, Share2, ChevronDown, Check } from 'lucide-react';
import { ModelId } from '../types';
import { DEEPSEEK_ICON, QWEN_ICON, DOUBAO_ICON, KLING_ICON } from '../assets/icons';

interface MessageActionsProps {
  content: string;
  onCopy: () => void;
  onRegenerate: (modelId?: ModelId) => void;
  onShare: () => void;
  currentModel?: string; // The display name of the model used
}

export const MessageActions: React.FC<MessageActionsProps> = ({ 
  content, 
  onCopy, 
  onRegenerate, 
  onShare,
  currentModel 
}) => {
  const [copied, setCopied] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const models = [
    { id: ModelId.DEEPSEEK_V3, label: 'Deepseek-V3' },
    { id: ModelId.QWEN_MAX, label: '通义千问' },
    { id: ModelId.DOUBAO_PRO, label: '豆包 Pro' },
    { id: ModelId.KLING_AI, label: '可灵 AI' },
  ];

  return (
    <div className="flex items-center gap-1 mt-2 opacity-50 hover:opacity-100 transition-opacity duration-200 select-none">
      {/* Copy */}
      <button 
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 rounded-md transition-colors"
        title="复制内容"
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        <span>{copied ? '已复制' : '复制'}</span>
      </button>

      {/* Divider */}
      <span className="text-zinc-200 dark:text-zinc-700">|</span>

      {/* Regenerate Group */}
      <div className="relative flex items-center" ref={menuRef}>
        <button 
          onClick={() => onRegenerate()}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 rounded-l-md transition-colors"
          title="重新生成"
        >
          <RefreshCw size={14} />
          <span>重新生成</span>
        </button>
        <button 
           onClick={() => setShowModelMenu(!showModelMenu)}
           className="px-1 py-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 rounded-r-md transition-colors border-l border-zinc-100 dark:border-zinc-700/50"
           title="切换模型重试"
        >
            <ChevronDown size={12} />
        </button>

        {/* Model Dropdown */}
        {showModelMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-40 bg-white dark:bg-[#252527] border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-[10px] font-bold text-zinc-400 dark:text-gray-500 bg-zinc-50 dark:bg-zinc-800/50 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-700">
                    使用其他模型
                </div>
                {models.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => {
                            onRegenerate(m.id);
                            setShowModelMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-zinc-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 flex items-center justify-between group/item"
                    >
                        <span>{m.label}</span>
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Divider */}
      <span className="text-zinc-200 dark:text-zinc-700">|</span>

      {/* Share */}
      <button 
        onClick={onShare}
        className="flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 rounded-md transition-colors"
        title="分享"
      >
        <Share2 size={14} />
      </button>
    </div>
  );
};
