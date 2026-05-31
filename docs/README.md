# Tutoring Platform — Design Docs

Living documentation for the tutoring platform we're building. Read in order on first pass; thereafter use as reference.

## Contents

1. [Project overview](./01-overview.md) — what we're building, who it's for, scope
2. [System architecture](./02-architecture.md) — tech stack, data model, subsystem decisions
3. [Features & roadmap](./03-features.md) — full feature list, competitive analogs, build phases
4. [WhatsApp bot](./04-whatsapp-bot.md) — reschedule flow, BSP choice, schema additions
5. [Design system](./05-design-system.md) — colors, typography, layout principles, motion
6. [Landing page brief](./06-landing-page-brief.md) — designer handoff document

## Status

Phase: **design / pre-implementation**. No code written yet.

## Decisions locked

- Stack: **React (JS) + Tailwind + Supabase + Netlify**
- Video: **Google Meet / Zoom via OAuth** (not in-app WebRTC)
- Recordings: **Google Drive ingest** (teacher uploads, platform fetches)
- Notifications: **email + in-app + WhatsApp** (Gupshup BSP, Pakistan-first)
- Parent/learner split accounts from day one
- Exam board awareness (CAIE, Edexcel, AQA) baked into schema
- Editorial / anti-AI design aesthetic — Fraunces + Inter, warm paper + evergreen + saffron

## How to use this folder

When making decisions, check the relevant doc first. If a decision changes, edit the doc in the same commit as the code. Don't let docs drift from reality — stale docs are worse than no docs.
