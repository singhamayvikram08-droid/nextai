export const CLERK_KEY_STORAGE = 'nexgen_clerk_pub_key';

export const getClerkPublishableKey = (): string => {
  const envKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(CLERK_KEY_STORAGE);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  }
  return '';
};

export const setClerkPublishableKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CLERK_KEY_STORAGE, key.trim());
    window.dispatchEvent(new Event('nexgen-clerk-key-changed'));
  }
};
