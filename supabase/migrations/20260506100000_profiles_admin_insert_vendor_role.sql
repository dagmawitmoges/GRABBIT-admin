-- Admin portal creates vendor users with profiles.id = new auth user (not auth.uid()).
-- Without this policy, inserts fail when the admin session is still the admin account,
-- or triggers may create a stub row first — upsert in the app then needs admin UPDATE (already allowed).

drop policy if exists "profiles_insert_admin" on public.profiles;

create policy "profiles_insert_admin"
  on public.profiles
  for insert
  to authenticated
  with check (public.is_admin());
