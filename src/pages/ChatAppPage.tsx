import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePageSEO } from '../utils/usePageSEO';
import {
  type ChatSession, type ChatMessage, type AIModelOption,
  AVAILABLE_MODELS, type UserSettings
} from '../types/chat';
import {
  getStoredSessions, saveStoredSession, deleteStoredSession,
  togglePinStoredSession, renameStoredSession, clearAllStoredSessions,
  getStoredUserSettings, saveStoredUserSettings, exportSessionToMarkdown
} from '../services/chatStorage';
import { streamAIResponse } from '../services/aiService';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessageList from '../components/chat/ChatMessageList';
import ChatInput from '../components/chat/ChatInput';
import SettingsModal from '../components/chat/SettingsModal';

export const ChatAppPage: React.FC = () => {
  usePageSEO({
    title: 'NexGen AI Chat — Streaming Multi-Provider Studio',
    description: 'Production-grade AI Chat clone inspired by ChatGPT and Google Gemini with streaming responses and multi-provider API support.',
  });

  // App State
  const [sessions, setSessions] = useState<ChatSession[]>(getStoredSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const list = getStoredSessions();
    return list.length > 0 ? list[0].id : null;
  });
  const [settings, setSettings] = useState<UserSettings>(getStoredUserSettings);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const abortControllerRef = useRef<AbortController | null>(null);

  // Selected Model
  const selectedModel: AIModelOption =
    AVAILABLE_MODELS.find(m => m.id === settings.selectedModelId) || AVAILABLE_MODELS[0];

  // Active Session
  const activeSession: ChatSession | undefined = sessions.find(s => s.id === activeSessionId);

  // Sync session changes from storage events
  useEffect(() => {
    const handleStorageChange = (e: Event) => {
      const custom = e as CustomEvent<ChatSession[]>;
      if (custom.detail) {
        setSessions(custom.detail);
      }
    };
    window.addEventListener('nexgen-chat-sessions-changed', handleStorageChange);
    return () => window.removeEventListener('nexgen-chat-sessions-changed', handleStorageChange);
  }, []);

  // ── ACTION HANDLERS ──

  const createNewSession = useCallback((): ChatSession => {
    const newSession: ChatSession = {
      id: 'chat_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      modelId: selectedModel.id,
      systemPrompt: settings.systemPrompt,
    };
    saveStoredSession(newSession);
    setActiveSessionId(newSession.id);
    return newSession;
  }, [selectedModel.id, settings.systemPrompt]);

  const handleSelectSession = (id: string) => {
    if (isStreaming) {
      handleStopGeneration();
    }
    setActiveSessionId(id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSendMessage = async (userPrompt: string) => {
    if (!userPrompt.trim() || isStreaming) return;

    let targetSession = activeSession;
    if (!targetSession) {
      targetSession = createNewSession();
    }

    // Auto-generate title from first message
    const isFirstMessage = targetSession.messages.length === 0;
    const sessionTitle = isFirstMessage
      ? userPrompt.slice(0, 42) + (userPrompt.length > 42 ? '...' : '')
      : targetSession.title;

    const userMessage: ChatMessage = {
      id: 'msg_u_' + Date.now(),
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
    };

    const assistantMessageId = 'msg_a_' + Date.now();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      reasoning: '',
      timestamp: Date.now(),
      model: selectedModel.name,
      provider: selectedModel.provider,
      isStreaming: true,
    };

    const updatedMessages = [...targetSession.messages, userMessage, assistantMessage];
    const updatedSession: ChatSession = {
      ...targetSession,
      title: sessionTitle,
      messages: updatedMessages,
      modelId: selectedModel.id,
      updatedAt: Date.now(),
    };

    saveStoredSession(updatedSession);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await streamAIResponse({
        modelId: selectedModel.id,
        messages: updatedMessages.slice(0, -1),
        settings,
        onChunk: (contentChunk, reasoningChunk) => {
          setSessions(prevSessions =>
            prevSessions.map(s => {
              if (s.id !== updatedSession.id) return s;
              return {
                ...s,
                messages: s.messages.map(m => {
                  if (m.id !== assistantMessageId) return m;
                  return {
                    ...m,
                    content: m.content + (contentChunk || ''),
                    reasoning: (m.reasoning || '') + (reasoningChunk || ''),
                  };
                }),
              };
            })
          );
        },
        onComplete: (finalContent, finalReasoning) => {
          setIsStreaming(false);
          const finishedSession: ChatSession = {
            ...updatedSession,
            messages: updatedSession.messages.map(m => {
              if (m.id !== assistantMessageId) return m;
              return {
                ...m,
                content: finalContent,
                reasoning: finalReasoning || m.reasoning,
                isStreaming: false,
              };
            }),
            updatedAt: Date.now(),
          };
          saveStoredSession(finishedSession);
        },
        onError: (err) => {
          console.error('[ChatAppPage Error]', err);
          setIsStreaming(false);
          const errorSession: ChatSession = {
            ...updatedSession,
            messages: updatedSession.messages.map(m => {
              if (m.id !== assistantMessageId) return m;
              return {
                ...m,
                content: `⚠️ **Generation Error**: ${err}\n\nPlease check your API key in **Settings** or retry.`,
                isStreaming: false,
                error: true,
              };
            }),
            updatedAt: Date.now(),
          };
          saveStoredSession(errorSession);
        },
        abortSignal: abortController.signal,
      });
    } catch (err) {
      setIsStreaming(false);
      console.warn('[Stream Exception]', err);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    if (activeSession) {
      const fixed = {
        ...activeSession,
        messages: activeSession.messages.map(m => ({
          ...m,
          isStreaming: false,
        })),
      };
      saveStoredSession(fixed);
    }
  };

  const handleRegenerate = (messageId: string) => {
    if (!activeSession || isStreaming) return;
    const msgIndex = activeSession.messages.findIndex(m => m.id === messageId);
    if (msgIndex <= 0) return;

    const previousUserMsg = activeSession.messages[msgIndex - 1];
    if (previousUserMsg && previousUserMsg.role === 'user') {
      // Remove this assistant message and trigger again
      const pruned = activeSession.messages.slice(0, msgIndex - 1);
      const updated = { ...activeSession, messages: pruned };
      saveStoredSession(updated);
      handleSendMessage(previousUserMsg.content);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!activeSession || isStreaming) return;
    const msgIndex = activeSession.messages.findIndex(m => m.id === messageId);
    if (msgIndex < 0) return;

    // Remove all subsequent messages and re-send with updated content
    const pruned = activeSession.messages.slice(0, msgIndex);
    const updated = { ...activeSession, messages: pruned };
    saveStoredSession(updated);
    handleSendMessage(newContent);
  };

  const handleExportMarkdown = () => {
    if (!activeSession) return;
    const md = exportSessionToMarkdown(activeSession);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAllChats = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `nexgen_ai_chat_archive_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${theme === 'dark' ? 'bg-[#030308] text-white' : 'bg-white text-gray-900'} font-sans`}>
      {/* ── LEFT SIDEBAR ── */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={createNewSession}
        onDeleteSession={(id) => {
          deleteStoredSession(id);
          if (activeSessionId === id) {
            const remaining = sessions.filter(s => s.id !== id);
            setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
          }
        }}
        onTogglePin={togglePinStoredSession}
        onRenameSession={renameStoredSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
      />

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <ChatHeader
          selectedModel={selectedModel}
          onSelectModel={(model) => {
            saveStoredUserSettings({ selectedModelId: model.id });
            setSettings(prev => ({ ...prev, selectedModelId: model.id }));
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onExportMarkdown={handleExportMarkdown}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        />

        {/* Message Feed */}
        <ChatMessageList
          messages={activeSession ? activeSession.messages : []}
          selectedModel={selectedModel}
          onSelectPrompt={handleSendMessage}
          onRegenerate={handleRegenerate}
          onEditMessage={handleEditMessage}
          theme={theme}
        />

        {/* Floating Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isStreaming={isStreaming}
          placeholder={`Message ${selectedModel.name}... (Enter to send, Shift+Enter for new line)`}
        />
      </div>

      {/* ── SETTINGS MODAL ── */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          const updated = saveStoredUserSettings(newSettings);
          setSettings(updated);
        }}
        onClearAllChats={() => {
          clearAllStoredSessions();
          setActiveSessionId(null);
        }}
        onExportAllChats={handleExportAllChats}
      />
    </div>
  );
};

export default ChatAppPage;
