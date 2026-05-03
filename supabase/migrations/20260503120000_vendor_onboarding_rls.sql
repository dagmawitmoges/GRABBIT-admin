-- RLS for admin dashboard + "Add vendor" flow.
--
-- After auth.signUp(), the client session is usually the NEW vendor, not the admin.
-- Uploads run as admin; inserts (locations, profiles, vendor_profiles, …) run as the new user.
-- Policies below allow that user to create only their own rows; admins keep full access via is_admin().

-- ---------------------------------------------------------------------------
-- is_admin(): use public.profiles (user_role enum → text, case-insensitive)
-- Keeps working if you still mirror admins in public.users (optional second check).
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and lower(p.role::text) = 'admin'
    )
    or (
      exists (
        select 1
        from information_schema.tables t
        where t.table_schema = 'public'
          and t.table_name = 'users'
      )
      and exists (
        select 1
        from public.users u
        where u.id = auth.uid()
          and lower(u.role) = 'admin'
      )
    );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to service_role;

-- ---------------------------------------------------------------------------
-- locations (new branch rows created during vendor signup)
-- ---------------------------------------------------------------------------
alter table public.locations enable row level security;

drop policy if exists "locations_insert_authenticated" on public.locations;
create policy "locations_insert_authenticated"
  on public.locations
  for insert
  to authenticated
  with check (true);

drop policy if exists "locations_select_authenticated" on public.locations;
create policy "locations_select_authenticated"
  on public.locations
  for select
  to authenticated
  using (true);

drop policy if exists "locations_update_admin" on public.locations;
create policy "locations_update_admin"
  on public.locations
  for update
  to authenticated
  using (public.is_admin())
  with check (true);

drop policy if exists "locations_delete_admin" on public.locations;
create policy "locations_delete_admin"
  on public.locations
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- vendor_profiles
-- ---------------------------------------------------------------------------
alter table public.vendor_profiles enable row level security;

drop policy if exists "vendor_profiles_insert_own" on public.vendor_profiles;
create policy "vendor_profiles_insert_own"
  on public.vendor_profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "vendor_profiles_select_own" on public.vendor_profiles;
create policy "vendor_profiles_select_own"
  on public.vendor_profiles
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "vendor_profiles_select_admin" on public.vendor_profiles;
create policy "vendor_profiles_select_admin"
  on public.vendor_profiles
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "vendor_profiles_update_own" on public.vendor_profiles;
create policy "vendor_profiles_update_own"
  on public.vendor_profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "vendor_profiles_update_admin" on public.vendor_profiles;
create policy "vendor_profiles_update_admin"
  on public.vendor_profiles
  for update
  to authenticated
  using (public.is_admin());

drop policy if exists "vendor_profiles_delete_admin" on public.vendor_profiles;
create policy "vendor_profiles_delete_admin"
  on public.vendor_profiles
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- vendor_branches
-- ---------------------------------------------------------------------------
alter table public.vendor_branches enable row level security;

drop policy if exists "vendor_branches_insert_own" on public.vendor_branches;
create policy "vendor_branches_insert_own"
  on public.vendor_branches
  for insert
  to authenticated
  with check (vendor_user_id = auth.uid());

drop policy if exists "vendor_branches_select_own" on public.vendor_branches;
create policy "vendor_branches_select_own"
  on public.vendor_branches
  for select
  to authenticated
  using (vendor_user_id = auth.uid());

drop policy if exists "vendor_branches_select_admin" on public.vendor_branches;
create policy "vendor_branches_select_admin"
  on public.vendor_branches
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "vendor_branches_update_own" on public.vendor_branches;
create policy "vendor_branches_update_own"
  on public.vendor_branches
  for update
  to authenticated
  using (vendor_user_id = auth.uid())
  with check (vendor_user_id = auth.uid());

drop policy if exists "vendor_branches_update_admin" on public.vendor_branches;
create policy "vendor_branches_update_admin"
  on public.vendor_branches
  for update
  to authenticated
  using (public.is_admin());

drop policy if exists "vendor_branches_delete_admin" on public.vendor_branches;
create policy "vendor_branches_delete_admin"
  on public.vendor_branches
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- vendor_documents
-- ---------------------------------------------------------------------------
alter table public.vendor_documents enable row level security;

drop policy if exists "vendor_documents_insert_own" on public.vendor_documents;
create policy "vendor_documents_insert_own"
  on public.vendor_documents
  for insert
  to authenticated
  with check (vendor_user_id = auth.uid());

drop policy if exists "vendor_documents_select_own" on public.vendor_documents;
create policy "vendor_documents_select_own"
  on public.vendor_documents
  for select
  to authenticated
  using (vendor_user_id = auth.uid());

drop policy if exists "vendor_documents_select_admin" on public.vendor_documents;
create policy "vendor_documents_select_admin"
  on public.vendor_documents
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "vendor_documents_update_admin" on public.vendor_documents;
create policy "vendor_documents_update_admin"
  on public.vendor_documents
  for update
  to authenticated
  using (public.is_admin());

drop policy if exists "vendor_documents_delete_admin" on public.vendor_documents;
create policy "vendor_documents_delete_admin"
  on public.vendor_documents
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: vendor-certificates (uploads run as admin before signUp)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('vendor-certificates', 'vendor-certificates', true)
on conflict (id) do nothing;

drop policy if exists "vendor_certificates_select" on storage.objects;
create policy "vendor_certificates_select"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'vendor-certificates');

drop policy if exists "vendor_certificates_insert" on storage.objects;
create policy "vendor_certificates_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'vendor-certificates');

drop policy if exists "vendor_certificates_update" on storage.objects;
create policy "vendor_certificates_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'vendor-certificates')
  with check (bucket_id = 'vendor-certificates');

drop policy if exists "vendor_certificates_delete" on storage.objects;
create policy "vendor_certificates_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'vendor-certificates');
