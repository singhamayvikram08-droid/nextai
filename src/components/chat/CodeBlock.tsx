import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'text', value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#0d0d15] text-gray-200 shadow-xl font-mono text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 select-none">
        <div className="flex items-center gap-2 text-gray-400">
          <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span className="uppercase tracking-wider font-bold text-[11px] text-gray-300">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer text-[11px] font-sans font-medium"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto selection:bg-[#00f0ff] selection:text-black">
        <pre className="leading-relaxed">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
