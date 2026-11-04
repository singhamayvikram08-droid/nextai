import React, { useState } from 'react';
import {
  X, Key, Sliders, Shield, Trash2, Download,
  CheckCircle2, Eye, EyeOff, Sparkles, Bot, BrainCircuit, ExternalLink
} from 'lucide-react';
import { type UserSettings, type PersonaType, PERSONA_PROMPTS } from '../../types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: Partial<UserSettings>) => void;
  onClearAllChats: () => void;
  onExportAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllChats,
  onExportAllChats,
}) => {
  const [activeTab, setActiveTab] = useState<'keys' | 'model' | 'data'>('keys');

  // Form states
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [openaiKey, setOpenaiKey] = useState(settings.openaiApiKey || '');
  const [anthropicKey, setAnthropicKey] = useState(settings.anthropicApiKey || '');
  const [temperature, setTemperature] = useState(settings.temperature ?? 0.7);
  const [persona, setPersona] = useState<PersonaType>(settings.persona || 'default');
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt || PERSONA_PROMPTS.default);

  // Visibility toggles
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePersonaChange = (newPersona: PersonaType) => {
    setPersona(newPersona);
    if (newPersona !== 'custom') {
      setSystemPrompt(PERSONA_PROMPTS[newPersona]);
    }
  };

  const handleSave = () => {
    onSaveSettings({
      geminiApiKey: geminiKey.trim(),
      openaiApiKey: openaiKey.trim(),
      anthropicApiKey: anthropicKey.trim(),
      temperature,
      persona,
      systemPrompt,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none font-sans">
      <div className="w-full max-w-xl rounded-3xl bg-[#090913] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-[#a200ff] flex items-center justify-center text-black">
              <Sliders className="w-4 h-4 fill-black" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Application Settings
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Multi-Model API Keys & Persona Customization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/5 bg-white/[0.02]">
          {[
            { id: 'keys', label: 'API Keys', icon: Key },
            { id: 'model', label: 'Persona & Parameters', icon: Sliders },
            { id: 'data', label: 'Data Management', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'keys' | 'model' | 'data')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  isActive
                    ? 'border-[#00f0ff] text-[#00f0ff] bg-white/5'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs text-gray-300">
          {activeTab === 'keys' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Zero-Trust Client Isolation</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                  Your keys are encrypted in your local browser memory (localStorage). They are never saved to any database.
                </p>
              </div>

              {/* Google Gemini */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />
                    <span>Google Gemini API Key</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#00f0ff] hover:underline flex items-center gap-1"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showGemini ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-white font-mono text-xs focus:border-[#00f0ff] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGemini(!showGemini)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* OpenAI */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-200 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                    <span>OpenAI API Key</span>
                  </label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#00f0ff] hover:underline flex items-center gap-1"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showOpenai ? 'text' : 'password'}
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-white font-mono text-xs focus:border-[#00f0ff] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenai(!showOpenai)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showOpenai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Anthropic */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-200 flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
                    <span>Anthropic Claude API Key</span>
                  </label>
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#00f0ff] hover:underline flex items-center gap-1"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showAnthropic ? 'text' : 'password'}
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-white font-mono text-xs focus:border-[#00f0ff] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnthropic(!showAnthropic)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showAnthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'model' && (
            <div className="space-y-4">
              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-200">Sampling Temperature: {temperature.toFixed(2)}</label>
                  <span className="text-[10px] font-mono text-gray-400">
                    {temperature < 0.3 ? 'Deterministic & Precise' : temperature > 0.8 ? 'Highly Creative' : 'Balanced'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#00f0ff] cursor-pointer"
                />
              </div>

              {/* Persona Selector */}
              <div className="space-y-2 pt-2">
                <label className="font-bold text-gray-200">Preset Assistant Persona</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['default', 'developer', 'architect', 'academic', 'creative', 'custom'] as PersonaType[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePersonaChange(p)}
                      className={`p-2 rounded-xl text-center capitalize font-bold text-xs transition-all cursor-pointer border ${
                        persona === p
                          ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-[#00f0ff]'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* System Prompt Textarea */}
              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-gray-200">Custom System Instructions</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => {
                    setSystemPrompt(e.target.value);
                    setPersona('custom');
                  }}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:border-[#00f0ff] outline-none font-mono"
                  placeholder="Define custom behavior, rules, and response formatting..."
                />
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                  Export Chat Archive
                </h4>
                <p className="text-gray-400 text-xs">
                  Download all local conversations, prompts, and session history as structured JSON.
                </p>
                <button
                  type="button"
                  onClick={onExportAllChats}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span>Download JSON Archive</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                <h4 className="font-bold text-rose-300 uppercase tracking-wider text-xs">
                  Danger Zone
                </h4>
                <p className="text-gray-400 text-xs">
                  Permanently delete all conversation sessions and reset client state. This action cannot be reversed.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete all chat history?')) {
                      onClearAllChats();
                      onClose();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Clear All Conversations</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#06060e] flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Settings Saved!</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 shadow-md shadow-[#00f0ff]/20 cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
