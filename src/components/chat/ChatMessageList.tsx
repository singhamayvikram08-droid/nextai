import React, { useEffect, useRef } from 'react';
import { Sparkles, Terminal, Atom, Layers, Brain, ArrowUpRight } from 'lucide-react';
import type { ChatMessage, AIModelOption } from '../../types/chat';
import ChatMessageItem from './ChatMessageItem';

interface ChatMessageListProps {
  messages: ChatMessage[];
  selectedModel: AIModelOption;
  onSelectPrompt: (prompt: string) => void;
  onRegenerate: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  theme?: 'dark' | 'light';
}

const STARTER_PROMPTS = [
  {
    icon: Terminal,
    title: 'Code Generation',
    desc: 'Write an asynchronous sliding-window token rate limiter in TypeScript',
    prompt: 'Write a production-grade, asynchronous sliding-window token rate limiter in TypeScript with benchmarked time complexity analysis.',
    color: '#00f0ff',
  },
  {
    icon: Atom,
    title: 'Physics & KaTeX Math',
    desc: 'Derive the relativistic kinetic energy formula with KaTeX math',
    prompt: 'Derive the relativistic kinetic energy formula from the Lorentz factor and Taylor series using KaTeX notation.',
    color: '#a200ff',
  },
  {
    icon: Layers,
    title: 'Cloud Architecture',
    desc: 'Design an event-driven edge AI architecture with sub-ms routing',
    prompt: 'Design a distributed, multi-region event-driven architecture for low-latency AI inference with sub-millisecond edge routing.',
    color: '#ff0055',
  },
  {
    icon: Brain,
    title: 'Deep Reasoning',
    desc: 'Explain transformer self-attention mechanisms mathematically',
    prompt: 'Explain the scaled dot-product self-attention mechanism in Transformers mathematically, including query, key, value matrix projections.',
    color: '#10b981',
  },
];

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  selectedModel,
  onSelectPrompt,
  onRegenerate,
  onEditMessage,
  theme = 'dark',
}) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const lastContent = messages[messages.length - 1]?.content;

  // Auto-scroll when messages update
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, lastContent]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto w-full select-none">
        {/* Welcome Hero */}
        <div className="space-y-4 mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#00f0ff] via-[#4285f4] to-[#a200ff] flex items-center justify-center text-white mx-auto shadow-2xl shadow-[#00f0ff]/20 animate-pulse">
            <Sparkles className="w-8 h-8 fill-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Where will your curiosity take you?
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Powered by <strong className="text-[#00f0ff]">{selectedModel.name}</strong> · Low-Latency Multi-Model Engine
            </p>
          </div>
        </div>

        {/* 4 Starter Prompts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
          {STARTER_PROMPTS.map((starter, i) => {
            const Icon = starter.icon;
            return (
              <button
                key={i}
                onClick={() => onSelectPrompt(starter.prompt)}
                className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-[#00f0ff]/40 transition-all cursor-pointer group flex flex-col justify-between space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" style={{ color: starter.color }} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200 group-hover:text-white uppercase tracking-wider">
                    {starter.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-snug mt-0.5 line-clamp-2">
                    {starter.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full selection:bg-[#00f0ff] selection:text-black">
      <div className="flex flex-col pb-4">
        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            theme={theme}
            onRegenerate={() => onRegenerate(message.id)}
            onEdit={(newContent) => onEditMessage(message.id, newContent)}
          />
        ))}
        <div ref={scrollEndRef} className="h-6 shrink-0" />
      </div>
    </div>
  );
};

export default ChatMessageList;
