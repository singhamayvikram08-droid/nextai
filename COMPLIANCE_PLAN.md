# India DPDP Act 2023, RBI Auto-Debit & Dark Patterns Compliance Plan

**Target Application**: NexGen AI Autonomous Engineering Platform & Micro-services  
**Workspace**: `/Users/amayvikramsingh/.gemini/antigravity/worktrees/amay gravity/generate_localhost_links_all`  
**Date of Audit**: October 30, 2026  
**Auditor**: Senior Security & Compliance Engineer  
**Status**: PENDING USER APPROVAL (No code modifications will be executed until approved)

---

## 1. Project Context & Data Map

- **Primary Stack**: React 19 + TypeScript + Vite + Tailwind CSS + Node.js/Express (`server-security.mjs`) + Vercel Serverless Functions (`api/`).
- **Auxiliary Micro-Apps in Workspace**:
  - `snackdash`: Node/Express + SQLite3 + Socket.io (e-commerce & food checkout).
  - `digital-twin`: Next.js 15 App Router + Express/MongoDB + Python OpenCV facial landmarking.
  - `attendance-predictor`: Vanilla HTML5/JS + Web Speech API + browser LocalStorage.
- **Personal Data Collected**:
  - **Account & Identity**: Full name, email address, password hashes (bcrypt), user avatars.
  - **Billing & Payment**: Cardholder name, credit card details (mock input), Apple Pay auth tokens, crypto wallet addresses, transaction receipts, phone numbers (`snackdash`).
  - **Biometric & High-Sensitivity Data**: Facial cascade models & landmark detection (`digital-twin/ai-service`), uploaded images.
  - **Device & Telemetry**: IP addresses, browser user-agents, request timestamps, cluster telemetry, page views, error logs.
  - **Conversational & Voice**: AI chat prompt logs, voice recording speech-to-text transcripts.
- **Payments & Subscriptions**:
  - Pro Spatial Tier ($49/month or $39/month annual) with 14-day free trial.
  - Enterprise custom contracts.
  - On-demand order transactions (`snackdash`).

---

## 2. Comprehensive Compliance Audit & Issues Inventory

| Issue ID | Area | Severity | Description & Regulatory Violation | Affected Files | Planned Remediation |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **SEC-01** | Secrets | **CRITICAL** | Raw OpenRouter API key committed in plaintext in version control (`snackdash/.env`). | `snackdash/.env`, `.gitignore` | Remove `snackdash/.env` from git tracking, add to `.gitignore`, notify user to rotate key immediately. |
| **SEC-02** | Secrets | **HIGH** | Client-side direct OpenRouter API calls with hardcoded or unproxied headers. | `src/components/ChatBox.tsx`, `src/pages/DashboardPage.tsx` | Route all LLM requests strictly through backend proxy `/api/ai/chat`; remove client credentials. |
| **SEC-03** | Secrets | **MEDIUM** | Plaintext API key input and storage in browser LocalStorage (`attendance-predictor`). | `attendance-predictor/script.js` | Mask input, route via secure serverless proxy, eliminate unencrypted key storage in LocalStorage. |
| **AGE-01** | Age & Consent | **HIGH** | Missing 18+ age verification gate during consumer registration (DPDP Act 2023 §9(1)). | `src/pages/LoginPage.tsx`, `src/utils/auth.ts` | Add Date of Birth / 18+ age verification checkbox at signup. |
| **AGE-02** | Age & Consent | **HIGH** | Lack of Verifiable Parental Consent (VPC) flow for minors under 18 (DPDP Act 2023 §9(1)). | `src/pages/LoginPage.tsx`, `src/utils/auth.ts` | Implement parental consent workflow collecting Guardian Name, Email, and verifiable affirmative consent before account activation. |
| **AGE-03** | Age & Consent | **CRITICAL** | Children's data subject to telemetry and tracking (Strict violation of DPDP Act 2023 §9(2) & §9(3)). | `src/utils/analytics.ts`, `src/pages/LoginPage.tsx` | Enforce strict block on all analytics, tracking, and behavioural monitoring if user is a minor, overriding cookie settings. |
| **CON-01** | Tracking | **HIGH** | Non-essential cookies/telemetry enabled by default (`telemetry: true`, `spatialCache: true`) in banner (Dark Patterns §5(a) Pre-ticked Boxes). | `src/components/CookieConsentBanner.tsx` | Set all non-essential cookie categories to `false` by default. Only activate after explicit affirmative opt-in. |
| **CON-02** | Tracking | **MEDIUM** | Lack of universal session-replay input masking on sensitive personal data fields. | `src/components/Pricing.tsx`, `src/pages/LoginPage.tsx` | Add `data-private="true"`, `data-rr-block="true"`, and `autocomplete="off"` to all password, payment, and personal input fields. |
| **CON-03** | Consent Notice | **HIGH** | Consent notice does not fulfill DPDP Act 2023 §5 statutory requirements (purposes, DPO contact, withdrawal mechanism). | `src/components/CookieConsentBanner.tsx`, `src/pages/LoginPage.tsx` | Update notice with plain-language itemization of data, specific purposes, withdrawal rights, and DPBI grievance details. |
| **CON-04** | Withdrawal | **MEDIUM** | Missing persistent, accessible one-click consent withdrawal mechanism on all pages (DPDP Act §6(4)). | `src/components/Footer.tsx`, `src/components/CookieConsentBanner.tsx` | Add persistent "Cookie & Consent Preferences" trigger in global footer allowing instantaneous consent revocation. |
| **PAY-01** | Payments | **HIGH** | Card inputs collected directly without clear recurring mandate terms or PCI tokenization disclosures. | `src/components/Pricing.tsx` | Add explicit recurring billing terms, auto-debit schedule, and gateway tokenization disclosures. |
| **PAY-02** | Dark Patterns | **CRITICAL** | Forced Continuity (§5(e) of Dark Patterns Guidelines 2023): Subscription checkout is 1-click, but dashboard has NO cancellation button. | `src/pages/DashboardPage.tsx`, `src/utils/auth.ts` | Add clear, prominent 1-click "Cancel Subscription & E-Mandate" button in Dashboard with instant revocation and zero confirmation shaming. |
| **PAY-03** | RBI Auto-Debit | **HIGH** | No 24-hour pre-debit notification mechanism prior to recurring charges (RBI Circular on Processing of E-Mandates). | `server-security.mjs`, `scripts/pre-debit-notification-job.mjs`, `api/billing/pre-debit-notification.js` | Implement automated 24-hour pre-debit advisory service and notification job with transaction details and direct opt-out link. |
| **RGT-01** | Data Rights | **HIGH** | Missing Data Principal Rights interface for Data Access / Export (DPDP Act §11) and Account Erasure / Deletion (DPDP Act §12). | `src/pages/DashboardPage.tsx`, `server-security.mjs`, `api/user/data-rights.js` | Implement `[GET] /api/user/data-export` and `[POST] /api/user/data-delete` endpoints, with "Download My Data" and "Delete Account" in Dashboard. |
| **RGT-02** | Grievance | **HIGH** | Privacy policy lacks Data Protection Officer (DPO) / Grievance Redressal Officer (GRO) contact in India and DPBI escalation runbook (DPDP Act §13). | `src/pages/PrivacyPage.tsx`, `src/pages/TermsPage.tsx` | Publish GRO details (Name, Address in India, Official Email, Phone, SLA) and formal right of complaint to Data Protection Board of India. |
| **BRC-01** | Breach Response | **HIGH** | Absence of formal 72-hour Data Breach Response Runbook & notification templates for DPBI and affected users (DPDP Act §8(6)). | `BREACH_RESPONSE.md` | Author comprehensive `BREACH_RESPONSE.md` with incident severity matrix, 72-hour DPBI reporting protocol, and user advisory templates. |

---

## 3. Step-by-Step Implementation Sequence

Following your prescribed order of operations:

### Phase A: Secrets Remediation
1. Untrack `snackdash/.env` from git (`git rm --cached snackdash/.env`).
2. Add `snackdash/.env` and all root `.env*` variants (except `.env.example`) to `.gitignore`.
3. Provide an explicit key rotation notice to the user for the exposed OpenRouter API key.
4. Verify server-side proxy isolation so no secret keys are shipped to client bundles.

### Phase B: Age Gate & Parental Consent (DPDP Act §9)
1. Update `src/pages/LoginPage.tsx` and `src/utils/auth.ts`:
   - Introduce age verification gate ("I confirm I am 18 years of age or older" or Date of Birth validation).
   - If user is under 18, require Guardian Name, Guardian Email, and affirmative verifiable parental consent.
   - If user is a minor, set `isMinor: true` in the user session.
2. Update `src/utils/analytics.ts`:
   - Enforce an absolute kill-switch on all analytics/telemetry if `user.isMinor === true`.

### Phase C: Consent, Tracking & Session Replay Masking
1. Update `src/components/CookieConsentBanner.tsx`:
   - Change `DEFAULT_PREFERENCES` to opt-out (`telemetry: false`, `spatialCache: false`, `personalization: false`).
   - Enhance the consent notice text to comply with DPDP Section 5 (specifying data categories, purposes, DPO contact, and DPBI escalation rights).
2. Add universal session-replay masking:
   - Add `data-private="true"`, `data-rr-block="true"`, and `autocomplete="off"` to inputs in `LoginPage.tsx`, `Pricing.tsx`, and `ChatBox.tsx`.
3. Update `src/components/Footer.tsx`:
   - Add a persistent "Cookie & Consent Preferences" button allowing users to reopen and revoke consent at any time.

### Phase D: Payments, RBI Auto-Debit & Dark Pattern Removal
1. Update `src/components/Pricing.tsx`:
   - Remove ambiguous trial messaging. Display prominent recurring charge disclosure: billing cycle, renewal amount ($49/month or $39/month annual), first debit date, and mandate details.
   - Add explicit pre-debit notice disclosure (notifying the user that an SMS/email advisory will be sent 24 hours prior to every charge).
2. Update `src/pages/DashboardPage.tsx`:
   - Add a dedicated **Subscription & E-Mandate Governance** card in the Dashboard.
   - Provide a prominent, zero-friction **"Cancel Pro Subscription & Revoke E-Mandate"** button that immediately halts auto-renewal without manipulative confirmation screens.
3. Create Pre-Debit Notification Job:
   - Create `scripts/pre-debit-notification-job.mjs` and serverless handler `api/billing/pre-debit-notification.js`.
   - Generates compliant RBI 24-hour pre-debit advisories with mandate ID, charge amount, charge date, and 1-click opt-out link.

### Phase E: Data Rights & Breach Response Readiness
1. Data Rights Endpoints & Dashboard Interface:
   - Add `/api/user/data-export` and `/api/user/data-delete` handlers in `server-security.mjs` / `api/user/data-rights.js`.
   - Add a **Data Privacy & Statutory Rights** section in `DashboardPage.tsx` with "Export All Personal Data (JSON)" and "Request Account & Data Erasure".
2. Privacy Policy & Grievance Redressal Officer:
   - Update `src/pages/PrivacyPage.tsx` with dedicated sections for:
     - Digital Personal Data Protection Act (DPDP), 2023 compliance.
     - Details of the Grievance Redressal Officer (Name, Address, Email, Phone, SLA).
     - Procedure for filing complaints with the Data Protection Board of India (DPBI).
3. Breach Response Protocol:
   - Create `BREACH_RESPONSE.md` containing:
     - Incident Response Team structure & Owner.
     - 72-hour incident response workflow (T+0 identification, T+6 CERT-In reporting, T+24 internal triage, T+72 DPBI & affected user notifications).
     - Standardized breach notification templates for DPBI and affected Data Principals.

---

## 4. Verification & Testing Strategy

After each phase:
1. Static analysis: `npm run build` and `npm run lint`.
2. Browser validation: Verify age gate UI, parental consent toggles, cookie opt-ins, payment disclosures, cancel button, and data export downloads.
3. Test pre-debit notification job via `node scripts/pre-debit-notification-job.mjs`.
4. Compile final summary into `COMPLIANCE_REPORT.md`.

---

**Next Action**: Waiting for your explicit approval to execute this plan.
