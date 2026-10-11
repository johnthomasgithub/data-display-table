-- Only needed if you ran the FIRST version of schema.sql (without PIN login).
-- Run this BEFORE the new schema.sql.
--
-- It closes the old public access and moves the old test records aside as
-- public.records_v1_backup (they have no owner, so they cannot be shown to
-- anyone). Drop that table once you no longer need it:
--   drop table public.records_v1_backup;

do $$
begin
  if to_regclass('public.records') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'records' and column_name = 'owner_id'
     ) then
    drop policy if exists "anon can read records"   on public.records;
    drop policy if exists "anon can create records" on public.records;
    drop policy if exists "anon can edit records"   on public.records;
    revoke all on public.records from anon, authenticated;
    alter table public.records rename to records_v1_backup;
    drop trigger if exists records_touch_updated_at on public.records_v1_backup;
  end if;

  -- Signatures now live inside each record; close the old storage bucket.
  if to_regclass('storage.objects') is not null then
    drop policy if exists "anon can read signatures"    on storage.objects;
    drop policy if exists "anon can upload signatures"  on storage.objects;
    drop policy if exists "anon can replace signatures" on storage.objects;
  end if;
end;
$$;

drop function if exists public.touch_updated_at();
