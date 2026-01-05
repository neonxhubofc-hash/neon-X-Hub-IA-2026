import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Cpu, Shield, Sparkles, StopCircle } from 'lucide-react';
import { Message, ModelStatus } from '../types';
import { streamGeminiResponse } from '../services/geminiService';
import MessageBubble from './MessageBubble';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Saudações. Eu sou a **Neon X Hub IA 2026**. ⚡\n\nDesenvolvida por **Ressel** com o poder do **Poderoso Hub**, estou pronta para elevar o nível do seu desenvolvimento em Lua/Luau.\n\nEnvie seu script para análise, peça uma otimização ou questione sobre a arquitetura do Roblox. Estou online e aguardando comandos. 🚀",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ModelStatus>(ModelStatus.IDLE);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || (status !== ModelStatus.IDLE && status !== ModelStatus.ERROR)) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStatus(ModelStatus.THINKING);

    // Create placeholder for AI response
    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg: Message = {
      id: aiMsgId,
      role: 'model',
      text: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, initialAiMsg]);

    try {
      await streamGeminiResponse(newMessages, (currentText) => {
        setStatus(ModelStatus.STREAMING);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId ? { ...msg, text: currentText } : msg
          )
        );
      });
      setStatus(ModelStatus.IDLE);
    } catch (error) {
      console.error(error);
      setStatus(ModelStatus.ERROR);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? { ...msg, text: "⚠️ Erro de conexão com o núcleo neural. Verifique sua API Key ou tente novamente.", isError: true }
            : msg
        )
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center neon-border">
              <Terminal size={20} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              NEON X HUB <span className="text-purple-400">IA 2026</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">by Ressel <Cpu size={10} /></span>
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              <span className="flex items-center gap-1 text-purple-300">Poderoso Hub <Shield size={10} /></span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-500">
          <span>v2.0.26-Alpha</span>
          <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">LUA EXPERT</span>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 z-10 scroll-smooth">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {status === ModelStatus.THINKING && (
            <div className="flex items-center gap-2 text-purple-400 text-sm animate-pulse ml-4">
              <Sparkles size={16} />
              <span>Analisando lógica...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md z-20">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cole seu script Lua, peça uma otimização ou pergunte sobre exploits..."
            className="w-full bg-slate-950/80 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700 p-4 pr-14 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm resize-none shadow-lg min-h-[56px] max-h-[200px]"
            disabled={status === ModelStatus.THINKING || status === ModelStatus.STREAMING}
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && status === ModelStatus.IDLE) || status === ModelStatus.THINKING}
            className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all duration-300 ${
              input.trim() || status === ModelStatus.STREAMING
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {status === ModelStatus.STREAMING ? (
               <StopCircle size={20} className="animate-spin-slow" />
            ) : (
               <Send size={20} />
            )}
          </button>
        </div>
        <div className="text-center mt-2 text-[10px] text-slate-600 font-mono">
          NEON X HUB SYSTEMS // POWERED BY GEMINI 3 PRO // SECURE CONNECTION
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;