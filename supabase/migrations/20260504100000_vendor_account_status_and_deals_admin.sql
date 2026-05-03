-- Vendor posting/orders lock: account_status on vendor_profiles.
-- Deals: admin policies for listing and cancelling deals.

-- ---------------------------------------------------------------------------
-- vendor_profiles.account_status: active | suspended | banned
-- App/mobile should treat suspended/banned as blocked from new deals & orders.
-- ---------------------------------------------------------------------------
alter table public.vendor_profiles
  add column if not exists account_status text not null default 'active';

alter table public.vendor_profiles
  drop constraint if exists vendor_profiles_account_status_check;

alter table public.vendor_profiles
  add constraint vendor_profiles_account_status_check
  check (account_status in ('active', 'suspended', 'banned'));

-- ---------------------------------------------------------------------------
-- Optional moderation reason for admin-cancelled deals
-- ---------------------------------------------------------------------------
insert into public.deal_moderation_reasons (code, label)
values ('admin_cancelled', 'Cancelled by admin')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- deals: admin read/update (cancel deal, flags)
-- ---------------------------------------------------------------------------
alter table public.deals enable row level security;

drop policy if exists "deals_select_admin" on public.deals;
create policy "deals_select_admin"
  on public.deals
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "deals_update_admin" on public.deals;
create policy "deals_update_admin"
  on public.deals
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- vendor_profiles admin updates already allowed via vendor_profiles_update_admin in prior migration.
