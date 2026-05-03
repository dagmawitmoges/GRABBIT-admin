-- Admin action queue: platform_issues
-- Vendor feedback: vendor_reviews (ratings + text; optional deal link)

-- ---------------------------------------------------------------------------
-- platform_issues
-- ---------------------------------------------------------------------------
create table if not exists public.platform_issues (
  id uuid primary key default gen_random_uuid(),
  issue_type text not null default 'other'
    constraint platform_issues_issue_type_check
    check (
      issue_type in (
        'vendor_onboarding',
        'order_dispute',
        'reported_listing',
        'account_abuse',
        'payment',
        'other'
      )
    ),
  status text not null default 'open'
    constraint platform_issues_status_check
    check (status in ('open', 'in_progress', 'resolved', 'dismissed')),
  title text not null,
  description text,
  reporter_id uuid references public.profiles (id) on delete set null,
  subject_vendor_id uuid references public.profiles (id) on delete set null,
  subject_deal_id uuid references public.deals (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists platform_issues_status_idx
  on public.platform_issues (status)
  where status in ('open', 'in_progress');

create index if not exists platform_issues_created_idx
  on public.platform_issues (created_at desc);

create index if not exists platform_issues_subject_vendor_idx
  on public.platform_issues (subject_vendor_id)
  where subject_vendor_id is not null;

-- ---------------------------------------------------------------------------
-- vendor_reviews (customers rate vendors; optional deal context)
-- ---------------------------------------------------------------------------
create table if not exists public.vendor_reviews (
  id uuid primary key default gen_random_uuid(),
  vendor_user_id uuid not null references public.profiles (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  deal_id uuid references public.deals (id) on delete set null,
  rating smallint not null,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendor_reviews_rating_check check (rating >= 1 and rating <= 5)
);

create index if not exists vendor_reviews_vendor_idx
  on public.vendor_reviews (vendor_user_id, created_at desc);

create unique index if not exists vendor_reviews_reviewer_deal_unique
  on public.vendor_reviews (reviewer_id, deal_id)
  where deal_id is not null;

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
create or replace function public.touch_platform_issues_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists platform_issues_set_updated_at on public.platform_issues;
create trigger platform_issues_set_updated_at
  before update on public.platform_issues
  for each row
  execute procedure public.touch_platform_issues_updated_at();

create or replace function public.touch_vendor_reviews_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vendor_reviews_set_updated_at on public.vendor_reviews;
create trigger vendor_reviews_set_updated_at
  before update on public.vendor_reviews
  for each row
  execute procedure public.touch_vendor_reviews_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: platform_issues
-- ---------------------------------------------------------------------------
alter table public.platform_issues enable row level security;

drop policy if exists "platform_issues_select_admin" on public.platform_issues;
create policy "platform_issues_select_admin"
  on public.platform_issues
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "platform_issues_select_reporter" on public.platform_issues;
create policy "platform_issues_select_reporter"
  on public.platform_issues
  for select
  to authenticated
  using (reporter_id = auth.uid());

drop policy if exists "platform_issues_insert_authenticated" on public.platform_issues;
create policy "platform_issues_insert_authenticated"
  on public.platform_issues
  for insert
  to authenticated
  with check (
    reporter_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "platform_issues_update_admin" on public.platform_issues;
create policy "platform_issues_update_admin"
  on public.platform_issues
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- RLS: vendor_reviews
-- ---------------------------------------------------------------------------
alter table public.vendor_reviews enable row level security;

drop policy if exists "vendor_reviews_select" on public.vendor_reviews;
create policy "vendor_reviews_select"
  on public.vendor_reviews
  for select
  to authenticated
  using (
    public.is_admin()
    or vendor_user_id = auth.uid()
    or reviewer_id = auth.uid()
  );

drop policy if exists "vendor_reviews_insert" on public.vendor_reviews;
create policy "vendor_reviews_insert"
  on public.vendor_reviews
  for insert
  to authenticated
  with check (reviewer_id = auth.uid());

drop policy if exists "vendor_reviews_update_admin" on public.vendor_reviews;
create policy "vendor_reviews_update_admin"
  on public.vendor_reviews
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "vendor_reviews_delete_admin" on public.vendor_reviews;
create policy "vendor_reviews_delete_admin"
  on public.vendor_reviews
  for delete
  to authenticated
  using (public.is_admin());
