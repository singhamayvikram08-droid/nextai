import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Hexagon, ArrowLeft, Shield, Lock, Eye, Database, Globe, Bell, Phone, Mail, FileText, UserCheck, AlertTriangle, Scale } from 'lucide-react';
import { usePageSEO } from '../utils/usePageSEO';

const PrivacyPage = () => {
  usePageSEO({
    title: 'Privacy Policy & Statutory Compliance — NexGen AI',
    description: 'Statutory compliance notice under India DPDP Act 2023, DPDP Rules 2025, RBI E-Mandate directives, and GDPR standards.'
  });

  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col font-sans selection:bg-[#00f0ff] selection:text-black">
      {/* Top Header */}
      <header className="h-20 border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00f0ff] blur-md opacity-40 group-hover:opacity-80 transition-opacity rounded-full" />
            <Hexagon className="text-[#00f0ff] relative z-10 w-8 h-8 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-black text-xl tracking-wide uppercase text-white">
            Nex<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a200ff]">Gen</span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-bold uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" /> Statutory Privacy &amp; Regulatory Compliance
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Privacy Policy &amp; Data Governance
          </h1>
          <p className="text-gray-400 text-sm">
            Last Updated: October 30, 2026 · Compliant with India DPDP Act 2023, DPDP Rules 2025, RBI E-Mandate Directives, and EU-GDPR
          </p>
        </motion.div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Scale, title: 'DPDP Act 2023 Compliant', desc: 'Enforcing Data Principal Rights (Access, Correction, Erasure, Grievance, Nomination).' },
            { icon: Lock, title: 'Zero Data Brokerage', desc: 'We never sell your telemetry, personal records, or prompts to third-party data brokers.' },
            { icon: Database, title: 'RBI E-Mandate Transparency', desc: 'Pre-debit notifications 24 hours prior to recurring charges with zero-friction cancellation.' },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <item.icon className="w-5 h-5 text-[#00f0ff]" />
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <p className="text-xs text-gray-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-gray-300 text-sm leading-relaxed border-t border-white/5 pt-10">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#a200ff]" /> 1. Information We Collect &amp; Lawful Grounds
            </h2>
            <p>
              Under Section 4 and Section 6 of India&apos;s Digital Personal Data Protection (DPDP) Act, 2023, personal data is processed solely for lawful purposes on the basis of your explicit, affirmative, and granular consent:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-300">
              <li><strong className="text-white">Account Information:</strong> Full name, verified email address, age verification status, and authentication tokens collected during registration.</li>
              <li><strong className="text-white">Cluster Telemetry &amp; Technical Metrics:</strong> Anonymized edge IP routing data, node round-trip latency, browser user-agent, and WebGPU/WebGL capabilities.</li>
              <li><strong className="text-white">Payment &amp; Subscription Tokens:</strong> Recurring mandate tokens, card network transaction IDs, and currency amounts processed through PCI-DSS Level 1 compliant gateways. Card numbers are never stored in plaintext.</li>
            </ul>
          </section>

          {/* Section 2: DPDP Minor Protections */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#00f0ff]" /> 2. Protection of Children &amp; Verifiable Parental Consent (DPDP Act §9)
            </h2>
            <p>
              NexGen AI strictly enforces statutory protections under Section 9 of the DPDP Act 2023:
            </p>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Statutory Mandate on Children&apos;s Data:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Users under 18 years of age must provide verifiable parental/guardian consent prior to account activation.</li>
                <li><strong>Absolute Prohibition on Tracking:</strong> We never track, monitor behavioral patterns, or serve targeted advertising to any minor. If a user is registered as a minor, all telemetry and analytical scripts are unconditionally disabled regardless of cookie toggles.</li>
                <li>Processing that could cause detrimental effects on the well-being of a child is strictly barred.</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Data Principal Rights */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00ff88]" /> 3. Data Principal Statutory Rights (DPDP Act Chapter III)
            </h2>
            <p>
              As a Data Principal under India&apos;s DPDP Act 2023, you enjoy statutory rights that you may exercise directly from your NexGen Dashboard or by notifying our Grievance Redressal Officer:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="font-bold text-white">Right to Access (§11)</div>
                <p className="text-gray-400">Request a complete summary of your personal data processed, identities of third-party processors, and download an archive via &ldquo;Export Personal Data&rdquo; in the Dashboard.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="font-bold text-white">Right to Correction &amp; Erasure (§12)</div>
                <p className="text-gray-400">Correct inaccurate data, complete incomplete records, or permanently erase your personal data using &ldquo;Delete Account &amp; Personal Data&rdquo; in the Dashboard.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="font-bold text-white">Right to Withdraw Consent (§6(4))</div>
                <p className="text-gray-400">Consent withdrawal is as seamless as granting consent. Click &ldquo;Consent Preferences&rdquo; in the global footer anytime to toggle or revoke permissions.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="font-bold text-white">Right to Nominate (§14)</div>
                <p className="text-gray-400">Nominate any individual who, in the event of death or incapacity, shall exercise your statutory rights as a Data Principal.</p>
              </div>
            </div>
          </section>

          {/* Section 4: RBI Auto-Debit & Dark Pattern Disclosures */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#a200ff]" /> 4. RBI Recurring Auto-Debit &amp; Dark Pattern Prevention
            </h2>
            <p>
              In strict accordance with the Reserve Bank of India (RBI) circular on e-mandates and the CCPA Guidelines for Prevention and Regulation of Dark Patterns 2023:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-300">
              <li><strong className="text-white">24-Hour Pre-Debit Notification:</strong> We dispatch an automated SMS/email notice at least 24 hours prior to debiting any recurring subscription renewal. The notification includes the merchant name, mandate ID (UMRN), charge amount, debit date, and a direct 1-click opt-out link.</li>
              <li><strong className="text-white">Cancellation Parity (No Forced Continuity):</strong> Cancelling your subscription and revoking your recurring e-mandate is just as easy as subscribing. A prominent 1-click &ldquo;Cancel Pro Subscription &amp; Revoke E-Mandate&rdquo; button is maintained directly in your Dashboard.</li>
              <li><strong className="text-white">Zero Dark Patterns:</strong> We forbid deceptive interfaces, pre-ticked opt-in boxes, hidden charges, subscription traps, false countdown urgency, or confirm-shaming dialogues.</li>
            </ul>
          </section>

          {/* Section 5: Grievance Redressal & Appellate Authority */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#00f0ff]" /> 5. Grievance Redressal Officer &amp; Data Protection Board of India
            </h2>
            <p>
              If you have any questions, concerns, or grievances regarding the processing of your personal data, or wish to exercise your statutory rights, contact our resident Grievance Redressal Officer in India:
            </p>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 block">Designated Officer:</span>
                  <span className="font-bold text-white text-sm">Amay Vikram Singh</span>
                  <span className="text-gray-400 block text-[11px]">Principal Privacy &amp; Compliance Officer</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Registered Address (India):</span>
                  <span className="text-gray-200">NexGen AI Technologies India Pvt. Ltd.</span>
                  <span className="text-gray-400 block text-[11px]">DLF Cyber City, Phase 2, Gurugram, Haryana - 122002, India</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 font-mono pt-2 border-t border-white/5">
                <a 
                  href="mailto:grievance@nexgen.io" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/30 transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span>grievance@nexgen.io</span>
                </a>
                <a 
                  href="mailto:dpo@nexgen.io" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#a200ff] hover:bg-[#a200ff]/10 hover:border-[#a200ff]/30 transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-[#a200ff]" />
                  <span>dpo@nexgen.io</span>
                </a>
                <a 
                  href="tel:+911245550199" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span>+91 124 555 0199 (Mon–Fri 09:30–18:30 IST)</span>
                </a>
              </div>
              <div className="text-[11px] text-gray-400 pt-1">
                <strong>Statutory Redressal SLA:</strong> All complaints and rights requests will be acknowledged within 24 hours and resolved within <span className="text-white font-semibold">7 working days</span>.
              </div>
            </div>

            {/* Appeal to DPBI */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200/90 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-blue-300">
                <Globe className="w-4 h-4" />
                <span>Statutory Right to Appeal to Data Protection Board of India (DPBI):</span>
              </div>
              <p>
                Under Section 13(3) of the DPDP Act 2023, if your grievance is not resolved by our Grievance Redressal Officer within 7 working days, or if you are dissatisfied with our response, you have the statutory right to file a formal complaint before the <strong>Data Protection Board of India (DPBI)</strong> via its electronic portal at{' '}
                <a 
                  href="https://dpbi.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#00f0ff] underline hover:text-white font-mono"
                >
                  https://dpbi.gov.in
                </a>.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Nav */}
        <div className="pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 NexGen Technologies Inc. &amp; NexGen AI Technologies India Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-[#00f0ff] transition-colors">Terms of Service</Link>
            <Link to="/login" className="hover:text-[#00f0ff] transition-colors">Get Started</Link>
            <Link to="/dashboard" className="hover:text-[#00f0ff] transition-colors">Developer Dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
