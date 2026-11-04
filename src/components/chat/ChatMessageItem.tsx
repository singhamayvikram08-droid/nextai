import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import {
  Sparkles, User, Copy, Check, RotateCw, Edit3,
  ChevronDown, ChevronRight, BrainCircuit, Bot
} from 'lucide-react';
import type { ChatMessage } from '../../types/chat';
import CodeBlock from './CodeBlock';

interface ChatMessageItemProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  theme?: 'dark' | 'light';
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRegenerate,
  onEdit,
  theme = 'dark',
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState(message.content);
  const [showReasoning, setShowReasoning] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleSaveEdit = () => {
    if (editPrompt.trim() && onEdit) {
      onEdit(editPrompt.trim());
      setIsEditing(false);
    }
  };

  // Avatar Icon based on provider / role
  const renderAvatar = () => {
    if (isUser) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
          <User className="w-4 h-4" />
        </div>
      );
    }

    if (message.provider === 'google') {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00f0ff] via-[#4285f4] to-[#a200ff] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#00f0ff]/20 animate-pulse">
          <Sparkles className="w-4 h-4 fill-white" />
        </div>
      );
    }

    if (message.provider === 'anthropic') {
      return (
        <div className="w-8 h-8 rounded-full bg-[#d97706] flex items-center justify-center text-white shrink-0 shadow-md">
          <BrainCircuit className="w-4 h-4" />
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
        <Bot className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div
      className={`group w-full py-5 px-4 md:px-8 transition-colors ${
        isUser
          ? theme === 'light' ? 'bg-transparent' : 'bg-transparent'
          : theme === 'light' ? 'bg-gray-50/70 border-y border-gray-200/50' : 'bg-white/[0.02] border-y border-white/[0.04]'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4 md:gap-6 items-start">
        {renderAvatar()}

        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                isUser ? 'text-gray-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a200ff]'
              }`}>
                {isUser ? 'You' : message.model || 'AI Assistant'}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Reasoning / Thinking Process Disclosure (Like ChatGPT o1 / Gemini Thought) */}
          {message.reasoning && (
            <div className="mb-3 rounded-xl border border-white/10 bg-black/40 overflow-hidden font-mono text-xs">
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="w-full px-3.5 py-2 flex items-center justify-between text-gray-400 hover:text-gray-200 bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-3.5 h-3.5 text-[#a200ff]" />
                  <span className="font-bold text-[11px] text-[#00f0ff] uppercase tracking-wider">
                    Thought Process & Reasoning
                  </span>
                </div>
                {showReasoning ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {showReasoning && (
                <div className="p-3.5 text-gray-400 text-[11px] leading-relaxed border-t border-white/5 whitespace-pre-wrap bg-black/20">
                  {message.reasoning}
                </div>
              )}
            </div>
          )}

          {/* Message Content / Editing Form */}
          {isEditing ? (
            <div className="space-y-3 pt-1">
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:border-[#00f0ff] outline-none min-h-[90px] resize-y"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1.5 rounded-lg bg-[#00f0ff] text-black font-bold text-xs uppercase tracking-wider hover:opacity-90"
                >
                  Save & Resubmit
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 font-medium text-xs hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-100 break-words font-sans">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code({ inline, className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeText = String(children).replace(/\n$/, '');
                    if (!inline && match) {
                      return <CodeBlock language={match[1]} value={codeText} />;
                    }
                    if (!inline && codeText.includes('\n')) {
                      return <CodeBlock language="text" value={codeText} />;
                    }
                    return (
                      <code className="px-1.5 py-0.5 rounded-md bg-white/10 font-mono text-[12px] text-[#00f0ff]" {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="my-4 overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-left text-xs border-collapse font-sans">{children}</table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return <th className="bg-white/10 px-4 py-2 font-bold uppercase tracking-wider text-gray-200 border-b border-white/10">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="px-4 py-2 border-b border-white/5 text-gray-300 font-mono text-xs">{children}</td>;
                  },
                  a({ href, children }) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#00f0ff] hover:underline font-bold">
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>

              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-[#00f0ff] animate-pulse rounded-sm align-middle" />
              )}
            </div>
          )}

          {/* Action Toolbar */}
          {!isEditing && (
            <div className="flex items-center gap-2 pt-2 text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                aria-label="Copy message text"
                title="Copy message"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {isUser && onEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit message"
                  title="Edit prompt"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}

              {!isUser && !message.isStreaming && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  aria-label="Regenerate response"
                  title="Regenerate response"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-sans">Retry</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;
