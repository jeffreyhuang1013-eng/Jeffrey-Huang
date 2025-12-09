import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputArea } from './components/InputArea';
import { SettingsModal } from './components/SettingsModal';
import { MessageActions } from './components/MessageActions';
import { ChatSession, Message, Role, ModelId, UserProfile, Theme } from './types';
import { sendMessageStream } from './services/geminiService';
import { Menu, User, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Simple UUID generator fallback
const generateId = () => Math.random().toString(36).substring(2, 15);

const INITIAL_USER: UserProfile = {
  name: "访客",
  avatarUrl: "",
  plan: "Pro"
};

const WELCOME_MESSAGE = "你好！我是 XStudio Intelligence。我可以为您调用 Deepseek、通义千问、豆包和可灵 AI 等顶尖模型。请问有什么可以帮您？";

// --- Markdown Rendering Component ---
const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      className="prose prose-sm md:prose-base dark:prose-invert max-w-none break-words leading-7"
      components={{
        // Custom link rendering to open in new tab
        a: ({ node, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline decoration-blue-600/30 hover:decoration-blue-600" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// --- Streaming Message Component (Typewriter Effect + Markdown) ---
const StreamingMessage = ({ content, isStreaming }: { content: string, isStreaming?: boolean }) => {
  const [displayed, setDisplayed] = useState(isStreaming ? '' : content);

  useEffect(() => {
    // If not streaming and we have matched content (e.g. initial load of old chat), do nothing.
    if (!isStreaming && displayed === content) {
       return;
    }

    let animationFrameId: number;
    let lastTime = 0;
    const interval = 15; // Base typing speed (ms)

    const animate = (time: number) => {
      if (time - lastTime >= interval) {
        setDisplayed(prev => {
          if (prev === content) return prev;
          
          if (prev.length < content.length) {
            // Adaptive typing speed: 
            // If the buffer (backlog) is large, type faster to catch up.
            const backlog = content.length - prev.length;
            const charsToAdd = backlog > 100 ? 5 : (backlog > 30 ? 2 : 1);
            
            return content.slice(0, prev.length + charsToAdd);
          }
          // If prev is somehow longer than content (rare), snap to content
          return content;
        });
        lastTime = time;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [content, isStreaming]); // Re-run effect when content updates to adjust target

  // Show cursor if network is streaming OR if animation is still catching up
  const showCursor = isStreaming || displayed.length < content.length;

  return (
    <div className="relative">
      <MarkdownContent content={displayed} />
      {showCursor && (
        <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-zinc-900 dark:bg-zinc-100 animate-pulse rounded-[1px] opacity-80" />
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Theme state: Default to 'light'
  const [theme, setTheme] = useState<Theme>('light');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a chat
  useEffect(() => {
    const newChat: ChatSession = {
      id: generateId(),
      title: '新对话',
      messages: [{
        id: generateId(),
        role: Role.MODEL,
        content: WELCOME_MESSAGE,
        timestamp: Date.now(),
        usedModel: '系统'
      }],
      updatedAt: Date.now()
    };
    setChats([newChat]);
    setCurrentChatId(newChat.id);
  }, []);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, currentChatId]);

  const getCurrentChat = () => chats.find(c => c.id === currentChatId);

  const handleNewChat = () => {
    const newChat: ChatSession = {
      id: generateId(),
      title: '新对话',
      messages: [{
        id: generateId(),
        role: Role.MODEL,
        content: WELCOME_MESSAGE,
        timestamp: Date.now(),
        usedModel: '系统'
      }],
      updatedAt: Date.now()
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newChats = chats.filter(c => c.id !== id);
    setChats(newChats);
    if (currentChatId === id && newChats.length > 0) {
      setCurrentChatId(newChats[0].id);
    } else if (newChats.length === 0) {
        handleNewChat();
    }
  };

  const updateCurrentChatMessages = (messages: Message[]) => {
    if (!currentChatId) return;
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages, updatedAt: Date.now() } 
        : chat
    ));
  };

  // --- Message Actions Handlers ---

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleShareMessage = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'XStudio Intelligence 回复',
        text: text,
      }).catch(console.error);
    } else {
      handleCopyMessage(text);
      alert('内容已复制到剪贴板，请手动分享。');
    }
  };

  const handleRegenerate = async (aiMessageId: string, specificModel?: ModelId) => {
      if (isLoading || !currentChatId) return;

      const chat = getCurrentChat();
      if (!chat) return;

      const msgIndex = chat.messages.findIndex(m => m.id === aiMessageId);
      if (msgIndex === -1) return;

      // Find the prompt (User message) immediately preceding this AI message
      // Note: This logic assumes alternating User/Model, or Model follows User.
      // If index is 0, it's a greeting message, usually we don't regenerate greeting unless we restart.
      // But for simplicity, we only regenerate if there is a preceding user message.
      if (msgIndex === 0) return; 

      const userMsg = chat.messages[msgIndex - 1];
      if (userMsg.role !== Role.USER) return;

      // 1. Clear the AI message content to show it's regenerating
      // We keep the same ID to replace it in place.
      const updatedMessages = [...chat.messages];
      updatedMessages[msgIndex] = {
          ...updatedMessages[msgIndex],
          content: '',
          isStreaming: true,
          usedModel: undefined // Will be set after generation
      };
      
      updateCurrentChatMessages(updatedMessages);
      setIsLoading(true);

      // 2. Call Service with the original user prompt and attachments
      // Use specificModel if provided (Switch Model), otherwise allow Gateway (ModelId.GATEWAY_AUTO) 
      // or we could track the original model. For "Regenerate", usually we want to try again, 
      // maybe the user wants a different result or specific model. 
      // Let's default to GATEWAY_AUTO if not specified, essentially "Thinking again".
      const targetModel = specificModel || ModelId.GATEWAY_AUTO;

      try {
        const usedModelName = await sendMessageStream(
            userMsg.content, 
            targetModel, 
            userMsg.attachments, 
            (streamedText) => {
                setChats(currentChats => {
                    return currentChats.map(c => {
                        if (c.id === currentChatId) {
                            const msgs = [...c.messages];
                            const idx = msgs.findIndex(m => m.id === aiMessageId);
                            if (idx !== -1) {
                                msgs[idx] = { ...msgs[idx], content: streamedText };
                            }
                            return { ...c, messages: msgs };
                        }
                        return c;
                    });
                });
            }
        );

        // 3. Finalize
        setChats(currentChats => {
            return currentChats.map(c => {
                if (c.id === currentChatId) {
                    const msgs = [...c.messages];
                    const idx = msgs.findIndex(m => m.id === aiMessageId);
                    if (idx !== -1) {
                        msgs[idx] = { 
                            ...msgs[idx], 
                            isStreaming: false, 
                            usedModel: usedModelName 
                        };
                    }
                    return { ...c, messages: msgs };
                }
                return c;
            });
        });
      } catch (error) {
        setChats(currentChats => {
            return currentChats.map(c => {
                if (c.id === currentChatId) {
                    const msgs = [...c.messages];
                    const idx = msgs.findIndex(m => m.id === aiMessageId);
                    if (idx !== -1) {
                        msgs[idx] = { 
                            ...msgs[idx], 
                            content: "生成失败，请稍后重试。", 
                            isStreaming: false 
                        };
                    }
                    return { ...c, messages: msgs };
                }
                return c;
            });
        });
      } finally {
        setIsLoading(false);
      }
  };

  // --- End Message Actions ---

  const handleSendMessage = async (text: string, modelId: ModelId, attachments: string[]) => {
    if (!currentChatId) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: generateId(),
      role: Role.USER,
      content: text,
      timestamp: Date.now(),
      attachments: attachments
    };

    const currentChat = getCurrentChat();
    const prevMessages = currentChat ? currentChat.messages : [];
    
    // Optimistic Update
    const updatedMessages = [...prevMessages, userMsg];
    
    // Add Placeholder AI Message
    const aiMsgId = generateId();
    const aiPlaceholderMsg: Message = {
      id: aiMsgId,
      role: Role.MODEL,
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };
    
    updateCurrentChatMessages([...updatedMessages, aiPlaceholderMsg]);
    setIsLoading(true);

    // Update Title if it's the first user message (technically 2nd because of welcome msg)
    // or if the chat has only the system message
    if (prevMessages.length <= 1) {
       const title = text.slice(0, 30) || (attachments.length > 0 ? '[图片]' : '新对话');
       setChats(prev => prev.map(c => c.id === currentChatId ? {...c, title} : c));
    }

    try {
      // 2. Call Service
      const usedModelName = await sendMessageStream(text, modelId, attachments, (streamedText) => {
        setChats(currentChats => {
          return currentChats.map(chat => {
            if (chat.id === currentChatId) {
              const msgs = [...chat.messages];
              const lastMsgIndex = msgs.findIndex(m => m.id === aiMsgId);
              if (lastMsgIndex !== -1) {
                msgs[lastMsgIndex] = {
                  ...msgs[lastMsgIndex],
                  content: streamedText
                };
              }
              return { ...chat, messages: msgs };
            }
            return chat;
          });
        });
      });

      // 3. Finalize
      setChats(currentChats => {
        return currentChats.map(chat => {
          if (chat.id === currentChatId) {
            const msgs = [...chat.messages];
            const lastMsgIndex = msgs.findIndex(m => m.id === aiMsgId);
            if (lastMsgIndex !== -1) {
              msgs[lastMsgIndex] = {
                ...msgs[lastMsgIndex],
                isStreaming: false,
                usedModel: usedModelName // Store which model the gateway actually picked
              };
            }
            return { ...chat, messages: msgs };
          }
          return chat;
        });
      });

    } catch (error) {
      // Error State
      setChats(currentChats => {
        return currentChats.map(chat => {
          if (chat.id === currentChatId) {
             const msgs = [...chat.messages];
             const lastMsgIndex = msgs.findIndex(m => m.id === aiMsgId);
             if (lastMsgIndex !== -1) {
                 msgs[lastMsgIndex] = {
                     ...msgs[lastMsgIndex],
                     content: "错误: 无法连接至 XStudio 网关。",
                     isStreaming: false
                 };
             }
             return { ...chat, messages: msgs };
          }
          return chat;
        });
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentChatMessages = getCurrentChat()?.messages || [];

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} h-screen w-full`}>
      <div className="flex h-full bg-base-light dark:bg-base-dark text-zinc-900 dark:text-gray-100 font-sans transition-colors duration-300">
        
        {/* Settings Modal */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          user={INITIAL_USER}
          theme={theme}
          onThemeChange={setTheme}
        />

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar 
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={(id) => { setCurrentChatId(id); setIsSidebarOpen(false); }}
          onNewChat={handleNewChat}
          onDeleteChat={deleteChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isOpen={isSidebarOpen}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full w-full relative bg-base-light dark:bg-base-dark transition-colors duration-300">
          
          {/* Top Header */}
          <header className="h-14 border-b border-divider-light dark:border-divider-dark flex items-center justify-between px-4 bg-sidebar-light/80 dark:bg-sidebar-dark/80 backdrop-blur-md z-20 sticky top-0 transition-colors">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-200/50 dark:hover:bg-[#2c2c2e]"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-gray-100">
                 <span className="tracking-tight">XStudio Intelligence</span>
                 <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800/30">中国大陆专线</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div 
                  className="flex items-center gap-3 px-2 py-1 hover:bg-zinc-200/50 dark:hover:bg-[#2c2c2e] rounded-lg cursor-pointer transition-colors group"
                  onClick={() => setIsSettingsOpen(true)}
               >
                   <div className="text-right hidden sm:block">
                       <div className="text-sm font-medium text-zinc-800 dark:text-gray-100 group-hover:text-black dark:group-hover:text-white transition-colors">{INITIAL_USER.name}</div>
                       <div className="text-xs text-green-600 dark:text-green-400 font-medium">{INITIAL_USER.plan}</div>
                   </div>
                   <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white dark:ring-gray-800">
                       CN
                   </div>
               </div>
            </div>
          </header>

          {/* Chat Area */}
          <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth bg-base-light dark:bg-base-dark">
            <div className="max-w-3xl mx-auto space-y-8">
              {currentChatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-[60vh] opacity-100 animate-in fade-in duration-700">
                      <div className="w-20 h-20 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-[#1c1c1e] dark:to-[#2c2c2e] rounded-3xl flex items-center justify-center mb-6 text-zinc-400 dark:text-gray-500 shadow-inner">
                          <Cpu size={40}/>
                      </div>
                      <h2 className="text-lg font-medium text-zinc-700 dark:text-gray-200 mb-2">欢迎回来，{INITIAL_USER.name}</h2>
                      <p className="text-zinc-500 dark:text-gray-500 text-sm">开始一段新的对话，探索国产 AI 的力量。</p>
                  </div>
              )}
              
              {currentChatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-4 group ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`
                      w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm border border-black/5 dark:border-white/10
                      ${msg.role === Role.USER ? 'bg-zinc-100 dark:bg-[#2c2c2e] text-zinc-600 dark:text-gray-200' : 'bg-gradient-to-tr from-blue-600 to-blue-500 text-white'}
                  `}>
                      {msg.role === Role.USER ? <User size={18}/> : <Cpu size={18}/>}
                  </div>

                  {/* Content */}
                  <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
                      <div className={`flex items-center gap-2 ${msg.role === Role.USER ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xs font-bold text-zinc-500 dark:text-gray-400">
                              {msg.role === Role.USER ? '你' : 'XStudio'}
                          </span>
                          {msg.role === Role.MODEL && msg.usedModel && (
                              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-[#1c1c1e] text-zinc-600 dark:text-gray-500 border border-zinc-200 dark:border-gray-800">
                                  {msg.usedModel}
                              </span>
                          )}
                      </div>
                      <div className={`
                          ${msg.role === Role.USER ? 'text-zinc-800 dark:text-gray-100' : 'text-zinc-700 dark:text-gray-300'}
                      `}>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className={`flex flex-wrap gap-2 mb-2 ${msg.role === Role.USER ? 'justify-end' : ''}`}>
                                {msg.attachments.map((src, idx) => (
                                    <img 
                                        key={idx} 
                                        src={src} 
                                        alt="attachment" 
                                        className="max-w-[240px] max-h-[240px] rounded-lg border border-zinc-200 dark:border-zinc-700 object-cover"
                                    />
                                ))}
                            </div>
                          )}
                          
                          {msg.role === Role.MODEL ? (
                              <>
                                <StreamingMessage content={msg.content} isStreaming={msg.isStreaming} />
                                {!msg.isStreaming && msg.usedModel !== '系统' && (
                                    <>
                                        <MessageActions 
                                            content={msg.content}
                                            onCopy={() => handleCopyMessage(msg.content)}
                                            onRegenerate={(model) => handleRegenerate(msg.id, model)}
                                            onShare={() => handleShareMessage(msg.content)}
                                            currentModel={msg.usedModel}
                                        />
                                        <div className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-1.5 ml-0.5 select-none font-medium">
                                            {new Date(msg.timestamp).getHours().toString().padStart(2, '0')}:{new Date(msg.timestamp).getMinutes().toString().padStart(2, '0')}
                                        </div>
                                    </>
                                )}
                              </>
                          ) : (
                              <div className="flex flex-col items-end">
                                 <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm">
                                    <MarkdownContent content={msg.content} />
                                 </div>
                              </div>
                          )}
                      </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </main>

          {/* Input Area */}
          <div className="bg-base-light dark:bg-base-dark border-t border-transparent md:border-t-0 z-10 sticky bottom-0 p-4">
              <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;