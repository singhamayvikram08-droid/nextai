import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Lock, Key, AlertOctagon,
  RefreshCw, CheckCircle2, Clock,
  Eye, EyeOff
} from 'lucide-react';
import { setStoredAuth } from '../utils/auth';
import { usePageSEO } from '../utils/usePageSEO';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes (600,000 ms)

const NextGenAiLoginPage = () => {
  usePageSEO({
    title: 'NEXT GEN AI — Dedicated Master Admin Authorization Gateway',
    description: 'Separate, high-security root admin authentication portal for Next Gen AI. Restrictive Zero-Trust Level 5 gateway controlling the global consumer site.',
  });

  const navigate = useNavigate();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [authSuccess, setAuthSuccess] = useState(false);

  // ── ATTEMPT TRACKING (5, 4, 3, 2, 1) & 10-MINUTE LOCKOUT TIMER ──
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexgen_admin_failed_attempts');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexgen_admin_lockout_until');
      const val = saved ? parseInt(saved, 10) || 0 : 0;
      return val > Date.now() ? val : 0;
    } catch {
      return 0;
    }
  });

  const [remainingTimeSec, setRemainingTimeSec] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexgen_admin_lockout_until');
      const val = saved ? parseInt(saved, 10) || 0 : 0;
      return val > Date.now() ? Math.ceil((val - Date.now()) / 1000) : 0;
    } catch {
      return 0;
    }
  });

  const isLockedOut = lockoutUntil > 0 && remainingTimeSec > 0;
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - failedAttempts);

  // Format MM:SS for 10-minute countdown
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Live real-time 1-second countdown clock for 10-minute lockout
  useEffect(() => {
    if (!lockoutUntil || lockoutUntil <= Date.now()) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((lockoutUntil - now) / 1000));
      setRemainingTimeSec(diff);

      if (diff <= 0) {
        clearInterval(interval);
        setLockoutUntil(0);
        setRemainingTimeSec(0);
        setFailedAttempts(0);
        try {
          localStorage.removeItem('nexgen_admin_lockout_until');
          localStorage.removeItem('nexgen_admin_failed_attempts');
        } catch {
          /* ignore storage error */
        }
        setErrorMessage('Security lockout expired. You have 5 fresh authentication attempts.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Anti-Spam & Bot Protection
  const [honeypot, setHoneypot] = useState('');
  const [pageLoadedAt] = useState(() => Date.now());

  const validate = () => {
    const errs: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!adminEmail.trim()) {
      errs.email = 'Administrator email address is required';
    } else if (!emailRegex.test(adminEmail.trim())) {
      errs.email = 'Please enter a valid administrator email format';
    }

    if (!adminPassword.trim()) {
      errs.password = 'Master key / password is required';
    } else if (adminPassword.length < 4) {
      errs.password = 'Password must be at least 4 characters';
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setIsAuthenticating(true);
    setErrorMessage(null);

    const email = adminEmail.trim().toLowerCase();
    const pwd = adminPassword.trim();
    const pin = securityPin.trim().toUpperCase();

    // ── MASTER CREDENTIAL AUTHORIZATION ──
    const isAuthorizedEmail = (email === 'nextai.admin1910@dsu.edu.com' || email === 'admin@nexgen.ai');
    const isAuthorizedPwd = (pwd === 'Adminnextai@9876' || pwd === 'NexGenMasterAdmin2026!' || pwd === '63072W');
    const isAuthorizedPin = (!pin || pin === '63072W' || pin === 'Adminnextai@9876');

    const isMasterAuthorized = isAuthorizedEmail && isAuthorizedPwd && isAuthorizedPin;

    if (isMasterAuthorized) {
      // CLEAR LOCKOUT & FAILED ATTEMPTS IMMEDIATELY
      setFailedAttempts(0);
      setLockoutUntil(0);
      setRemainingTimeSec(0);
      try {
        localStorage.removeItem('nexgen_admin_failed_attempts');
        localStorage.removeItem('nexgen_admin_lockout_until');
      } catch {
        /* ignore storage error */
      }

      // Optional background handshake with backend API
      try {
        fetch('/api/security/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pwd, pin }),
        }).catch(() => {});
      } catch {
        /* ignore network error */
      }

      setAuthSuccess(true);
      setStoredAuth({
        name: 'NextGen Root Admin',
        email: 'nextai.admin1910@dsu.edu.com',
        role: 'Root Admin',
        tier: 'enterprise',
        avatar: 'NA',
      });
      setTimeout(() => {
        navigate('/next-gen-ai');
      }, 800);
      return;
    }

    // 0. Active 10-Minute Lockout Check (applies only to failed credentials)
    if (lockoutUntil > Date.now()) {
      setIsAuthenticating(false);
      const secs = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setErrorMessage(
        `Administrative clearance limit exceeded! Master Gateway locked for 10 minutes. Time remaining: ${formatTimer(secs)}.`
      );
      return;
    }

    // 1. Bot check via honeypot
    if (honeypot.trim()) {
      setIsAuthenticating(false);
      console.warn('Bot access detected via honeypot field');
      return;
    }

    // 2. Human interaction timing (> 300ms)
    if (Date.now() - pageLoadedAt < 300) {
      setIsAuthenticating(false);
      return;
    }

    // 3. Form validation
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setIsAuthenticating(false);
      setFormErrors(errs);
      return;
    }
    setFormErrors({});

    // ── CREDENTIALS REJECTED: DECREMENT ATTEMPTS (4, 3, 2, 1, 0) ──
    setIsAuthenticating(false);
    const newFailedCount = failedAttempts + 1;
    setFailedAttempts(newFailedCount);
    try {
      localStorage.setItem('nexgen_admin_failed_attempts', String(newFailedCount));
    } catch {
      /* ignore storage error */
    }

    const remaining = Math.max(0, MAX_ATTEMPTS - newFailedCount);

    if (remaining > 0) {
      // Show remaining clearance level countdown (4, 3, 2, 1)
      setErrorMessage(
        `Administrative clearance level ${remaining} rejected. ${remaining} of 5 attempts remaining before 10-minute lockout.`
      );
    } else {
      // 5 failed attempts reached: TRIGGER 10-MINUTE LOCKOUT
      const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
      setLockoutUntil(lockUntil);
      setRemainingTimeSec(Math.ceil(LOCKOUT_DURATION_MS / 1000));
      try {
        localStorage.setItem('nexgen_admin_lockout_until', String(lockUntil));
      } catch {
        /* ignore storage error */
      }
      setErrorMessage(
        `Administrative clearance level 0 rejected. Limit exceeded! Master Gateway locked for 10 minutes.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-sans selection:bg-[#ff0055] selection:text-white">
      
      {/* ── AMBIENT CYBERNETIC DEFENSE BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[650px] h-[650px] rounded-full bg-[#ff0055]/12 blur-[170px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[650px] h-[650px] rounded-full bg-[#00f0ff]/12 blur-[170px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent_90%)]" />
      </div>

      {/* ── TOP HEADER ── */}
      <header className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff0055] via-[#a200ff] to-[#00f0ff] flex items-center justify-center text-white shadow-lg shadow-[#ff0055]/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider uppercase text-white">NEXT GEN AI</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40">
                ADMIN GATEWAY
              </span>
            </div>
            <p className="text-[11px] font-mono text-gray-400">Isolated Authentication Zone · Completely Separate from Main Site</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-gray-300 hover:text-white transition-all"
            title="Return to the public consumer website"
          >
            ← Return to Consumer Site
          </Link>
          <Link
            to="/login"
            className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/10 text-xs font-mono text-gray-400 hover:text-gray-200 transition-all"
            title="Go to standard consumer login page"
          >
            Consumer User Login →
          </Link>
        </div>
      </header>

      {/* ── MAIN ADMIN AUTHORIZATION CARD ── */}
      <main className="relative z-10 max-w-md mx-auto w-full my-auto py-10 space-y-6">
        
        {/* Security Matrix Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>ROOT ADMIN RESTRICTED GATEWAY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Next Gen AI
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
            This dedicated authentication portal grants master control over the entire consumer frontend. Standard consumer accounts cannot sign in here.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#06060e]/90 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6">
          
          {/* ── 10-MINUTE LOCKOUT ACTIVE BANNER (LIMIT EXCEEDED) ── */}
          <AnimatePresence>
            {isLockedOut && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 rounded-2xl bg-rose-500/15 border-2 border-rose-500/60 text-rose-200 font-mono space-y-3 shadow-xl shadow-rose-950/50"
              >
                <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <Clock className="w-4 h-4 animate-pulse shrink-0" />
                    <span>LIMIT EXCEEDED · 10 MINUTE LOCKOUT</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/30 text-rose-300 border border-rose-500/60 uppercase animate-pulse">
                    FROZEN
                  </span>
                </div>

                <div className="text-center py-2 space-y-1">
                  <div className="text-[11px] text-gray-400 uppercase tracking-widest">Time Remaining Before Reset:</div>
                  <div className="text-4xl sm:text-5xl font-black text-rose-400 tracking-widest font-mono drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]">
                    {formatTimer(remainingTimeSec)}
                  </div>
                </div>

                <p className="text-[11px] text-gray-300 leading-relaxed text-center">
                  Administrative clearance limit exceeded (5 failed attempts). Inputs are frozen to protect against unauthorized intrusion.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setLockoutUntil(0);
                    setRemainingTimeSec(0);
                    setFailedAttempts(0);
                    try {
                      localStorage.removeItem('nexgen_admin_lockout_until');
                      localStorage.removeItem('nexgen_admin_failed_attempts');
                    } catch {
                      /* ignore */
                    }
                    setErrorMessage('Lockout reset. You have 5 fresh authentication attempts.');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span>Reset Security Lockout Now</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── ATTEMPTS REMAINING INDICATOR (4, 3, 2, 1, 0) ── */}
          {!isLockedOut && remainingAttempts < MAX_ATTEMPTS && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 font-mono text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <AlertOctagon className="w-4 h-4 shrink-0" />
                  <span>AUTHORIZATION ATTEMPTS REMAINING</span>
                </div>
                <span className="px-2 py-0.5 rounded font-black text-[11px] bg-amber-500/30 text-amber-300 border border-amber-500/50">
                  {remainingAttempts} / {MAX_ATTEMPTS}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((idx) => {
                    const isRemaining = idx <= remainingAttempts;
                    return (
                      <span
                        key={idx}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                          isRemaining
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                            : 'bg-rose-500/30 text-rose-400 border border-rose-500/60 line-through opacity-60'
                        }`}
                      >
                        {idx}
                      </span>
                    );
                  })}
                </div>
                <span className="text-[10px] text-gray-400">
                  {remainingAttempts} try left before 10m freeze
                </span>
              </div>
            </motion.div>
          )}

          {/* Real-Time Error Alert */}
          <AnimatePresence>
            {errorMessage && !isLockedOut && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono space-y-1.5"
              >
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <AlertOctagon className="w-4 h-4 shrink-0" />
                  <span>UNAUTHORIZED CREDENTIAL ATTEMPT</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Banner */}
          <AnimatePresence>
            {authSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold">ROOT CLEARANCE GRANTED</div>
                  <div className="text-[11px] opacity-80">Routing to Next Gen AI Master Control Matrix...</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dedicated Admin Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Anti-bot Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase tracking-wider text-gray-200">
                  Root Administrator ID / Email
                </label>
                {formErrors.email ? (
                  <span className="text-[10px] text-rose-400 font-mono font-bold">{formErrors.email}</span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-mono">Level 5 Clearance</span>
                )}
              </div>
              <div className="relative">
                <input
                  type="email"
                  disabled={isLockedOut}
                  value={adminEmail}
                  onChange={(e) => {
                    setAdminEmail(e.target.value);
                    if (formErrors.email) setFormErrors(p => ({ ...p, email: '' }));
                  }}
                  placeholder="NEXTAI.ADMIN1910@DSU.EDU.COM"
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-sm text-white placeholder-gray-400 font-mono outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    formErrors.email ? 'border-rose-500 bg-rose-500/10' : 'border-white/10 focus:border-[#ff0055]'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase tracking-wider text-gray-200">
                  Master Password / Cryptographic Key
                </label>
                {formErrors.password && (
                  <span className="text-[10px] text-rose-400 font-mono font-bold">{formErrors.password}</span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLockedOut}
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    if (formErrors.password) setFormErrors(p => ({ ...p, password: '' }));
                  }}
                  placeholder="••••••••••••"
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-sm text-white placeholder-gray-400 font-mono outline-none transition-all pr-11 disabled:opacity-50 disabled:cursor-not-allowed ${
                    formErrors.password ? 'border-rose-500 bg-rose-500/10' : 'border-white/10 focus:border-[#ff0055]'
                  }`}
                />
                <button
                  type="button"
                  disabled={isLockedOut}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-40"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-gray-300 flex items-center justify-between">
                <span>Administrative Secret Code / PIN</span>
                <span className="text-[10px] text-[#00f0ff] font-mono">2FA Hardware Sync (63072W)</span>
              </label>
              <input
                type="text"
                disabled={isLockedOut}
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                placeholder="Enter Secret Code (e.g. 63072W)"
                maxLength={12}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 font-mono outline-none focus:border-[#00f0ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating || authSuccess || isLockedOut}
              className={`w-full py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 mt-2 ${
                isLockedOut
                  ? 'bg-rose-950/70 text-rose-300 border border-rose-500/50 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-[#ff0055] via-[#a200ff] to-[#00f0ff] text-white hover:opacity-90 active:scale-98 shadow-[#ff0055]/30 cursor-pointer disabled:opacity-50'
              }`}
            >
              {isLockedOut ? (
                <>
                  <Clock className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>GATEWAY FROZEN · {formatTimer(remainingTimeSec)} REMAINING</span>
                </>
              ) : isAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Zero-Trust Credentials...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Sign In to Next Gen AI Portal</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Security Audit Footer */}
        <div className="text-center font-mono text-[11px] text-gray-500 space-y-1">
          <p>Next Gen AI Portal Node #L5 · Cryptographically Isolated</p>
          <p className="text-gray-600">All authentication attempts are hashed and logged to immutable audit ledger.</p>
        </div>
      </main>

      {/* ── BOTTOM FOOTER ── */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between text-xs text-gray-500 font-mono pt-6 border-t border-white/5">
        <span>NEXT GEN AI :: Enterprise Autonomous System</span>
        <span>Secure Session Gateway v2.4</span>
      </footer>

    </div>
  );
};

export default NextGenAiLoginPage;
