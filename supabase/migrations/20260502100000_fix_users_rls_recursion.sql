-- Fix: "infinite recursion detected in policy for relation users"
-- Run this in Supabase SQL Editor if you already applied the earlier migration.

drop policy if exists "users_select_admin_all" on public.users;

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

create policy "users_select_admin_all"
  on public.users
  for select
  to authenticated
  using (public.is_admin());
