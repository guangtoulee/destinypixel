-- Main-site baseline. Run only after reviewing the existing schema and roles.
-- Creates missing main-site tables ONLY. No ALTER of an existing table; no
-- English/Prompt table, policy, grant or data changes. Requires Supabase roles
-- and pg_catalog.gen_random_uuid(). Existing schema drift requires a separately
-- reviewed additive migration; this baseline will not silently repair it.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$ begin
  if to_regclass('public.users') is null then
    create table public.users (
      id uuid primary key default gen_random_uuid(),name text not null,email text,
      created_at timestamptz not null default now()
    );
    alter table public.users enable row level security;
    revoke all on public.users from public,anon,authenticated;
    grant all on public.users to service_role;
  end if;
end $$;

do $$ begin
  if to_regclass('public.birth_records') is null then
    create table public.birth_records (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references public.users(id) on delete cascade,
      name text not null,gender text,locale text not null default 'en',
      birth_date date not null,birth_time time not null,birth_place text not null,
      latitude double precision not null,longitude double precision not null,
      timezone text not null default 'Asia/Shanghai',true_solar_time text not null,
      created_at timestamptz not null default now()
    );
    create index birth_records_user_id_idx on public.birth_records(user_id);
    alter table public.birth_records enable row level security;
    revoke all on public.birth_records from public,anon,authenticated;
    grant all on public.birth_records to service_role;
  end if;
end $$;

do $$ begin
  if to_regclass('public.reports') is null then
    create table public.reports (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references public.users(id) on delete cascade,
      birth_record_id uuid not null references public.birth_records(id) on delete cascade,
      bazi_data jsonb not null,astro_data jsonb not null,ai_content jsonb not null,
      status text not null default 'ai_ready',created_at timestamptz not null default now()
    );
    create index reports_user_id_idx on public.reports(user_id);
    create index reports_birth_record_id_idx on public.reports(birth_record_id);
    create index reports_created_at_idx on public.reports(created_at desc);
    alter table public.reports enable row level security;
    revoke all on public.reports from public,anon,authenticated;
    grant all on public.reports to service_role;
  end if;
end $$;

do $$ begin
  if to_regclass('public.destiny_members') is null then
    create table public.destiny_members (
      id uuid primary key default gen_random_uuid(),email text not null,
      email_normalized text not null unique,name text,password_salt text not null,
      password_hash text not null,session_token_hash text,session_expires_at timestamptz,
      plan text not null default 'free',created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create index destiny_members_session_token_hash_idx on public.destiny_members(session_token_hash);
    alter table public.destiny_members enable row level security;
    revoke all on public.destiny_members from public,anon,authenticated;
    grant all on public.destiny_members to service_role;
  end if;
end $$;

do $$ begin
  if to_regclass('public.saved_reports') is null then
    create table public.saved_reports (
      id uuid primary key default gen_random_uuid(),
      member_id uuid not null references public.destiny_members(id) on delete cascade,
      report_id text not null,title text not null,locale text not null default 'en',
      report_snapshot jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
      unique(member_id,report_id)
    );
    create index saved_reports_member_id_idx on public.saved_reports(member_id);
    create index saved_reports_updated_at_idx on public.saved_reports(updated_at desc);
    alter table public.saved_reports enable row level security;
    revoke all on public.saved_reports from public,anon,authenticated;
    grant all on public.saved_reports to service_role;
  end if;
end $$;

commit;
