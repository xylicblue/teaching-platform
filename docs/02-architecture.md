# 02 — System Architecture

## High-level diagram

```
┌─────────────────────────────────────────────────────────────┐
│            BROWSERS (Students / Teachers / Admins)           │
│         React SPA (Vite + Tailwind) hosted on Netlify        │
└─────────────────────────────────────────────────────────────┘
            │  HTTPS / WSS                  │  Video peer connections
            ▼                                ▼
┌──────────────────────────────┐   ┌──────────────────────────┐
│         SUPABASE             │   │  GOOGLE MEET / ZOOM      │
│  ┌────────────────────────┐  │   │  (rooms created via      │
│  │ Postgres + RLS         │  │   │   Calendar / Zoom API)   │
│  │ Auth (JWT)             │  │   └──────────────────────────┘
│  │ Realtime (pub/sub)     │  │
│  │ Storage                │  │   ┌──────────────────────────┐
│  │ Edge Functions (Deno)  │──┼──▶│  3RD-PARTY SERVICES      │
│  │ pg_cron                │  │   │  Resend (email)          │
│  └────────────────────────┘  │   │  Gupshup (WhatsApp)      │
└──────────────────────────────┘   │  Google Drive (recordings)│
                                   │  Anthropic (NLU)          │
                                   │  Stripe (later)           │
                                   │  Sentry / PostHog         │
                                   └──────────────────────────┘
```

The React SPA talks directly to Supabase for ~90% of operations. Edge Functions handle anything that must not run in the browser: teacher approval state changes, Meet/Zoom room creation, WhatsApp webhook handling, Drive ingest, payment webhooks, transactional emails.

## Why Supabase

It collapses what would otherwise be 5–6 separate services (DB, auth, realtime, file storage, edge compute, cron) into one. For a small team building an MVP, that's the difference between shipping in 8 weeks and 6 months.

Tradeoff: heavy lock-in. RLS-heavy designs are not portable. Accepted, since the alternative (custom backend) costs too much for the stage we're at.

## Data model

```
auth.users (Supabase managed)
profiles (1:1 with auth.users)
  ├─ role: enum('student','teacher','admin','parent')
  ├─ display_name, avatar_url, bio, phone, timezone
  └─ status: enum('active','pending','suspended')

teacher_details (1:1 where role='teacher')
  ├─ qualifications (jsonb), years_experience, intro_video_url
  ├─ hourly_rate, currency
  ├─ verified_id, verified_qualifications
  └─ approval_notes, approved_by, approved_at

student_details (1:1 where role='student')
  ├─ level (O / A / IGCSE), grade, exam_board
  ├─ parent_id (FK profiles)  ← null if adult learner
  └─ exam_session (e.g., 'June 2026')

parent_details (1:1 where role='parent')
  └─ guardian_relation, contact_preferences

categories  (O-levels, A-levels, IGCSE, IB, MYP)
  └─ id, name, slug, sort_order

streams  (Sciences, Humanities, Commerce, Languages, Mathematics)
  └─ id, category_id, name, slug

subjects  (Physics, Chemistry, Urdu, ...)
  └─ id, stream_id, name, slug, icon, exam_codes (jsonb)

courses
  ├─ id, teacher_id, subject_id, exam_board
  ├─ title, description, syllabus (jsonb), thumbnail_url
  ├─ price_per_session, session_duration_min
  └─ status: enum('draft','published','archived')

teacher_availability
  └─ teacher_id, weekday, start_time, end_time, timezone

demo_requests
  ├─ student_id, teacher_id, course_id, code  ← short code
  ├─ requested_slots (jsonb array of timestamps)
  ├─ status: enum('pending','accepted','declined','completed','no_show')
  └─ scheduled_at

enrollments
  ├─ student_id, teacher_id, course_id, code  ← E-XXXXXX
  ├─ status: enum('active','paused','completed','cancelled')
  ├─ started_at, ended_at
  └─ workspace_id  → workspaces.id

workspaces  (1 per active enrollment)
  └─ id, enrollment_id, drive_folder_id, created_at

sessions
  ├─ id, code (S-XXXXXX), workspace_id, scheduled_at, duration_min
  ├─ meeting_provider: enum('google_meet','zoom','manual')
  ├─ meeting_url, meeting_event_id, organizer_account_id
  ├─ status: enum('scheduled','live','completed','cancelled','no_show')
  ├─ version  ← optimistic lock
  └─ joined_by (jsonb)

reschedule_requests
  ├─ id, code (R-XXXXXX), session_id
  ├─ initiated_by, initiated_via: enum('whatsapp','web','admin')
  ├─ original_time, proposed_time
  ├─ status: enum('pending','approved','declined','expired','withdrawn','superseded')
  ├─ expires_at, policy_warning (jsonb)
  └─ resolved_at, resolved_by

messages  (workspace chat)
  └─ id, workspace_id, sender_id, body, attachments (jsonb), created_at

files  (binary in Supabase Storage)
  └─ id, workspace_id, uploader_id, storage_path, mime, size

recordings
  ├─ id, session_id, workspace_id
  ├─ source: enum('google_drive','manual_url')
  ├─ drive_file_id, drive_folder_id
  ├─ url, duration_sec, size_bytes
  ├─ uploaded_at, uploaded_by
  └─ visibility: enum('workspace','student_only','teacher_only')

assignments
  ├─ id, workspace_id, created_by, title, description, due_at
  └─ status

assignment_submissions
  └─ assignment_id, student_id, file_id, submitted_at, grade, feedback

reviews
  └─ student_id, teacher_id, rating, body, created_at

notifications
  └─ user_id, type, payload (jsonb), read_at, created_at

audit_log
  └─ actor_id, action, target_table, target_id, payload, created_at

oauth_connections
  ├─ user_id, provider (google / zoom)
  ├─ refresh_token (encrypted via Supabase Vault, server-only)
  └─ scopes, expires_at

whatsapp_identities
  ├─ user_id, phone_e164, verified_at
  └─ opt_in_marketing

whatsapp_conversations
  ├─ id, phone_e164, user_id
  ├─ flow, state (jsonb), context_session_id
  ├─ last_inbound_at, last_outbound_at
  └─ expires_at, closed_at

whatsapp_messages  (audit + debugging)
  └─ id, conversation_id, direction, message_type, payload, status

whatsapp_templates
  └─ name, category, language, body, buttons (jsonb), meta_status

wallets
  └─ user_id, balance, currency
wallet_transactions
  └─ wallet_id, type, amount, reference, created_at
```

## Short codes

Every session, enrollment, and reschedule request gets a 6-character base32 (Crockford) code: `S-7K2X9F`, `E-AB1234`, `R-XYZ123`. Stored alongside the UUID, indexed. Used for human-quotable references in WhatsApp, support, URLs.

## Security model (RLS)

Row Level Security is the single most important thing to get right with Supabase — it replaces a traditional API authorization layer.

Examples:
- `profiles`: user reads own + public fields of others; only admins write `role` and `status`.
- `courses`: anyone reads where `status='published'`; only owning teacher writes.
- `workspaces`, `messages`, `files`: only the enrolled student, parent (if student is minor), teacher, and admins.
- `oauth_connections.refresh_token`: never readable from client — Edge Functions only.

Policies live in `supabase/policies.sql` and are reviewed like code. Write RLS tests in `supabase/tests/` from day one.

## Subsystem decisions

| Subsystem | Approach |
|---|---|
| **Auth** | Supabase Auth, email+password and Google OAuth. Role stored in `profiles`. Custom JWT claim `role` set by an Auth Hook so RLS reads `auth.jwt() ->> 'role'` without joins. |
| **Realtime** | Supabase Realtime broadcast + presence, keyed `workspace:{id}`. Messages also persist in `messages` table. |
| **Live video** | Google Meet via Google Calendar API (event with `conferenceData.createRequest`). Zoom alternative via Zoom REST. Teacher OAuth required. |
| **Recordings** | Per-workspace Google Drive folder. Drive push notifications detect new uploads → Edge Function creates `recordings` row. |
| **File sharing** | Supabase Storage bucket per workspace, RLS on bucket. Direct browser upload with signed URLs. |
| **Notifications** | In-app rows in `notifications` + Realtime push. Email via Resend. WhatsApp via Gupshup. |
| **Scheduling** | UTC in DB, user-local on display. `date-fns-tz`. Generate `.ics` for "add to calendar". Google Calendar sync via OAuth. |
| **Search** | Postgres FTS + `pg_trgm` for fuzzy match. No external search service until >10k rows. |
| **Background jobs** | `pg_cron` for reminders (15-min, 24h), expiring reschedule requests, cleanup. |
| **Payments (later)** | Stripe internationally + Safepay (JazzCash/Easypaisa aggregator) for Pakistan. |
| **Observability** | Sentry (errors), PostHog (product analytics + session replay), Supabase logs. |

## Edge Functions inventory

These are the server-side endpoints that must exist:

- `POST /auth/role-claim` — sets role claim in JWT after signup
- `POST /teacher/approve` — admin-only, flips status to active
- `POST /sessions/create-meeting` — calls Google Calendar / Zoom to mint room
- `POST /sessions/cancel-meeting` — patches/cancels external event
- `POST /reschedule/approve` — applies the request, patches the meeting, fans out notifications
- `POST /reschedule/decline`
- `GET /drive/webhook` — Drive push notification receiver
- `POST /whatsapp/webhook` — Gupshup inbound message receiver
- `POST /whatsapp/send` — internal sender (called by reminder jobs, app triggers)
- `POST /payments/webhook` — Stripe webhook receiver (later)
- `POST /reports/create` — escalates to admin moderation queue

## Dev infrastructure

- GitHub repo + Actions for CI
- Supabase CLI for local dev DB and migration generation
- ESLint + Prettier + Husky + lint-staged
- Vitest for unit tests
- Playwright for E2E smoke tests (signup, browse, demo request, join class)
- Netlify Deploy Previews per PR

## Capacity / cost notes

- Supabase free tier: 500MB DB, 1GB storage, 50k MAU. Fine for early stage.
- Netlify free tier: 100GB bandwidth/month. Fine for launch.
- WhatsApp Cloud API: utility conversations ~$0.005 each in Pakistan; 1k free service conversations/month.
- Gupshup adds ~15–25% margin over Cloud API; worth it for easier onboarding in PK.
- Anthropic Haiku 4.5 NLU calls: ~$0.001 each. Negligible.
