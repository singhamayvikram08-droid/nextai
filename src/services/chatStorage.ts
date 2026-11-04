import { type ChatSession, type UserSettings, DEFAULT_USER_SETTINGS } from '../types/chat';

const SESSIONS_STORAGE_KEY = 'nexgen_ai_chat_sessions';
const SETTINGS_STORAGE_KEY = 'nexgen_ai_chat_settings';

/**
 * Loads all chat sessions from localStorage
 */
export const getStoredSessions = (): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const sessions: ChatSession[] = JSON.parse(raw);
    return sessions.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  } catch (err) {
    console.error('[ChatStorage] Error loading sessions:', err);
    return [];
  }
};

/**
 * Saves or updates a chat session
 */
export const saveStoredSession = (session: ChatSession): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  try {
    const sessions = getStoredSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = { ...session, updatedAt: Date.now() };
    } else {
      sessions.unshift({ ...session, updatedAt: Date.now() });
    }

    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new CustomEvent('nexgen-chat-sessions-changed', { detail: sessions }));
    return sessions;
  } catch (err) {
    console.error('[ChatStorage] Error saving session:', err);
    return [];
  }
};

/**
 * Deletes a session by ID
 */
export const deleteStoredSession = (id: string): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  try {
    const sessions = getStoredSessions().filter(s => s.id !== id);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new CustomEvent('nexgen-chat-sessions-changed', { detail: sessions }));
    return sessions;
  } catch (err) {
    console.error('[ChatStorage] Error deleting session:', err);
    return [];
  }
};

/**
 * Toggles pinned status for a session
 */
export const togglePinStoredSession = (id: string): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  const sessions = getStoredSessions().map(s => {
    if (s.id === id) {
      return { ...s, isPinned: !s.isPinned };
    }
    return s;
  });
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  window.dispatchEvent(new CustomEvent('nexgen-chat-sessions-changed', { detail: sessions }));
  return sessions;
};

/**
 * Renames a chat session
 */
export const renameStoredSession = (id: string, newTitle: string): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  const sessions = getStoredSessions().map(s => {
    if (s.id === id) {
      return { ...s, title: newTitle.trim() || 'Untitled Chat', updatedAt: Date.now() };
    }
    return s;
  });
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  window.dispatchEvent(new CustomEvent('nexgen-chat-sessions-changed', { detail: sessions }));
  return sessions;
};

/**
 * Clears all chat sessions
 */
export const clearAllStoredSessions = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSIONS_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('nexgen-chat-sessions-changed', { detail: [] }));
};

/**
 * Filters sessions by search term across title and message contents
 */
export const searchStoredSessions = (query: string): ChatSession[] => {
  const clean = query.trim().toLowerCase();
  if (!clean) return getStoredSessions();
  
  return getStoredSessions().filter(session => {
    if (session.title.toLowerCase().includes(clean)) return true;
    return session.messages.some(m => m.content.toLowerCase().includes(clean));
  });
};

/**
 * Loads user settings from localStorage
 */
export const getStoredUserSettings = (): UserSettings => {
  if (typeof window === 'undefined') return DEFAULT_USER_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_SETTINGS;
    return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('[ChatStorage] Error loading settings:', err);
    return DEFAULT_USER_SETTINGS;
  }
};

/**
 * Saves user settings to localStorage
 */
export const saveStoredUserSettings = (settings: Partial<UserSettings>): UserSettings => {
  if (typeof window === 'undefined') return DEFAULT_USER_SETTINGS;
  try {
    const current = getStoredUserSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nexgen-chat-settings-changed', { detail: updated }));
    return updated;
  } catch (err) {
    console.error('[ChatStorage] Error saving settings:', err);
    return DEFAULT_USER_SETTINGS;
  }
};

/**
 * Exports a session as Markdown text
 */
export const exportSessionToMarkdown = (session: ChatSession): string => {
  let md = `# ${session.title}\n`;
  md += `_Created on ${new Date(session.createdAt).toLocaleString()} · Model: ${session.modelId}_\n\n---\n\n`;

  for (const msg of session.messages) {
    const speaker = msg.role === 'user' ? '👤 **User**' : '✨ **Assistant**';
    md += `### ${speaker} _(${new Date(msg.timestamp).toLocaleTimeString()})_\n\n`;
    if (msg.reasoning) {
      md += `> **Reasoning:**\n> ${msg.reasoning.split('\n').join('\n> ')}\n\n`;
    }
    md += `${msg.content}\n\n---\n\n`;
  }

  return md;
};
