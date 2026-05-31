# 03 — Features & Roadmap

## Competitive benchmark

The features below are informed by what these platforms do well:

| Platform | Lessons learned |
|---|---|
| **Preply** | Trust badges, super-tutor signals, response time on profile, anti-disintermediation guards, lesson packages |
| **italki** | Wallet/credit system, package discounts, Professional vs Community tutor tiers, notebook feature |
| **Vedantu** | South Asian K-12 patterns, doubt sessions, parent dashboards, WhatsApp-first comms |
| **Unacademy** | Plus subscriptions, hybrid 1:1 + cohort, exam-prep funnels |
| **Outschool** | Parent/learner split accounts, refund automation, video intro requirement for tutors |

## Feature catalogue

### A. Trust, safety, anti-disintermediation

- Tutor verification pipeline: ID + qualifications + video intro + mock demo
- Trust badges: Verified ID, Verified Qualifications, Super Tutor, Top Pick
- Anti-disintermediation: regex/LLM scan blocking phone/email/social handles in pre-enrollment chat
- Hide tutor last name until enrollment
- Watermark uploaded recordings/files with user ID
- Report user / message / content flow
- Admin moderation queue
- Content moderation on profiles, course descriptions, chat

### B. Booking, cancellation, no-show policies

- Reschedule window (default 12h before — late = warning, policy hit)
- Cancellation window with auto-refund/credit
- No-show grace period (15 min) before auto-marking
- No-show consequences (student forfeits credit; teacher takes Trust hit)
- Late-join notifications to both parties
- Dispute window after each session (24–48h)
- Max reschedules per session (default 2)

### C. Pricing & commerce

- Single-session bookings
- Lesson packages (5/10/20 with discount)
- Monthly subscriptions (auto-renew, N lessons/month)
- Free trial / paid trial / first-lesson money-back guarantee (TBD)
- Wallet system (top-up, refunds, referral credits)
- Promo codes (expiry, usage caps, per-user limits)
- Gift cards (later)

### D. Discovery & funnel

- Programmatic SEO pages: `/tutors/{subject}/{board}/{location?}`
- Filters: exam board, year, language of instruction, gender preference, availability, lesson type
- Sort: relevance, rating, price, response time, completed lessons, newest
- Wishlist / saved tutors
- Recently viewed
- Recommendations ("students who picked X also picked Y")
- Response time on tutor profile
- "Active in last X" recency signal
- Pre-booking limited chat (decision pending — see open questions)

### E. Parent / multi-learner accounts

- Parent account is primary, children nested
- One parent → many children, each with own dashboard
- Parent sees combined schedule, billing, progress
- Parent communicates with teacher; child joins chat
- Separate child login OR SSO from parent
- **Required from day one** — schema designed accordingly

### F. Academic progression

- Per-student progress tracker (topics, mastery, hours)
- Teacher session notes (auto-prompt at session end)
- Auto-generated session summaries (LLM, optional enhancement)
- Curriculum mapping: CAIE/Edexcel syllabus loaded as topics, teachers tick coverage
- Joint goal setting (student + teacher)
- Mock tests / quizzes with auto-grading (later)
- Streak / consistency gamification (proven retention lever)

### G. Notifications (multi-channel)

- Email (Resend)
- In-app (Realtime + notifications table)
- WhatsApp (Gupshup) — dominant channel in PK
- SMS for critical reminders (15-min start)
- Web push (PWA)
- Per-channel per-event preference center

### H. Tutor experience

- Earnings dashboard (breakdown by lesson, retention, payouts)
- Payout management (bank / JazzCash / Easypaisa, schedule, hold for dispute window)
- Calendar sync (Google two-way — already required for Meet)
- Recurring availability templates + blackout dates (vacation mode)
- Auto-decline when full
- Tutor analytics (retention, no-show, repeat-student rate)
- Tutor community / forum (later)

### I. Reviews & social proof

- Quick rating after each session (1-tap)
- Detailed written review unlocked after N completed sessions
- Verified Review badge (only completed-session reviews)
- Teacher response to reviews
- Aggregate stats on profile

### J. Support & dispute resolution

- Help center (Crisp / Intercom / custom)
- In-app support chat
- Dispute flow → admin reviews → resolution logged in audit trail
- FAQ + onboarding tours

### K. Growth & retention

- Referral program (both sides credited)
- Affiliate program (later, for influencers / edu-bloggers)
- Re-engagement automations (lapsed student emails, "favorite tutor opened slots")
- Welcome sequences

## Roadmap by phase

| Phase | Focus | Key deliverables |
|---|---|---|
| **0** | Foundation | Repo, Vite app, Tailwind, shadcn, Supabase project, auth flow, role gating, Netlify deploy |
| **1** | Catalog & profiles | Category/stream/subject CMS, teacher registration + approval pipeline, public catalog browse + search, parent/learner account model, exam board filters, SEO page scaffolding |
| **2** | Discovery & funnel | Featured tutors, advanced filters, wishlist, response-time tracking, recommendations stub |
| **3** | Booking & enrollment | Availability calendar, demo request flow, enrollment record, lesson packages, cancellation/reschedule policies, wallet, promo codes, Google Meet/Zoom OAuth, short codes scheme |
| **4** | Workspace | Chat (Realtime), files, assignments, session notes, recording ingest from Drive |
| **5** | Trust & policies | Dispute flow, reporting, content moderation, anti-disintermediation guards, **WhatsApp bot rollout (5a–5f)** |
| **6** | Admin | Verification queue, dispute queue, live session monitor, audit log viewer, content CMS |
| **7** | Growth | Referrals, reviews, payouts, re-engagement automations |
| **8** | Payments | Stripe + Safepay (PK), payout pipeline, invoice generation |

### WhatsApp sub-phases (within Phase 5)

- **5a** — BSP integration, phone verification on signup, template approvals submitted
- **5b** — Outbound reminder template + confirm/cancel buttons
- **5c** — Reschedule flow (button-driven, no NLU)
- **5d** — NLU layer via Claude Haiku 4.5 for free-text understanding
- **5e** — Demo-request flow via WhatsApp (funnel win — book without leaving WhatsApp)
- **5f** — Support escalation (bot → human)

## Open questions to resolve before Phase 1

1. **Trial model** — free demo, paid trial, or first-lesson money-back? Affects funnel + onboarding copy.
2. **Pre-enrollment messaging** — block entirely (Preply-style) or allow 1-2 messages (italki-style)? Tradeoff: anti-disintermediation vs conversion.
3. **Commission structure** — fixed % or sliding scale (first lesson higher)? Affects payout schema.
4. **Subscription model** — included in v1 or deferred to Phase 7? Affects billing scope.
5. **Gender preference filter** — include from day one or hold? Culturally relevant but ethically nuanced; needs deliberate framing.
6. **Group classes** — confirmed v1 is 1:1 only? (Currently assumed yes.)
