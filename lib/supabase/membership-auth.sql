-- Incremental member-auth migration. Existing member IDs, hashes and cookies remain valid.
create extension if not exists pgcrypto;
alter table public.destiny_members add column if not exists email_verified_at timestamptz;

create table if not exists public.destiny_member_password_resets (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.destiny_members(id) on delete cascade,
  token_hash text not null unique check (length(token_hash) = 64),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists destiny_member_password_resets_member_idx
  on public.destiny_member_password_resets(member_id);

create table if not exists public.destiny_auth_rate_limits (
  key_hash text primary key check (length(key_hash) = 64),
  window_start timestamptz not null,
  hits integer not null check (hits > 0),
  updated_at timestamptz not null default now()
);

-- Atomic shared counters: no per-instance production throttling fallback.
create or replace function public.destiny_auth_consume_rate_limit(
  p_key text, p_limit integer, p_window_seconds integer
) returns table (allowed boolean, retry_after integer)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_start timestamptz;
  v_hits integer;
begin
  if length(p_key) <> 64 or p_limit < 1 or p_limit > 1000 or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid authentication throttle parameters';
  end if;
  v_start := to_timestamp(floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds);
  insert into public.destiny_auth_rate_limits(key_hash, window_start, hits)
    values(p_key, v_start, 1)
  on conflict(key_hash) do update set
    hits = case when destiny_auth_rate_limits.window_start = v_start then destiny_auth_rate_limits.hits + 1 else 1 end,
    window_start = v_start,
    updated_at = clock_timestamp()
  returning hits into v_hits;
  return query select v_hits <= p_limit,
    greatest(1, ceil(extract(epoch from (v_start + make_interval(secs => p_window_seconds) - clock_timestamp())))::integer);
end;
$$;

-- The token is consumed and old sessions are revoked in the same transaction.
create or replace function public.destiny_auth_reset_password(
  p_token_hash text, p_password_salt text, p_password_hash text
) returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_member_id uuid;
begin
  if length(p_token_hash) <> 64 or length(p_password_salt) <> 22 or length(p_password_hash) <> 43 then
    return false;
  end if;
  select member_id into v_member_id from public.destiny_member_password_resets
    where token_hash = p_token_hash and used_at is null and expires_at > clock_timestamp();
  if not found then return false; end if;
  perform id from public.destiny_members where id = v_member_id for update;
  if not found then return false; end if;
  update public.destiny_member_password_resets set used_at = clock_timestamp()
    where token_hash = p_token_hash and used_at is null and expires_at > clock_timestamp();
  if not found then return false; end if;
  update public.destiny_members set
    password_salt = p_password_salt, password_hash = p_password_hash,
    session_token_hash = null, session_expires_at = null,
    email_verified_at = clock_timestamp(), updated_at = clock_timestamp()
    where id = v_member_id;
  update public.destiny_member_password_resets set used_at = clock_timestamp()
    where member_id = v_member_id and used_at is null;
  return true;
end;
$$;

-- These tables contain credentials or private birth/report data. Only trusted
-- server endpoints using the service role may read them; no browser policies.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'destiny_members', 'saved_reports', 'users', 'birth_records', 'reports',
    'destiny_member_password_resets', 'destiny_auth_rate_limits'
  ] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      execute format('revoke all on public.%I from public, anon, authenticated', table_name);
      execute format('grant all on public.%I to service_role', table_name);
    end if;
  end loop;
end $$;

revoke all on function public.destiny_auth_consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.destiny_auth_consume_rate_limit(text, integer, integer) to service_role;
revoke all on function public.destiny_auth_reset_password(text, text, text) from public, anon, authenticated;
grant execute on function public.destiny_auth_reset_password(text, text, text) to service_role;
