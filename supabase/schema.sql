-- GlaceTech – database setup
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

-- ─────────────────────────────────────────────────────────────
-- 1. Records table: one row per saved report or voucher.
--    Searchable fields get their own columns; every form field lives in `data`.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.records (
  id          uuid primary key default gen_random_uuid(),
  record_type text not null check (record_type in ('service', 'breakdown', 'voucher')),
  ref_no      text,          -- Report No. / Voucher No. as entered on the form
  client      text,          -- report client, or the clients on a voucher's rows
  person      text,          -- technician (report) or name on the voucher
  record_date date,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists records_record_date_idx on public.records (record_date desc);
create index if not exists records_type_idx        on public.records (record_type);
create index if not exists records_client_idx      on public.records (lower(client));

-- Keep updated_at current on every edit
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists records_touch_updated_at on public.records;
create trigger records_touch_updated_at
  before update on public.records
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 2. Access rules. There is no login in this app, so the public (anon) key
--    may list, create and edit records. Deleting is NOT allowed from the app;
--    remove rows from the Supabase dashboard if ever needed.
-- ─────────────────────────────────────────────────────────────
alter table public.records enable row level security;

-- Table access for the app's public key (needed on projects that do not
-- expose new tables automatically). Row Level Security below still applies.
grant usage on schema public to anon;
grant select, insert, update on public.records to anon;

drop policy if exists "anon can read records"   on public.records;
drop policy if exists "anon can create records" on public.records;
drop policy if exists "anon can edit records"   on public.records;

create policy "anon can read records"   on public.records for select to anon using (true);
create policy "anon can create records" on public.records for insert to anon with check (true);
create policy "anon can edit records"   on public.records for update to anon using (true) with check (true);

-- ─────────────────────────────────────────────────────────────
-- 3. Signature images: private storage bucket "signatures".
--    Files are saved as signatures/<record id>/<field>-<time>.png and opened
--    through short-lived signed links (never public URLs).
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('signatures', 'signatures', false, 1048576, array['image/png', 'image/webp', 'image/jpeg'])
on conflict (id) do nothing;

drop policy if exists "anon can read signatures"    on storage.objects;
drop policy if exists "anon can upload signatures"  on storage.objects;
drop policy if exists "anon can replace signatures" on storage.objects;

create policy "anon can read signatures"
  on storage.objects for select to anon
  using (bucket_id = 'signatures');

create policy "anon can upload signatures"
  on storage.objects for insert to anon
  with check (bucket_id = 'signatures');

create policy "anon can replace signatures"
  on storage.objects for update to anon
  using (bucket_id = 'signatures')
  with check (bucket_id = 'signatures');
