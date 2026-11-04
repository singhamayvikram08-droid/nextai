import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown, Settings, Download, Sun, Moon,
  PanelLeft, Sparkles, Check, Bot, BrainCircuit
} from 'lucide-react';
import { type AIModelOption, AVAILABLE_MODELS } from '../../types/chat';

interface ChatHeaderProps {
  selectedModel: AIModelOption;
  onSelectModel: (model: AIModelOption) => void;
  onOpenSettings: () => void;
  onExportMarkdown: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedModel,
  onSelectModel,
  onOpenSettings,
  onExportMarkdown,
  isSidebarOpen,
  onToggleSidebar,
  theme,
  onToggleTheme,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProviderIcon = (provider: string) => {
    if (provider === 'google') return <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />;
    if (provider === 'anthropic') return <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />;
    return <Bot className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <header className="h-14 sm:h-16 px-4 md:px-6 border-b border-white/10 bg-[#06060c]/80 backdrop-blur-xl flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Sidebar Toggle + Model Selector */}
      <div className="flex items-center gap-2 sm:gap-3">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            title="Open history sidebar"
            aria-label="Open sidebar"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Model Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all cursor-pointer group shadow-sm"
          >
            {getProviderIcon(selectedModel.provider)}
            <span>{selectedModel.name}</span>
            {selectedModel.badge && (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/10 text-[#00f0ff]">
                {selectedModel.badge}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0c0c16] border border-white/15 p-2 shadow-2xl shadow-black/80 z-50 space-y-1">
              <div className="px-3 py-1.5 text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400 border-b border-white/5">
                Select Model Provider & Architecture
              </div>

              {AVAILABLE_MODELS.map((model) => {
                const isSelected = model.id === selectedModel.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelectModel(model);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#00f0ff]/15 to-[#a200ff]/15 border border-[#00f0ff]/30 text-white'
                        : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        {getProviderIcon(model.provider)}
                        <span>{model.name}</span>
                        {model.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-[#00f0ff]">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 leading-snug line-clamp-1">
                        {model.description}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#00f0ff] shrink-0 mt-0.5" />}
                  </button>
                );
              })}

              <div className="pt-2 border-t border-white/5 px-2 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                <span>Custom keys in Settings</span>
                <button
                  onClick={() => {
                    setModelDropdownOpen(false);
                    onOpenSettings();
                  }}
                  className="text-[#00f0ff] hover:underline font-bold"
                >
                  Configure →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Toolbar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Export Markdown */}
        <button
          onClick={onExportMarkdown}
          title="Export chat as Markdown"
          aria-label="Export chat as Markdown"
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title="Open settings"
          aria-label="Settings"
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-[#a200ff]" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
