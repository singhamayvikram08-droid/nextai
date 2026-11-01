import { useState } from 'react';
import { SignUp } from '@clerk/react';
import { Link, useNavigate } from 'react-router-dom';
import { Key, ArrowRight, Hexagon, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePageSEO } from '../utils/usePageSEO';
import { getClerkPublishableKey, setClerkPublishableKey } from '../utils/clerk';

export const SignUpPage = () => {
  usePageSEO({
    title: 'Sign Up with Clerk — NextGen AI Platform',
    description: 'Create an account with Clerk authentication for NextGen AI.',
  });

  const navigate = useNavigate();
  const [publishableKey, setKey] = useState<string>(getClerkPublishableKey);
  const [inputKey, setInputKey] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [keySaved, setKeySaved] = useState(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputKey.trim();
    if (!clean) {
      setKeyError('Please enter your Clerk Publishable Key (starts with pk_test_ or pk_live_).');
      return;
    }
    if (!clean.startsWith('pk_test_') && !clean.startsWith('pk_live_')) {
      setKeyError('Invalid format. A Clerk publishable key starts with "pk_test_" or "pk_live_".');
      return;
    }

    setClerkPublishableKey(clean);
    setKey(clean);
    setKeySaved(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background neon glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00f0ff]/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#a200ff]/10 blur-[140px] pointer-events-none" />

      {/* Top Header Logo */}
      <Link to="/" className="mb-8 flex items-center gap-2.5 group cursor-pointer">
        <div className="relative">
          <div className="absolute inset-0 bg-[#00f0ff] blur-md opacity-40 group-hover:opacity-80 transition-opacity rounded-full" />
          <Hexagon className="text-[#00f0ff] relative z-10 w-8 h-8 group-hover:scale-110 transition-transform" />
        </div>
        <span className="font-black text-xl tracking-wide uppercase text-white">
          Nex<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a200ff]">Gen AI</span>
        </span>
      </Link>

      {publishableKey ? (
        <div className="flex flex-col items-center gap-4">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/dashboard"
          />
          <div className="flex items-center gap-4 text-xs font-mono text-gray-400 mt-2">
            <Link to="/login" className="hover:text-[#00f0ff] transition-colors flex items-center gap-1">
              <span>Standard Portal Login</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-md w-full bg-[#080812] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-[#a200ff]/20 space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#a200ff] flex items-center justify-center text-black shadow-lg shadow-[#00f0ff]/20">
              <Key className="w-5 h-5 fill-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">Activate Clerk Authentication</h1>
              <p className="text-xs text-gray-400 font-mono">Connect your Clerk Application Key</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 text-xs text-gray-300 leading-relaxed font-mono">
            <div className="flex items-center gap-2 text-[#00f0ff] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>Step 1: Get your API Key</span>
            </div>
            <p className="text-gray-400 text-[11px]">
              Open your{' '}
              <a
                href="https://dashboard.clerk.com/last-active?path=api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-[#00f0ff] underline font-bold"
              >
                Clerk Dashboard API Keys
              </a>{' '}
              and copy your <strong>Publishable Key</strong> (starts with <code className="text-emerald-400">pk_test_</code>).
            </p>
          </div>

          {keySaved ? (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Clerk key activated! Initializing authentication provider...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
                  Clerk Publishable Key
                </label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    if (keyError) setKeyError(null);
                  }}
                  placeholder="pk_test_..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-[#00f0ff] outline-none transition-all placeholder-gray-500"
                />
                {keyError && (
                  <p className="text-[11px] font-semibold text-rose-400 font-mono">{keyError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a200ff] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-[#00f0ff]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Activate Clerk in App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-gray-400">
            <span>Or use local session:</span>
            <button
              onClick={() => navigate('/login')}
              className="text-[#00f0ff] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Standard Login</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
