import { useState, useEffect, type ReactNode } from 'react';
import { ClerkProvider, useUser } from '@clerk/react';
import { dark } from '@clerk/themes';
import { setStoredAuth, getStoredAuth, clearStoredAuth } from '../utils/auth';
import { getClerkPublishableKey } from '../utils/clerk';

/**
 * Synchronizes authenticated Clerk session into NextGen UserSession
 */
const ClerkSync = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress || '';
      const name = user.fullName || user.firstName || email.split('@')[0] || 'Clerk User';
      const avatar = (name.split(' ').map(n => n[0]).join('') || 'CU').slice(0, 2).toUpperCase();

      const existing = getStoredAuth();
      // Only update if session differs to avoid redundant rerenders
      if (!existing || existing.email !== email) {
        setStoredAuth({
          name,
          email,
          avatar,
          role: existing?.role || 'Member',
          tier: existing?.tier || 'free',
          isPro: existing?.isPro || false,
          loginAt: new Date().toISOString(),
        });
      }
    } else if (isLoaded && !isSignedIn) {
      const existing = getStoredAuth();
      // If signed out of Clerk and user was not Root Admin, clear local session
      if (existing && existing.role !== 'Root Admin') {
        clearStoredAuth();
      }
    }
  }, [user, isLoaded, isSignedIn]);

  return null;
};

interface ClerkAuthProviderProps {
  children: ReactNode;
}

export const ClerkAuthProvider = ({ children }: ClerkAuthProviderProps) => {
  const [publishableKey, setKey] = useState<string>(getClerkPublishableKey);

  useEffect(() => {
    const handler = () => {
      setKey(getClerkPublishableKey());
    };
    window.addEventListener('nexgen-clerk-key-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('nexgen-clerk-key-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  if (!publishableKey) {
    // If Clerk Publishable Key is not set yet, render children cleanly without ClerkProvider crash
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        theme: dark as any,
        variables: {
          colorPrimary: '#00f0ff',
          colorBackground: '#080812',
          borderRadius: '1rem',
        },
        elements: {
          card: 'bg-[#080812] border border-white/10 shadow-2xl shadow-[#a200ff]/20 rounded-2xl',
          headerTitle: 'text-white font-black uppercase tracking-wider',
          headerSubtitle: 'text-gray-400 font-mono text-xs',
          formButtonPrimary: 'bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity',
          socialButtonsBlockButton: 'bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs rounded-xl transition-all',
          formFieldInput: 'bg-white/5 border border-white/10 text-white rounded-xl focus:border-[#00f0ff] transition-all font-mono text-sm',
          footerActionLink: 'text-[#00f0ff] hover:underline font-bold',
        },
      }}
    >
      <ClerkSync />
      {children}
    </ClerkProvider>
  );
};

export default ClerkAuthProvider;
