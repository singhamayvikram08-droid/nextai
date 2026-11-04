import React, { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { ArrowUp, Square, Sparkles, Paperclip, Mic } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  disabled = false,
  placeholder = 'Ask anything or paste code...',
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isStreaming) {
      onStopGeneration();
      return;
    }
    const clean = input.trim();
    if (clean && !disabled) {
      onSendMessage(clean);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 select-none">
      <div className="relative rounded-2xl bg-[#13131e] border border-white/10 hover:border-white/20 focus-within:border-[#00f0ff]/60 focus-within:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all shadow-xl">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent text-white placeholder-gray-500 text-sm px-4 pt-3.5 pb-12 outline-none resize-none min-h-[52px] max-h-[220px] font-sans selection:bg-[#00f0ff] selection:text-black"
        />

        {/* Bottom Toolbar inside input */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto text-gray-500">
            <button
              type="button"
              title="Attach context or code snippet (placeholder)"
              aria-label="Attach file"
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-gray-300 transition-colors cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Voice input (Web Speech API)"
              aria-label="Voice input"
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-gray-300 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-gray-500 pl-1">
              <Sparkles className="w-3 h-3 text-[#00f0ff]" />
              <span>Multi-Provider Active</span>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopGeneration}
                title="Stop Generating"
                aria-label="Stop Generating"
                className="w-8 h-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-rose-500/20 active:scale-95 animate-pulse"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim() || disabled}
                title="Send message (Enter)"
                aria-label="Send message"
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  input.trim() && !disabled
                    ? 'bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black shadow-md shadow-[#00f0ff]/30 active:scale-95 hover:opacity-90'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-400 mt-2 font-sans">
        AI models can make mistakes. Verify sensitive facts and code before deployment.
      </p>
    </div>
  );
};

export default ChatInput;
