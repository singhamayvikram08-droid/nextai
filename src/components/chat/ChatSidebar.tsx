import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, MessageSquare, Pin, Trash2, Edit2, Check, X,
  Search, Settings, PanelLeftClose, Layers, Sparkles, ChevronRight
} from 'lucide-react';
import type { ChatSession } from '../../types/chat';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  theme?: 'dark' | 'light';
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onTogglePin,
  onRenameSession,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter(s => s.isPinned);
  const recentSessions = filteredSessions.filter(s => !s.isPinned);

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 bg-[#080811] border-r border-white/10 transition-transform duration-300 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        {/* Top Header: Brand + New Chat */}
        <div className="p-3 space-y-2 border-b border-white/5">
          <div className="flex items-center justify-between px-1">
            <Link to="/" className="flex items-center gap-2 group" title="Return to NexGen AI Home">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#00f0ff] to-[#a200ff] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-black fill-black" />
              </div>
              <span className="font-black text-sm tracking-wide uppercase text-white">
                Nex<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a200ff]">Gen AI</span>
              </span>
            </Link>

            <button
              onClick={onToggle}
              title="Close sidebar"
              aria-label="Close sidebar"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Primary Button */}
          <button
            onClick={onNewChat}
            className="w-full py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer shadow-sm group hover:border-[#00f0ff]/40"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00f0ff] group-hover:scale-110 transition-transform" />
              <span>New Conversation</span>
            </div>
            <span className="text-[10px] font-mono text-gray-500">⌘K</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#00f0ff]/40 transition-colors"
            />
          </div>
        </div>

        {/* Scrollable Session List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 font-sans text-xs">
          {/* Pinned Chats */}
          {pinnedSessions.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] uppercase font-mono font-bold tracking-wider text-[#00f0ff] flex items-center gap-1.5">
                <Pin className="w-3 h-3 fill-[#00f0ff]" />
                <span>Pinned</span>
              </div>
              {pinnedSessions.map((session) => renderSessionRow(session))}
            </div>
          )}

          {/* Recent Chats */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400">
              Recent Conversations
            </div>
            {recentSessions.length === 0 && pinnedSessions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-xs">
                No conversations found.
              </div>
            ) : (
              recentSessions.map((session) => renderSessionRow(session))
            )}
          </div>
        </div>

        {/* Bottom Bar: Settings & Return to Main Platform */}
        <div className="p-3 border-t border-white/10 space-y-1.5 bg-[#05050c]">
          <button
            onClick={onOpenSettings}
            className="w-full py-2 px-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white flex items-center justify-between text-xs font-medium transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#a200ff]" />
              <span>Settings & API Keys</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </button>

          <Link
            to="/dashboard"
            className="w-full py-2 px-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-[#00f0ff] flex items-center justify-between text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00f0ff]" />
              <span>Workspace Dashboard</span>
            </div>
            <span className="text-[10px] font-mono">→</span>
          </Link>
        </div>
      </aside>
    </>
  );

  function renderSessionRow(session: ChatSession) {
    const isActive = session.id === activeSessionId;
    const isEditingThis = editingId === session.id;

    if (isEditingThis) {
      return (
        <form
          key={session.id}
          onSubmit={(e) => handleSaveRename(session.id, e)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/10 border border-[#00f0ff]/40"
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-white text-xs outline-none px-1"
          />
          <button
            type="submit"
            onClick={(e) => handleSaveRename(session.id, e)}
            className="p-1 hover:text-emerald-400"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCancelRename}
            className="p-1 hover:text-rose-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      );
    }

    return (
      <div
        key={session.id}
        onClick={() => onSelectSession(session.id)}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
          isActive
            ? 'bg-gradient-to-r from-[#00f0ff]/15 to-[#a200ff]/15 text-white font-bold border border-[#00f0ff]/30 shadow-sm'
            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-12">
          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#00f0ff]' : 'text-gray-500'}`} />
          <span className="truncate">{session.title}</span>
        </div>

        {/* Hover Action Buttons */}
        <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#080811]/90 pl-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(session.id);
            }}
            title={session.isPinned ? 'Unpin chat' : 'Pin chat'}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-[#00f0ff]"
          >
            <Pin className={`w-3 h-3 ${session.isPinned ? 'fill-[#00f0ff] text-[#00f0ff]' : ''}`} />
          </button>

          <button
            onClick={(e) => handleStartRename(session, e)}
            title="Rename chat"
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <Edit2 className="w-3 h-3" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSession(session.id);
            }}
            title="Delete chat"
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-rose-400"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
};

export default ChatSidebar;
