-- GlaceTech – database setup (PIN login, own-records access)
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Then run the employee seed file (kept outside the repo, it contains the PINs).
--
-- Security model
-- • Every employee logs in with a unique 4-digit PIN (stored only as a bcrypt hash).
-- • A login creates a session token that expires after 24 hours.
-- • The app never touches the tables directly. It calls the functions below with
--   its session token; they check who is asking:
--     technician → only their own reports / vouchers
--     admin      → everyone's, but the technician name on a record never changes.
-- • Wrong PINs are rate-limited per network address.

create extension if not exists pgcrypto with schema extensions;

-- ─────────────────────────────────────────────────────────────
-- 1. Tables
-- ─────────────────────────────────────────────────────────────
create table if not exists public.employees (
  id         uuid primary key default gen_random_uuid(),
  code       text unique,                  -- employee code, e.g. 010001 (admins may have none)
  name       text not null,
  role       text not null default 'technician' check (role in ('technician', 'admin')),
  pin_hash   text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  token       uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);

create table if not exists public.login_attempts (
  id bigserial primary key,
  ip text not null,
  at timestamptz not null default now()
);
create index if not exists login_attempts_ip_at_idx on public.login_attempts (ip, at);

-- One row per saved report or voucher.
create table if not exists public.records (
  id          uuid primary key default gen_random_uuid(),
  record_type text not null check (record_type in ('service', 'breakdown', 'voucher')),
  ref_no      text,          -- Report No. / Voucher No. as entered on the form
  client      text,          -- report client, or the clients on a voucher's rows
  owner_id    uuid not null references public.employees (id),
  owner_name  text not null, -- technician who created it (never changes)
  record_date date,
  data        jsonb not null default '{}'::jsonb,  -- all form values, signatures included
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists records_owner_idx       on public.records (owner_id);
create index if not exists records_record_date_idx on public.records (record_date desc);

-- Lock the tables: the public key cannot read or write them directly.
alter table public.employees      enable row level security;
alter table public.sessions       enable row level security;
alter table public.login_attempts enable row level security;
alter table public.records        enable row level security;
revoke all on public.employees, public.sessions, public.login_attempts, public.records from anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. Managing employees (run from the SQL Editor only)
-- ─────────────────────────────────────────────────────────────

-- select add_employee('010001', 'ANSARI MOHD FAISAL SHAMIM', 'technician', '4821');
create or replace function public.add_employee(p_code text, p_name text, p_role text, p_pin text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
begin
  if p_pin !~ '^\d{4}$' then
    raise exception 'PIN must be exactly 4 digits';
  end if;
  if exists (select 1 from employees where pin_hash = crypt(p_pin, pin_hash)) then
    raise exception 'PIN % is already used by another employee', p_pin;
  end if;
  insert into employees (code, name, role, pin_hash)
  values (nullif(p_code, ''), p_name, p_role, crypt(p_pin, gen_salt('bf')))
  returning id into v_id;
  return v_id;
end;
$$;

-- select set_employee_pin('EBENAZER JEBASEELAN', '5930');   (code or exact name)
create or replace function public.set_employee_pin(p_code_or_name text, p_pin text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
begin
  if p_pin !~ '^\d{4}$' then
    raise exception 'PIN must be exactly 4 digits';
  end if;
  select id into v_id from employees where code = p_code_or_name or name = p_code_or_name;
  if v_id is null then
    raise exception 'No employee %', p_code_or_name;
  end if;
  if exists (select 1 from employees where id <> v_id and pin_hash = crypt(p_pin, pin_hash)) then
    raise exception 'PIN % is already used by another employee', p_pin;
  end if;
  update employees set pin_hash = crypt(p_pin, gen_salt('bf')) where id = v_id;
  delete from sessions where employee_id = v_id;  -- log out everywhere
end;
$$;

revoke execute on function public.add_employee(text, text, text, text) from public, anon, authenticated;
revoke execute on function public.set_employee_pin(text, text) from public, anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3. Login / session
-- ─────────────────────────────────────────────────────────────

-- Returns {"ok": true, "token", "expires_at", "employee": {...}}
--      or {"ok": false, "error": "INVALID_PIN" | "TOO_MANY_ATTEMPTS"}.
-- (Errors are returned, not raised, so failed attempts are recorded.)
create or replace function public.login(p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_headers json := nullif(current_setting('request.headers', true), '')::json;
  v_ip      text;
  v_emp     employees;
  v_token   uuid;
  v_expires timestamptz := now() + interval '1 day';
begin
  v_ip := coalesce(
    v_headers ->> 'cf-connecting-ip',
    nullif(trim(split_part(v_headers ->> 'x-forwarded-for', ',', 1)), ''),
    'unknown'
  );

  -- Housekeeping
  delete from login_attempts where at < now() - interval '1 day';
  delete from sessions where expires_at < now();

  -- At most 5 wrong PINs per 15 minutes from one network address.
  if (select count(*) from login_attempts where ip = v_ip and at > now() - interval '15 minutes') >= 5 then
    return jsonb_build_object('ok', false, 'error', 'TOO_MANY_ATTEMPTS');
  end if;

  if coalesce(p_pin, '') ~ '^\d{4}$' then
    select * into v_emp from employees e
    where e.active and e.pin_hash = crypt(p_pin, e.pin_hash)
    limit 1;
  end if;

  if v_emp.id is null then
    insert into login_attempts (ip) values (v_ip);
    return jsonb_build_object('ok', false, 'error', 'INVALID_PIN');
  end if;

  insert into sessions (employee_id, expires_at) values (v_emp.id, v_expires) returning token into v_token;

  return jsonb_build_object(
    'ok', true,
    'token', v_token,
    'expires_at', v_expires,
    'employee', jsonb_build_object('id', v_emp.id, 'code', v_emp.code, 'name', v_emp.name, 'role', v_emp.role)
  );
end;
$$;

-- The employee behind a valid session, or error SESSION_EXPIRED.
create or replace function public._session_employee(p_token uuid)
returns employees
language plpgsql
security definer
set search_path = public
as $$
declare
  v employees;
begin
  select e.* into v
  from sessions s
  join employees e on e.id = s.employee_id
  where s.token = p_token and s.expires_at > now() and e.active;
  if v.id is null then
    raise exception 'SESSION_EXPIRED';
  end if;
  return v;
end;
$$;
revoke execute on function public._session_employee(uuid) from public, anon, authenticated;

create or replace function public.whoami(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v employees := _session_employee(p_token);
begin
  return jsonb_build_object(
    'expires_at', (select expires_at from sessions where token = p_token),
    'employee', jsonb_build_object('id', v.id, 'code', v.code, 'name', v.name, 'role', v.role)
  );
end;
$$;

create or replace function public.logout(p_token uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from sessions where token = p_token;
$$;

-- ─────────────────────────────────────────────────────────────
-- 4. Reports and vouchers
-- ─────────────────────────────────────────────────────────────

-- Technicians see their own records; admins see all (optionally one technician's).
create or replace function public.list_records(
  p_token  uuid,
  p_client text default null,
  p_number text default null,
  p_type   text default null,
  p_from   date default null,
  p_to     date default null,
  p_owner  uuid default null
)
returns table (
  id uuid, record_type text, ref_no text, client text, owner_id uuid, owner_name text,
  record_date date, created_at timestamptz, updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v employees := _session_employee(p_token);
begin
  return query
  select r.id, r.record_type, r.ref_no, r.client, r.owner_id, r.owner_name, r.record_date, r.created_at, r.updated_at
  from records r
  where (v.role = 'admin' or r.owner_id = v.id)
    and (p_owner is null or r.owner_id = p_owner)
    and (coalesce(p_client, '') = '' or position(lower(p_client) in lower(coalesce(r.client, ''))) > 0)
    and (coalesce(p_number, '') = '' or position(lower(p_number) in lower(coalesce(r.ref_no, ''))) > 0)
    and (coalesce(p_type, '') = '' or r.record_type = p_type)
    and (p_from is null or r.record_date >= p_from)
    and (p_to is null or r.record_date <= p_to)
  order by r.record_date desc nulls last, r.created_at desc
  limit 200;
end;
$$;

create or replace function public.get_record(p_token uuid, p_id uuid)
returns setof records
language plpgsql
security definer
set search_path = public
as $$
declare
  v employees := _session_employee(p_token);
begin
  return query
  select r.* from records r
  where r.id = p_id and (v.role = 'admin' or r.owner_id = v.id);
  if not found then
    raise exception 'NOT_FOUND';
  end if;
end;
$$;

-- The technician name inside the form data always matches the record's owner.
create or replace function public._with_owner_name(p_type text, p_data jsonb, p_name text)
returns jsonb
language sql
immutable
as $$
  select case
    when p_type = 'voucher' then jsonb_set(coalesce(p_data, '{}'::jsonb), '{name}', to_jsonb(p_name))
    else jsonb_set(coalesce(p_data, '{}'::jsonb), '{technicianName}', to_jsonb(p_name))
  end;
$$;
revoke execute on function public._with_owner_name(text, jsonb, text) from public, anon, authenticated;

create or replace function public.create_record(
  p_token  uuid,
  p_type   text,
  p_ref_no text,
  p_client text,
  p_date   date,
  p_data   jsonb
)
returns setof records
language plpgsql
security definer
set search_path = public
as $$
declare
  v employees := _session_employee(p_token);
begin
  if p_type not in ('service', 'breakdown', 'voucher') then
    raise exception 'INVALID_TYPE';
  end if;
  return query
  insert into records (record_type, ref_no, client, owner_id, owner_name, record_date, data)
  values (
    p_type, nullif(p_ref_no, ''), nullif(p_client, ''), v.id, v.name,
    coalesce(p_date, current_date), _with_owner_name(p_type, p_data, v.name)
  )
  returning *;
end;
$$;

create or replace function public.update_record(
  p_token  uuid,
  p_id     uuid,
  p_type   text,
  p_ref_no text,
  p_client text,
  p_date   date,
  p_data   jsonb
)
returns setof records
language plpgsql
security definer
set search_path = public
as $$
declare
  v employees := _session_employee(p_token);
  r records;
begin
  select * into r from records where id = p_id for update;
  if r.id is null or not (v.role = 'admin' or r.owner_id = v.id) then
    raise exception 'NOT_FOUND';
  end if;
  -- A report can switch between Service and Breakdown, but never become a voucher (or back).
  if p_type not in ('service', 'breakdown', 'voucher') or (p_type = 'voucher') <> (r.record_type = 'voucher') then
    raise exception 'INVALID_TYPE';
  end if;
  return query
  update records set
    record_type = p_type,
    ref_no      = nullif(p_ref_no, ''),
    client      = nullif(p_client, ''),
    record_date = coalesce(p_date, r.record_date),
    data        = _with_owner_name(p_type, p_data, r.owner_name),  -- owner never changes
    updated_at  = now()
  where id = p_id
  returning *;
end;
$$;

-- Admins only: employee list for the "Technician" filter.
create or replace function public.list_employees(p_token uuid)
returns table (id uuid, code text, name text, role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v employees := _session_employee(p_token);
begin
  if v.role <> 'admin' then
    raise exception 'NOT_ALLOWED';
  end if;
  return query select e.id, e.code, e.name, e.role from employees e where e.active order by e.name;
end;
$$;

-- What the app (public key) may call.
grant execute on function public.login(text) to anon;
grant execute on function public.whoami(uuid) to anon;
grant execute on function public.logout(uuid) to anon;
grant execute on function public.list_records(uuid, text, text, text, date, date, uuid) to anon;
grant execute on function public.get_record(uuid, uuid) to anon;
grant execute on function public.create_record(uuid, text, text, text, date, jsonb) to anon;
grant execute on function public.update_record(uuid, uuid, text, text, text, date, jsonb) to anon;
grant execute on function public.list_employees(uuid) to anon;
