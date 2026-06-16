-- ─── 003_triggers.sql ────────────────────────────────────────────────────────
-- Run AFTER 001_schema.sql

-- ─── updated_at helper ────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger trg_teacher_applications_updated_at
  before update on public.teacher_applications
  for each row execute procedure public.handle_updated_at();


-- ─── Auto-create profile row on auth.users insert ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, country, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name',
             split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'phone',
    coalesce(new.raw_user_meta_data ->> 'country', 'PK'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── Notify all admins when a teacher application is submitted ─────────────────
create or replace function public.notify_admins_new_application()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_admin_id uuid;
  v_name     text;
begin
  select trim(coalesce(first_name,'') || ' ' || coalesce(last_name,''))
  into   v_name
  from   public.profiles
  where  id = new.user_id;

  for v_admin_id in
    select id from public.profiles
    where role = 'admin' and status = 'active'
  loop
    insert into public.notifications
      (user_id, type, title, body, payload, action_url)
    values (
      v_admin_id,
      'teacher_application',
      'New teacher application',
      coalesce(nullif(trim(v_name),''), 'A user') || ' has applied to teach on Ustaad.',
      jsonb_build_object(
        'application_id', new.id,
        'applicant_id',   new.user_id,
        'applicant_name', v_name
      ),
      '/admin/applications/' || new.id::text
    );
  end loop;

  return new;
end;
$$;

create trigger trg_notify_admins_on_application
  after insert on public.teacher_applications
  for each row execute procedure public.notify_admins_new_application();


-- ─── Promote profile role on approval; notify applicant on decision ───────────
create or replace function public.handle_application_decision()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'approved' and old.status <> 'approved' then
    update public.profiles
    set role = 'teacher', status = 'active'
    where id = new.user_id;

    insert into public.notifications
      (user_id, type, title, body, action_url)
    values (
      new.user_id,
      'application_approved',
      'Your application has been approved!',
      'Welcome to Ustaad. You can now set up your profile and create your first course.',
      '/teacher/setup'
    );
  end if;

  if new.status = 'rejected' and old.status <> 'rejected' then
    insert into public.notifications
      (user_id, type, title, body)
    values (
      new.user_id,
      'application_rejected',
      'Update on your teacher application',
      coalesce(
        'Your application was not approved at this time. Reason: ' || new.rejection_reason,
        'Your application was not approved at this time. Please contact support for more information.'
      )
    );
  end if;

  return new;
end;
$$;

create trigger trg_application_decision
  after update of status on public.teacher_applications
  for each row execute procedure public.handle_application_decision();
