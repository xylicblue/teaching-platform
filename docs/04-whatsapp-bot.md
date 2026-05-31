# 04 — WhatsApp Bot

## Purpose

WhatsApp is the dominant communication channel in Pakistan and the broader South Asian market. Users will trust a WhatsApp interaction more than an email or in-app notification. The bot is a **first-class channel** for time-sensitive interactions — reminders, reschedule, demo requests, support escalation.

The bot is a **channel**, not a feature. The underlying business logic (reschedule state machine, demo request flow) lives in Edge Functions and Postgres tables. The bot is one of several front-ends to that engine. The same engine serves the in-app flow and the admin-initiated flow.

## Short codes

Every session, enrollment, and reschedule request gets a 6-character Crockford base32 code:

- `S-7K2X9F` — session
- `E-AB1234` — enrollment
- `R-XYZ123` — reschedule request

Generated at creation, never reused, indexed. Stored on the row alongside the UUID. Used in WhatsApp messages, URLs, support tickets.

UUIDs stay internal. Codes are the **handle**, not the source of truth — the bot identifies sessions primarily by conversation context (the sender's upcoming sessions), with codes as a fallback ("I want to reschedule `S-7K2X9F`").

## Reschedule flow — UX walkthrough

### Outbound reminder (24h before, automated)

Pre-approved Meta template:

```
Hi Ali 👋
Reminder: Physics with Mr. Hassan
Tomorrow (Tue) at 5:00 PM
Join: meet.google.com/xyz-abc-def

[Confirm]  [Reschedule]  [Cancel]
```

### Student rescheduling

```
User taps [Reschedule]

Bot:  Here are Mr. Hassan's open slots this week:

      📅 Wed 7 May
         • 4:00 PM
         • 6:00 PM
      📅 Thu 8 May
         • 5:00 PM
         • 7:00 PM
      📅 [See more times]

User taps "Thu 8 May, 5:00 PM"

Bot:  Reschedule:
      ❌ Tue 6 May, 5:00 PM
      ✅ Thu 8 May, 5:00 PM

      Confirm? [Yes, send request] [Cancel]

User: Yes

Bot:  Done ✅ — Mr. Hassan has been asked to approve.
      I'll message you when he responds.
```

### Teacher side

Outside the 24h WhatsApp service window, the bot sends a pre-approved template:

```
Reschedule request from Ali (Physics)
From: Tue 6 May, 5:00 PM
To:   Thu 8 May, 5:00 PM

[Approve] [Decline] [Suggest another time]

Teacher taps [Approve]

Bot to teacher:  Confirmed. Calendar updated.
Bot to student:  ✅ Approved! Class moved to Thu 8 May, 5 PM.
                 New link: meet.google.com/xyz-abc-def
                 Added to your Google Calendar.
```

### Key behaviours

1. **Both sides get the same Meet link** — the Google Calendar event is *patched*, not recreated, so the `conferenceData` (and therefore the Meet URL) is preserved.
2. **Cancellation policy enforced inside the bot, not after.** If the reschedule is <12h before, the bot warns first: *"This is less than 12 hours before. Per our policy, this counts as a late reschedule. Continue?"*
3. **Slot list is real** — pulled from `teacher_availability` minus existing sessions. The bot only shows actual openings.

## Natural-language fallback

Users will type instead of tapping. The bot uses **Claude Haiku 4.5** (one API call, ~500ms, ~$0.001) to extract intent + slots from free text:

```
User: "can we move thursday's class to friday same time"

Bot:  I think you mean: move Thu 8 May → Fri 9 May, 5:00 PM?
      [Yes that's right] [No, choose another slot]
```

Worth doing from day one — it's the difference between a usable bot and one users abandon. Especially important in Pakistan where users routinely code-switch between Urdu and English.

## Reschedule as a first-class entity

```
reschedule_requests
  ├─ id, code, session_id (FK)
  ├─ initiated_by → profiles.id
  ├─ initiated_via → enum('whatsapp','web','admin')
  ├─ original_time, proposed_time
  ├─ status → enum('pending','approved','declined',
  │                'withdrawn','expired','superseded')
  ├─ expires_at (auto-expire after 24h)
  ├─ policy_warning (jsonb)  e.g., { late_reschedule: true }
  └─ resolved_at, resolved_by
```

### State machine

```
            ┌──────────┐    teacher approves     ┌──────────┐
  create →  │ pending  │ ──────────────────────► │ approved │
            └──────────┘                         └──────────┘
              │  │  │
              │  │  └─ teacher declines  ──►  declined
              │  └──── student withdraws ──►  withdrawn
              └─────── 24h no response  ──►  expired

  If session already has a pending request → new request is
  superseded on creation (or the old one is auto-withdrawn).
```

### On approval

An Edge Function:
1. Updates `sessions.scheduled_at`
2. Calls Google Calendar API to patch the event time (Meet link preserved)
3. Writes in-app notifications + sends WhatsApp confirmations to both parties
4. Logs to `audit_log`

## Tech stack additions

| Concern | Pick | Why |
|---|---|---|
| **BSP (Business Solution Provider)** | **Gupshup** (primary) | Best Pakistan/SA onboarding story. Migrate to WhatsApp Cloud API direct once volume justifies. |
| **Webhook handler** | Supabase Edge Function `/whatsapp/webhook` | Signature-verified inbound message receiver. |
| **Outbound sender** | Edge Function wrapper around Gupshup REST | Centralized; every send logged. |
| **Conversation state** | Postgres tables | No Redis yet — Postgres is fast enough for this volume. |
| **Template management** | `whatsapp_templates` table mirrored from Meta dashboard | Templates need 24-48h Meta approval; track which are live. |
| **NLU** | Claude Haiku 4.5 via Anthropic API | Fast, cheap, handles Urdu/English code-switching well. |
| **Phone verification** | OTP via WhatsApp Cloud API on signup | Binds account ↔ number. |

## Schema additions

```
whatsapp_identities
  ├─ user_id (FK profiles), phone_e164
  ├─ verified_at, verification_method
  └─ opt_in_marketing (default false — keep utility separate)

whatsapp_conversations  (state machine for in-progress bot flows)
  ├─ id, phone_e164, user_id
  ├─ flow: enum('reschedule','demo_request','support', …)
  ├─ state (jsonb)  current step + collected slots
  ├─ context_session_id (nullable)
  ├─ last_inbound_at, last_outbound_at
  ├─ expires_at  (24h sliding window)
  └─ closed_at

whatsapp_messages  (audit + debugging)
  ├─ id, conversation_id, direction, message_type
  ├─ payload (jsonb)  raw Meta/Gupshup payload
  ├─ template_name (nullable)
  ├─ status, error
  └─ created_at

whatsapp_templates
  ├─ name, category, language
  ├─ body, buttons (jsonb), variables (jsonb)
  ├─ meta_status  (approved/pending/rejected)
  └─ version
```

`whatsapp_messages` becomes invaluable when users say "I told the bot to cancel but nothing happened" — the raw payload is the source of truth.

## Policies the bot enforces

| Rule | Bot behaviour |
|---|---|
| Reschedule cutoff (default 12h) | Warns first; user confirms; logged as `late_reschedule` |
| Cancellation cutoff (default 24h) | Same warning; may forfeit credit per policy |
| Max reschedules per session (default 2) | Refuses; suggests cancel + rebook |
| Teacher response SLA (2h nudge, 24h expire) | Auto-nudge → auto-expire → notify student |
| Outside teacher availability | Slot not shown |
| Already a pending request | "You already have a request in flight — want to withdraw it?" |
| Identity mismatch (number not bound) | Bot asks to verify via app first; refuses session actions |
| Group class reschedule | "I can't reschedule group classes here — please use the app" |

Rules live in a config table or `policy.js` module — same source of truth as the in-app flow.

## Edge cases

1. **Race condition** — student and teacher both initiate at the same instant. Optimistic lock via `sessions.version`; second one gets "session was just updated, please refresh."
2. **Both Confirm AND Reschedule tapped** from one reminder. Use the most recent action; bot apologizes for confusion.
3. **WhatsApp 24h window expires mid-flow.** Bot can't re-engage with a free message. Have a dedicated `reschedule_followup` template ready.
4. **Time zones** — student in PKT, teacher elsewhere. Display each user's local time; store UTC.
5. **Number portability / shared phones** — periodic re-verification; treat binding as revocable.
6. **Bot abuse** — rate-limit to 30 messages/min per phone. Block on flood; surface to admin.
7. **Compliance** — WhatsApp Business Policy forbids unsolicited messages outside service window without a template. Marketing requires explicit opt-in (kept separate from utility opt-in).

## Build phases for the bot (slots into Phase 5)

| Sub-phase | What |
|---|---|
| **5a** | BSP integration, phone verification on signup, template approvals submitted |
| **5b** | Outbound reminder template + confirm/cancel buttons |
| **5c** | Reschedule flow — button-driven, no NLU |
| **5d** | NLU layer via Claude Haiku 4.5 |
| **5e** | Demo-request flow via WhatsApp |
| **5f** | Support escalation (bot → human) |

Schema (`reschedule_requests`, short codes) lands earlier — in **Phase 3 (Booking & enrollment)** — so the in-app version exists first and the bot is bolted onto an already-working engine.
