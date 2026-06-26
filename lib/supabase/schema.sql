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
