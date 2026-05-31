# 01 — Project Overview

## What we're building

A tutoring marketplace for **O-level and A-level students in Pakistan and the broader South Asian region**. Students browse a curriculum-aware catalog, pick a teacher, request a free demo class, and enroll. The platform handles everything around the live session — chat, files, assignments, scheduling, recordings — while the live class itself runs on Google Meet or Zoom.

## Three roles

| Role | What they do |
|---|---|
| **Student** (or parent on their behalf) | Browses catalog, requests demos, enrolls with teachers, uses workspace, attends sessions |
| **Teacher** | Registers (with admin approval), builds profile, creates courses, sets availability, runs sessions |
| **Admin** | Approves teachers, monitors enrollments + live sessions, handles disputes, manages content |

## Core feature areas

1. **Public catalog** — Level → Stream → Subject browsing, with exam board filtering (CAIE, Edexcel, AQA)
2. **Teacher registration & profiles** — qualifications, verification, courses, availability
3. **Discovery & funnel** — featured tutors, filters, wishlist, demo class CTA
4. **Demo request & enrollment** — slot picking, package vs. single, wallet
5. **Workspace** — chat (Supabase Realtime), files (Supabase Storage), assignments, session notes, recording archive
6. **Live class** — Google Meet/Zoom link created via OAuth + Calendar API
7. **WhatsApp bot** — reschedule, reminders, demo requests via WhatsApp
8. **Admin oversight** — verification queue, live monitor, dispute handling, audit log
9. **Trust & policy enforcement** — anti-disintermediation, cancellation policies, reviews

## Market context

- Buyers are typically **parents**, consumers are **students** → parent/learner account split is essential from day one.
- WhatsApp is the dominant communication channel — non-negotiable as a notification channel.
- Exam boards matter as much as subjects — students filter on CAIE vs Edexcel vs AQA.
- Cultural sensitivities exist (e.g., gender preference filtering) — handle carefully.
- Competitive analogs: **Preply, italki, Vedantu, Unacademy, Outschool**.

## Tech stack at a glance

| Layer | Choice |
|---|---|
| Frontend | React 18 (JS) + Vite + Tailwind + shadcn/ui |
| State / data | TanStack Query + Supabase JS client |
| Backend | Supabase (Postgres + Auth + Realtime + Storage + Edge Functions) |
| Hosting | Netlify |
| Video | Google Meet / Zoom via OAuth |
| Recordings | Google Drive ingest via Drive API |
| Email | Resend |
| WhatsApp | Gupshup (BSP) → eventually WhatsApp Cloud API direct |
| NLU (bot) | Claude Haiku 4.5 |
| Observability | Sentry + PostHog |

## What is explicitly out of scope (for now)

- Native mobile apps (PWA only at launch)
- Live group classes / cohorts (1:1 first; group later)
- In-app whiteboard (Meet's is fine)
- Multi-language UI (English at launch; Urdu later)
- Payments (Phase 8) — early enrollments handled manually

## Status

Design phase. No code written yet. Build kickoff pending finalization of the landing page brief and the data model.
