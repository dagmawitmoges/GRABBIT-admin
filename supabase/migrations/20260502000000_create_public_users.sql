-- public.users: app profile rows keyed to auth.users (required by admin login + vendor joins).
-- Run in Supabase: SQL Editor → New query → paste → Run.
-- If the table already exists, skip or adjust as needed.

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'vendor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_role_idx on public.users (lower(role));

alter table public.users enable row level security;

-- Own row (needed for login role check)
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using (auth.uid() = id);

-- Admins can read all rows (dashboard joins: vendors → users).
-- Must use SECURITY DEFINER: a subquery on public.users here causes RLS recursion.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and lower(u.role) = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "users_select_admin_all" on public.users;
create policy "users_select_admin_all"
  on public.users
  for select
  to authenticated
  using (public.is_admin());

-- New signups get a profile row (optional; safe if you only use Dashboard user management)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'vendor')
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- Existing auth users (created before this migration) need a matching row. Example:
-- insert into public.users (id, email, full_name, role)
-- select id, email, coalesce(raw_user_meta_data ->> 'full_name', ''), 'admin'
-- from auth.users
-- where email = 'your-admin@example.com'
-- on conflict (id) do update set role = excluded.role, email = excluded.email;
