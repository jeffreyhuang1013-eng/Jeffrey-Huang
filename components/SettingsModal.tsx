import React, { useState } from 'react';
import { X, User, CreditCard, Shield, Settings as SettingsIcon, Database, Moon, Sun, ChevronRight, LogOut, Download, Trash2 } from 'lucide-react';
import { UserProfile, Theme } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

type TabId = 'general' | 'account' | 'model' | 'data' | 'about';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, theme, onThemeChange }) => {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">外观与显示</h3>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-zinc-200 dark:border-gray-700 p-1 space-y-1 shadow-sm">
                <div 
                    onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
                    className="flex items-center justify-between p-3 hover:bg-zinc-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-100 dark:bg-gray-700 rounded-lg">
                            {theme === 'light' ? <Sun size={18} className="text-orange-500"/> : <Moon size={18} className="text-blue-400"/>}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-zinc-900 dark:text-white">
                                {theme === 'light' ? '浅色模式' : '深色模式'}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-gray-400">
                                点击切换主题
                            </div>
                        </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer pointer-events-none">
                        <div className={`w-11 h-6 rounded-full peer transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-zinc-300'}`}></div>
                        <div className={`absolute top-[2px] start-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-all ${theme === 'dark' ? 'translate-x-full border-white' : ''}`}></div>
                    </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">语言设置</h3>
               <div className="bg-white dark:bg-gray-800 rounded-xl border border-zinc-200 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm">
                  <span className="text-sm text-zinc-700 dark:text-gray-300">界面语言</span>
                  <select className="bg-zinc-100 dark:bg-gray-900 border border-zinc-300 dark:border-gray-700 text-zinc-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2">
                    <option value="zh-CN">简体中文 (中国大陆)</option>
                  </select>
               </div>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">账户安全</h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-zinc-200 dark:border-gray-700 overflow-hidden divide-y divide-zinc-200 dark:divide-gray-700/50 shadow-sm">
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-zinc-900 dark:text-white">电子邮箱</div>
                            <div className="text-xs text-zinc-500 dark:text-gray-400">user***@xstudio.com</div>
                        </div>
                        <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">更改</button>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                         <div>
                            <div className="text-sm font-medium text-zinc-900 dark:text-white">密码</div>
                            <div className="text-xs text-zinc-500 dark:text-gray-400">上次更改于 30 天前</div>
                        </div>
                        <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">重置</button>
                    </div>
                </div>
             </div>

             <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">订阅管理</h3>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/40 dark:to-purple-900/40 border border-blue-200 dark:border-blue-800/50 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-blue-800 dark:text-blue-200 uppercase tracking-wider">当前计划</span>
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">PRO</span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-bold text-zinc-900 dark:text-white">¥99</span>
                        <span className="text-zinc-500 dark:text-gray-400">/ 月</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-gray-400 mb-4">下一次扣费日期：2024年12月1日</p>
                    <button className="w-full py-2 bg-white dark:bg-zinc-100 text-gray-900 font-medium text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-200 border border-zinc-200 dark:border-transparent transition-colors shadow-sm">
                        管理订阅
                    </button>
                </div>
             </div>
          </div>
        );
      case 'model':
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">模型偏好</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-zinc-200 dark:border-gray-700 p-4 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-700 dark:text-gray-300">默认开启思考模式 (Qwen)</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-zinc-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-700 dark:text-gray-300">画图自动增强提示词</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-zinc-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
      case 'data':
          return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">数据控制</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-zinc-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-gray-700/50 transition-colors border-b border-zinc-200 dark:border-gray-700/50 text-left">
                            <div className="flex items-center gap-3">
                                <Download size={18} className="text-zinc-500 dark:text-gray-400"/>
                                <span className="text-sm text-zinc-800 dark:text-gray-200">导出所有对话记录</span>
                            </div>
                            <ChevronRight size={16} className="text-zinc-400 dark:text-gray-500"/>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left group">
                            <div className="flex items-center gap-3">
                                <Trash2 size={18} className="text-red-500 dark:text-red-400"/>
                                <span className="text-sm text-red-600 dark:text-red-300 group-hover:text-red-700 dark:group-hover:text-red-200">清除所有本地缓存</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
          );
       case 'about':
            return (
                <div className="flex flex-col items-center justify-center h-64 animate-in fade-in duration-300 space-y-4">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                        <SettingsIcon size={32} className="text-zinc-400 dark:text-gray-400"/>
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">XStudio Intelligence</h2>
                        <p className="text-sm text-zinc-500 dark:text-gray-500">版本 v0.9.3 (Beta)</p>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-gray-600 max-w-xs text-center">
                        专为中国大陆用户优化的 AI 网关服务。
                        <br/>
                        © 2024 XStudio. All rights reserved.
                    </div>
                </div>
            );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Window */}
      <div className="relative w-full max-w-4xl h-[80vh] bg-zinc-50 dark:bg-gray-900 border border-zinc-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header (User Profile & Close) */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-850 border-b border-zinc-200 dark:border-gray-800 p-6 flex items-start justify-between relative overflow-hidden transition-colors">
            {/* Decorative Background Glow (Only prominent in dark mode or subtle in light) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex items-center gap-5 relative z-10">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-zinc-700 dark:text-white text-xl font-bold border-2 border-white dark:border-gray-800 shadow-lg">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            user.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                </div>
                
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        {user.name}
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                            {user.plan}
                        </span>
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-gray-400 mt-0.5">ID: 8848-XSTUDIO-CN</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 dark:text-gray-500">
                        <span className="flex items-center gap-1"><CreditCard size={12}/> 订阅中</span>
                        <span className="flex items-center gap-1"><Shield size={12}/> 账户安全</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 hover:bg-zinc-100 rounded-full transition-colors relative z-10"
            >
                <X size={24} />
            </button>
        </div>

        {/* Body (Sidebar + Content) */}
        <div className="flex flex-1 overflow-hidden">
            
            {/* Settings Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-900 border-r border-zinc-200 dark:border-gray-800 p-4 flex flex-col gap-1 overflow-y-auto hidden md:flex transition-colors">
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-zinc-100 dark:bg-gray-800 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-gray-400 hover:bg-zinc-50 dark:hover:bg-gray-800/50 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                    <SettingsIcon size={18} />
                    通用设置
                </button>
                <button 
                    onClick={() => setActiveTab('account')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'account' ? 'bg-zinc-100 dark:bg-gray-800 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-gray-400 hover:bg-zinc-50 dark:hover:bg-gray-800/50 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                    <User size={18} />
                    账户管理
                </button>
                <button 
                    onClick={() => setActiveTab('model')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'model' ? 'bg-zinc-100 dark:bg-gray-800 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-gray-400 hover:bg-zinc-50 dark:hover:bg-gray-800/50 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                    <Database size={18} />
                    模型配置
                </button>
                <button 
                    onClick={() => setActiveTab('data')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'data' ? 'bg-zinc-100 dark:bg-gray-800 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-gray-400 hover:bg-zinc-50 dark:hover:bg-gray-800/50 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                    <Shield size={18} />
                    数据隐私
                </button>

                <div className="flex-1"></div>

                <button 
                    onClick={() => setActiveTab('about')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'about' ? 'bg-zinc-100 dark:bg-gray-800 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-gray-400 hover:bg-zinc-50 dark:hover:bg-gray-800/50 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                    <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">i</div>
                    关于我们
                </button>
                <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 transition-colors mt-2">
                    <LogOut size={18} />
                    退出登录
                </button>
            </div>

            {/* Mobile Tab Select (Visible only on small screens) */}
             <div className="md:hidden w-full absolute top-0 left-0 bg-zinc-50 dark:bg-gray-900 border-b border-zinc-200 dark:border-gray-800 z-20 flex overflow-x-auto p-2 gap-2 hide-scrollbar">
                {(['general', 'account', 'model', 'data', 'about'] as TabId[]).map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-gray-800 text-zinc-600 dark:text-gray-400'}`}
                     >
                        {tab === 'general' ? '通用' : tab === 'account' ? '账户' : tab === 'model' ? '模型' : tab === 'data' ? '数据' : '关于'}
                     </button>
                ))}
             </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-zinc-50 dark:bg-gray-950 p-6 md:p-8 overflow-y-auto transition-colors">
                <div className="max-w-2xl mx-auto md:mt-0 mt-10">
                    {renderContent()}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};