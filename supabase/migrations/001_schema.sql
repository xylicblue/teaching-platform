-- ─── 001_schema.sql ─────────────────────────────────────────────────────────
-- Run this first in the Supabase SQL editor (Dashboard → SQL Editor → New query)

create extension if not exists "uuid-ossp";

-- ─── PROFILES (1:1 with auth.users) ──────────────────────────────────────────
create table public.profiles (
  id            uuid        references auth.users(id) on delete cascade primary key,
  role          text        not null default 'student'
                              check (role in ('student','teacher','admin','parent')),
  first_name    text,
  last_name     text,
  display_name  text        generated always as (
                              trim(coalesce(first_name,'') || ' ' || coalesce(last_name,''))
                            ) stored,
  avatar_url    text,
  phone         text,
  country       text        not null default 'PK',
  timezone      text        not null default 'Asia/Karachi',
  status        text        not null default 'active'
                              check (status in ('active','pending','suspended')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is
  '1:1 extension of auth.users. role drives RBAC; status tracks account state.';

-- ─── TEACHER APPLICATIONS ─────────────────────────────────────────────────────
create table public.teacher_applications (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null unique
                                    references public.profiles(id) on delete cascade,
  status              text        not null default 'pending'
                                    check (status in ('pending','approved','rejected','info_requested')),

  -- Personal
  first_name          text        not null,
  last_name           text,
  date_of_birth       date,
  gender              text        check (gender in ('male','female','prefer_not_to_say')),
  city                text,
  country             text        not null default 'PK',
  phone               text        not null,

  -- Professional
  education           jsonb       not null default '[]',
  -- [{degree, field, institution, year}]
  years_exp           smallint    not null default 0
                                    check (years_exp >= 0 and years_exp < 60),
  teaching_levels     text[]      not null default '{}',
  -- e.g. {O-Level, A-Level, IGCSE, IB}
  subjects_interest   jsonb       not null default '[]',
  -- [{name, exam_boards: []}]
  exam_boards         text[]      not null default '{}',
  bio                 text,

  -- Identity verification
  cnic_number         text        not null,
  cnic_front_path     text,   -- supabase storage path (private)
  cnic_back_path      text,

  -- Admin review
  admin_notes         text,
  rejection_reason    text,
  reviewed_by         uuid        references public.profiles(id),
  reviewed_at         timestamptz,

  submitted_at        timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index on public.teacher_applications(status);
create index on public.teacher_applications(user_id);

comment on table public.teacher_applications is
  'Teacher onboarding applications. Unique per user. status: pending → approved|rejected|info_requested.';

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
create table public.notifications (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  type        text        not null,  -- e.g. teacher_application, session_reminder
  title       text        not null,
  body        text,
  payload     jsonb       not null default '{}',
  action_url  text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index on public.notifications(user_id, read_at);
create index on public.notifications(created_at desc);

comment on table public.notifications is
  'In-app notification rows. read_at = null means unread. INSERT is done by triggers or Edge Functions only.';
