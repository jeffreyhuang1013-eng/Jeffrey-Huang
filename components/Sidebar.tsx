import React from 'react';
import { ChatSession } from '../types';
import { Plus, MessageSquare, Trash2, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  chats: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onOpenSettings,
  isOpen
}) => {
  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-40 w-64 transform transition-all duration-300 ease-in-out flex flex-col
        bg-sidebar-light dark:bg-sidebar-dark border-r border-divider-light dark:border-divider-dark
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}
    >
      {/* Header / New Chat */}
      <div className="p-4 pt-5">
        <button
          onClick={onNewChat}
          className="group w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#2c2c2e] hover:bg-zinc-50 dark:hover:bg-[#3a3a3c] text-zinc-800 dark:text-white rounded-lg shadow-sm border border-zinc-200/50 dark:border-transparent transition-all duration-200"
        >
          <div className="p-1 rounded-md bg-zinc-100 dark:bg-gray-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Plus size={16} />
          </div>
          <span className="text-sm font-medium">新对话</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 py-2">
        <div className="px-3 py-2 text-[11px] font-semibold text-zinc-400 dark:text-gray-500 uppercase tracking-wider">
          近期记录
        </div>
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`
              group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm select-none
              ${currentChatId === chat.id 
                ? 'bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm' 
                : 'text-zinc-600 dark:text-gray-400 hover:bg-zinc-200/50 dark:hover:bg-[#2c2c2e]/50 hover:text-zinc-900 dark:hover:text-gray-200'}
            `}
          >
            <MessageSquare size={16} className={`${currentChatId === chat.id ? 'text-blue-500' : 'opacity-70'}`} />
            <div className="flex-1 truncate font-medium">
              {chat.title}
            </div>
            <button 
              onClick={(e) => onDeleteChat(chat.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-divider-light dark:border-divider-dark space-y-1 bg-sidebar-light dark:bg-sidebar-dark">
        <button 
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2 text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-[#2c2c2e] rounded-lg text-sm transition-colors"
        >
          <Settings size={18} />
          <span>设置</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-[#2c2c2e] rounded-lg text-sm transition-colors">
          <LogOut size={18} />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
};