import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Cpu, Zap, Brain, Palette, Check, AlertCircle, X, Loader2 } from 'lucide-react';
import { ModelId } from '../types';
import { DEEPSEEK_ICON, QWEN_ICON, DOUBAO_ICON, KLING_ICON } from '../assets/icons';

interface InputAreaProps {
  onSendMessage: (text: string, model: ModelId, attachments: string[]) => void;
  isLoading: boolean;
}

// Helper component to handle icon rendering and error fallback
const ModelIcon = ({ info }: { info: any }) => {
  const [error, setError] = useState(false);

  // Reset error state if the image source changes (e.g. model switch)
  useEffect(() => {
    setError(false);
  }, [info.imageSrc]);

  if (info.imageSrc && !error) {
    return (
      <img 
        src={info.imageSrc} 
        alt={info.label} 
        className="w-5 h-5 object-contain rounded-sm" 
        onError={() => setError(true)} 
      />
    );
  }
  
  return info.fallback || info.icon;
};

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelId>(ModelId.GATEWAY_AUTO);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if ((input.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(input, selectedModel, attachments);
      setInput('');
      setAttachments([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Attachment Handling ---
  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('目前仅支持上传图片格式');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachments(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
      
      // Reset input so the same file can be selected again
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // --- Voice Input (Web Speech API) ---
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("您的浏览器不支持语音输入功能。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + ' ' : '') + transcript);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const getModelInfo = (id: ModelId) => {
    switch(id) {
      case ModelId.GATEWAY_AUTO: 
        return { 
          label: '智能路由', 
          icon: <Cpu size={20} className="text-green-600 dark:text-green-500" />, 
          desc: '自动分析您的意图，为您路由至最适合的国产模型。' 
        };
      case ModelId.DEEPSEEK_V3: 
        return { 
          label: 'Deepseek', 
          imageSrc: DEEPSEEK_ICON, 
          fallback: <Brain size={20} className="text-purple-500"/>, 
          desc: '擅长复杂代码编写、数学计算和硬核逻辑推理任务。' 
        };
      case ModelId.QWEN_MAX: 
        return { 
          label: '通义千问', 
          imageSrc: QWEN_ICON, 
          fallback: <Zap size={20} className="text-yellow-500"/>, 
          desc: '具备深度思考链 (CoT)，适合复杂规划和深度分析。' 
        };
      case ModelId.DOUBAO_PRO: 
        return { 
          label: '豆包', 
          imageSrc: DOUBAO_ICON, 
          fallback: <Zap size={20} className="text-blue-500"/>, 
          desc: '响应迅速，语气亲切，非常适合日常闲聊和生活助手。' 
        };
      case ModelId.KLING_AI: 
        return { 
          label: '可灵 AI', 
          imageSrc: KLING_ICON, 
          fallback: <Palette size={20} className="text-pink-500"/>, 
          desc: '强大的视觉创意引擎，用于图像生成和艺术创作。' 
        };
    }
  };

  const currentModelDisplay = getModelInfo(selectedModel);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Remove overflow-hidden here to allow dropdown to extend outside */}
      <div className="relative flex flex-col bg-white dark:bg-[#1c1c1e] rounded-[24px] border border-zinc-200 dark:border-[#3a3a3c] shadow-xl dark:shadow-2xl dark:shadow-black/50 transition-colors">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 pt-3">
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setShowModelMenu(!showModelMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-[#2c2c2e] hover:bg-zinc-100 dark:hover:bg-[#3a3a3c] text-zinc-700 dark:text-gray-200 text-xs font-semibold transition-colors border border-zinc-200/50 dark:border-transparent"
                >
                    <ModelIcon info={currentModelDisplay} />
                    <span>{currentModelDisplay.label}</span>
                </button>

                {showModelMenu && (
                    <div className="absolute bottom-full left-0 mb-3 w-72 bg-white dark:bg-[#252527] border border-zinc-200 dark:border-[#3a3a3c] rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 py-3 text-[10px] font-bold text-zinc-400 dark:text-gray-500 bg-zinc-50 dark:bg-[#2c2c2e]/50 uppercase tracking-wider border-b border-zinc-100 dark:border-[#3a3a3c] rounded-t-2xl">
                            XStudio 模型矩阵
                        </div>
                        <div className="p-1 space-y-0.5">
                            {Object.values(ModelId).map((id) => {
                                const info = getModelInfo(id);
                                const isSelected = selectedModel === id;
                                return (
                                    <div key={id} className="relative group">
                                        <button
                                            onClick={() => { setSelectedModel(id); setShowModelMenu(false); }}
                                            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${isSelected ? 'bg-zinc-100 dark:bg-[#3a3a3c]' : 'hover:bg-zinc-50 dark:hover:bg-[#2c2c2e]'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 flex items-center justify-center">
                                                     <ModelIcon info={info} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-gray-300'}`}>{info.label}</span>
                                                </div>
                                            </div>
                                            
                                            {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                                        </button>
                                        
                                        {/* Tooltip */}
                                        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <div className="relative group/tooltip">
                                                <AlertCircle size={14} className="text-zinc-300 dark:text-gray-600 hover:text-zinc-500 dark:hover:text-gray-400" />
                                                <div className="absolute right-0 bottom-full mb-2 w-56 p-3 bg-zinc-900 dark:bg-black border border-zinc-800 dark:border-zinc-800 rounded-xl text-xs text-white shadow-2xl pointer-events-none hidden group-hover/tooltip:block z-50">
                                                    {info.desc}
                                                </div>
                                             </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="px-4 pt-2 flex flex-wrap gap-2">
            {attachments.map((src, index) => (
              <div key={index} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                <img src={src} alt="attachment" className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeAttachment(index)}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Field */}
        <div className="px-4 py-3">
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "正在听..." : `有问题尽管问 ${currentModelDisplay.label}...`}
                className="w-full bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 text-[16px] leading-relaxed resize-none focus:outline-none max-h-48 overflow-y-auto"
                rows={1}
            />
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center px-2 pb-2 pl-3">
             <div className="flex gap-1">
                 <button 
                    onClick={handlePaperclipClick}
                    className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#2c2c2e] transition-colors relative" 
                    title="添加图片"
                 >
                    <Paperclip size={20} />
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                 </button>
                 <button 
                    onClick={toggleListening}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                        isListening 
                        ? 'text-red-500 bg-red-100 dark:bg-red-900/20 animate-pulse' 
                        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#2c2c2e]'
                    }`}
                    title="语音输入"
                 >
                    {isListening ? <Loader2 size={20} className="animate-spin" /> : <Mic size={20} />}
                 </button>
            </div>
            
            <button 
                onClick={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
                    (input.trim() || attachments.length > 0) && !isLoading 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md' 
                    : 'bg-zinc-100 dark:bg-[#3a3a3c] text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                }`}
            >
                <Send size={18} />
            </button>
        </div>
      </div>
      
      <div className="text-center mt-3">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600">XStudio 可能会产生不准确的信息，请以官方数据为准。</p>
      </div>
    </div>
  );
};