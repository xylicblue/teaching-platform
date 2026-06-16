-- ─── 002_rls.sql ─────────────────────────────────────────────────────────────
-- Run AFTER 001_schema.sql

-- ─── profiles ─────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Public catalog needs to read tutor profiles; everyone can read
create policy "profiles: read all"
  on public.profiles for select
  using (true);

-- Users update their own row but cannot self-escalate role or status
create policy "profiles: update own (no escalation)"
  on public.profiles for update
  using  (auth.uid() = id)
  with check (
    auth.uid() = id
    and role   = (select role   from public.profiles where id = auth.uid())
    and status = (select status from public.profiles where id = auth.uid())
  );

-- ─── teacher_applications ─────────────────────────────────────────────────────
alter table public.teacher_applications enable row level security;

create policy "teacher_applications: insert own"
  on public.teacher_applications for insert
  with check (auth.uid() = user_id);

create policy "teacher_applications: select own or admin"
  on public.teacher_applications for select
  using (
    auth.uid() = user_id
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Only admins change status / write review notes
create policy "teacher_applications: update admin only"
  on public.teacher_applications for update
  using  ((select role from public.profiles where id = auth.uid()) = 'admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');

-- ─── notifications ────────────────────────────────────────────────────────────
alter table public.notifications enable row level security;

create policy "notifications: select own"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users can only mark their own notifications as read (update read_at)
create policy "notifications: update own"
  on public.notifications for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- INSERT is done by triggers (security definer) or service-role Edge Functions only.

-- ─── Storage: teacher-documents bucket ───────────────────────────────────────
-- Create the bucket first in Supabase dashboard (Storage → New bucket):
--   Name: teacher-documents | Public: OFF

-- Then run these storage policies:
create policy "cnic: upload own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'teacher-documents'
    and (storage.foldername(name))[1] = 'cnic'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "cnic: read own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'teacher-documents'
    and (storage.foldername(name))[1] = 'cnic'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "cnic: admin read all"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'teacher-documents'
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );
