import React from 'react';
import { Message } from '../types';
import { User, Bot, Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Basic function to render text with code block support
  // In a real app, use react-markdown or similar
  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const content = part.replace(/```[a-z]*\n?/, '').replace(/```$/, '');
        const language = part.match(/```([a-z]*)/)?.[1] || 'text';
        
        return (
          <CodeBlock key={index} code={content} language={language} />
        );
      }
      // Simple bold/italic parsing could go here, but for now we just handle newlines
      return <span key={index} className="whitespace-pre-wrap leading-relaxed">{part}</span>;
    });
  };

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-slate-700 border border-slate-600' 
          : 'bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
      }`}>
        {isUser ? <User size={18} className="text-slate-300" /> : <Bot size={18} className="text-purple-400" />}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'items-end flex flex-col' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold ${isUser ? 'text-slate-400' : 'text-purple-400'}`}>
            {isUser ? 'VOCÊ' : 'NEON X HUB'}
          </span>
          <span className="text-[10px] text-slate-600 font-mono">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className={`rounded-2xl p-4 ${
          isUser 
            ? 'bg-slate-800 text-slate-100 rounded-tr-none' 
            : 'bg-slate-900/60 border border-slate-800/60 text-slate-200 rounded-tl-none shadow-sm'
        } ${message.isError ? 'border-red-500/50 bg-red-900/10' : ''}`}>
          <div className="text-sm md:text-base">
            {renderContent(message.text)}
          </div>
        </div>
      </div>
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-slate-700 bg-[#0d1117] shadow-lg group">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400 lowercase">{language || 'code'}</span>
        <button 
          onClick={handleCopy}
          className="text-slate-400 hover:text-white transition-colors"
          title="Copiar código"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-xs md:text-sm text-blue-100/90 whitespace-pre">
          {/* Simple syntax coloring simulation since we don't have prismjs */}
          <code dangerouslySetInnerHTML={{ 
            __html: code
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/\b(local|function|end|if|then|else|elseif|return|while|do|for|in|nil|true|false)\b/g, '<span class="text-purple-400 font-semibold">$1</span>')
              .replace(/\b(game|workspace|script|Instance|Vector3|CFrame|Color3|UDim2|wait|task|print|warn)\b/g, '<span class="text-blue-400">$1</span>')
              .replace(/("[^"]*")/g, '<span class="text-green-400">$1</span>')
              .replace(/(--.*)/g, '<span class="text-slate-500 italic">$1</span>')
          }} />
        </pre>
      </div>
    </div>
  );
};

export default MessageBubble;