create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.birth_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  gender text,
  locale text not null default 'en',
  birth_date date not null,
  birth_time time not null,
  birth_place text not null,
  latitude double precision not null,
  longitude double precision not null,
  timezone text not null default 'Asia/Shanghai',
  true_solar_time text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  birth_record_id uuid not null references public.birth_records(id) on delete cascade,
  bazi_data jsonb not null,
  astro_data jsonb not null,
  ai_content jsonb not null,
  status text not null default 'ai_ready',
  created_at timestamptz not null default now()
);

alter table public.birth_records add column if not exists gender text;
alter table public.birth_records add column if not exists locale text not null default 'en';
alter table public.reports alter column status set default 'ai_ready';

create index if not exists birth_records_user_id_idx on public.birth_records(user_id);
create index if not exists reports_user_id_idx on public.reports(user_id);
create index if not exists reports_birth_record_id_idx on public.reports(birth_record_id);
create index if not exists reports_created_at_idx on public.reports(created_at desc);

create table if not exists public.english_members (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  username_normalized text not null unique,
  password_salt text not null,
  password_hash text not null,
  session_token_hash text,
  session_expires_at timestamptz,
  progress jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists english_members_username_normalized_idx
  on public.english_members(username_normalized);
create index if not exists english_members_session_token_hash_idx
  on public.english_members(session_token_hash);
create index if not exists english_members_updated_at_idx
  on public.english_members(updated_at desc);

-- Test-mode policies for the custom username/password English learning page.
-- The app API hashes passwords server-side and talks to this table through REST.
-- For a stricter production setup, prefer SUPABASE_SERVICE_ROLE_KEY on the server
-- and remove these anon policies.
alter table public.english_members enable row level security;

drop policy if exists english_members_test_select on public.english_members;
drop policy if exists english_members_test_insert on public.english_members;
drop policy if exists english_members_test_update on public.english_members;

create policy english_members_test_select
  on public.english_members for select
  to anon
  using (true);

create policy english_members_test_insert
  on public.english_members for insert
  to anon
  with check (true);

create policy english_members_test_update
  on public.english_members for update
  to anon
  using (true)
  with check (true);

grant usage on schema public to anon;
grant select, insert, update on public.english_members to anon;

create table if not exists public.destiny_members (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null unique,
  name text,
  password_salt text not null,
  password_hash text not null,
  session_token_hash text,
  session_expires_at timestamptz,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_reports (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.destiny_members(id) on delete cascade,
  report_id text not null,
  title text not null,
  locale text not null default 'en',
  report_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, report_id)
);

create index if not exists destiny_members_email_normalized_idx
  on public.destiny_members(email_normalized);
create index if not exists destiny_members_session_token_hash_idx
  on public.destiny_members(session_token_hash);
create index if not exists saved_reports_member_id_idx
  on public.saved_reports(member_id);
create index if not exists saved_reports_updated_at_idx
  on public.saved_reports(updated_at desc);

create table if not exists public.prompt_items (
  id text primary key,
  title text not null,
  description text not null,
  prompt text not null,
  negative_prompt text not null,
  image_url text,
  video_url text,
  source_url text,
  source_type text not null default 'manual',
  author_name text,
  author_handle text,
  created_at timestamptz not null default now(),
  imported_at timestamptz not null default now(),
  tags text[] not null default '{}'::text[],
  model_hints text[] not null default '{}'::text[],
  style text not null default '',
  lighting text not null default '',
  camera text not null default '',
  palette text not null default '',
  mood text not null default '',
  composition text not null default '',
  aspect_ratio text not null default 'auto',
  language text not null default 'zh',
  content_type text not null default 'image',
  metrics jsonb not null default '{}'::jsonb,
  compliance_note text,
  raw_text text
);

create index if not exists prompt_items_created_at_idx
  on public.prompt_items(created_at desc);
create index if not exists prompt_items_source_type_idx
  on public.prompt_items(source_type);
create index if not exists prompt_items_content_type_idx
  on public.prompt_items(content_type);
