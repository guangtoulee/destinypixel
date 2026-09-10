-- PACKOM Sales / 销售通 production schema
-- Run once in the Supabase SQL editor for the project configured on Vercel.
-- All application access uses the server-only service role key. No browser role
-- can read these tables directly.

create extension if not exists pgcrypto;

create table if not exists public.xs_companies (
  id text primary key,
  name text not null,
  name_en text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.xs_users (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.xs_companies(id) on delete cascade,
  email text not null,
  email_normalized text not null,
  name text not null,
  phone text not null default '',
  password_salt text not null,
  password_hash text not null,
  role text not null default 'sales' check (role in ('owner', 'admin', 'manager', 'sales')),
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  region text not null default '',
  territory text not null default '',
  job_title text not null default '',
  monthly_target numeric(14, 2) not null default 0 check (monthly_target >= 0),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, email_normalized)
);

create table if not exists public.xs_sessions (
  token_hash text primary key,
  user_id uuid not null references public.xs_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.xs_customers (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.xs_companies(id) on delete cascade,
  code text not null,
  name text not null,
  short_name text not null default '',
  channel text not null,
  tier text not null default 'B' check (tier in ('A', 'B', 'C')),
  status text not null default 'prospect' check (status in ('active', 'prospect', 'paused')),
  city text not null,
  address text not null,
  contact text not null,
  phone text not null default '',
  latitude double precision,
  longitude double precision,
  assigned_to uuid references public.xs_users(id) on delete set null,
  next_visit_at timestamptz,
  last_visit_at timestamptz,
  monthly_sales numeric(14, 2) not null default 0 check (monthly_sales >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, code)
);

create table if not exists public.xs_visits (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.xs_companies(id) on delete cascade,
  customer_id uuid not null references public.xs_customers(id) on delete restrict,
  salesperson_id uuid not null references public.xs_users(id) on delete restrict,
  scheduled_at timestamptz not null,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed', 'cancelled')),
  purpose text not null,
  check_in_at timestamptz,
  check_out_at timestamptz,
  check_in_latitude double precision,
  check_in_longitude double precision,
  notes text not null default '',
  display_score smallint check (display_score between 1 and 5),
  stock_status text not null default '',
  next_action text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.xs_products (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.xs_companies(id) on delete cascade,
  sku text not null,
  name_zh text not null,
  name_en text not null,
  specification text not null,
  price numeric(14, 2) not null check (price >= 0),
  active boolean not null default true,
  image text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, sku)
);

create table if not exists public.xs_orders (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.xs_companies(id) on delete cascade,
  order_no text not null,
  customer_id uuid not null references public.xs_customers(id) on delete restrict,
  salesperson_id uuid not null references public.xs_users(id) on delete restrict,
  items jsonb not null default '[]'::jsonb,
  amount numeric(14, 2) not null default 0 check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'fulfilled', 'cancelled')),
  notes text not null default '',
  reviewed_by uuid references public.xs_users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, order_no)
);

create table if not exists public.xs_company_settings (
  company_id text primary key references public.xs_companies(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.xs_audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.xs_companies(id) on delete cascade,
  actor_id uuid references public.xs_users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists xs_users_company_status_idx on public.xs_users(company_id, status);
create index if not exists xs_users_company_role_idx on public.xs_users(company_id, role);
create index if not exists xs_sessions_user_id_idx on public.xs_sessions(user_id);
create index if not exists xs_sessions_expires_at_idx on public.xs_sessions(expires_at);
create index if not exists xs_customers_company_assigned_idx on public.xs_customers(company_id, assigned_to);
create index if not exists xs_customers_company_status_idx on public.xs_customers(company_id, status);
create index if not exists xs_visits_company_schedule_idx on public.xs_visits(company_id, scheduled_at desc);
create index if not exists xs_visits_salesperson_schedule_idx on public.xs_visits(salesperson_id, scheduled_at desc);
create index if not exists xs_orders_company_created_idx on public.xs_orders(company_id, created_at desc);
create index if not exists xs_orders_salesperson_created_idx on public.xs_orders(salesperson_id, created_at desc);
create index if not exists xs_audit_company_created_idx on public.xs_audit_logs(company_id, created_at desc);

alter table public.xs_companies enable row level security;
alter table public.xs_users enable row level security;
alter table public.xs_sessions enable row level security;
alter table public.xs_customers enable row level security;
alter table public.xs_visits enable row level security;
alter table public.xs_products enable row level security;
alter table public.xs_orders enable row level security;
alter table public.xs_company_settings enable row level security;
alter table public.xs_audit_logs enable row level security;

revoke all on public.xs_companies from anon, authenticated;
revoke all on public.xs_users from anon, authenticated;
revoke all on public.xs_sessions from anon, authenticated;
revoke all on public.xs_customers from anon, authenticated;
revoke all on public.xs_visits from anon, authenticated;
revoke all on public.xs_products from anon, authenticated;
revoke all on public.xs_orders from anon, authenticated;
revoke all on public.xs_company_settings from anon, authenticated;
revoke all on public.xs_audit_logs from anon, authenticated;

grant all on public.xs_companies to service_role;
grant all on public.xs_users to service_role;
grant all on public.xs_sessions to service_role;
grant all on public.xs_customers to service_role;
grant all on public.xs_visits to service_role;
grant all on public.xs_products to service_role;
grant all on public.xs_orders to service_role;
grant all on public.xs_company_settings to service_role;
grant all on public.xs_audit_logs to service_role;

insert into public.xs_companies (id, name, name_en)
values ('packom-china', 'PACKOM 中国', 'PACKOM China')
on conflict (id) do update set name = excluded.name, name_en = excluded.name_en, updated_at = now();

insert into public.xs_company_settings (company_id, settings)
values (
  'packom-china',
  '{"companyName":"PACKOM 中国","companyNameEn":"PACKOM China","currency":"CNY","timezone":"Asia/Shanghai","visitRadiusMeters":500,"requireVisitLocation":true,"registrationEnabled":true}'::jsonb
)
on conflict (company_id) do nothing;

insert into public.xs_products
  (id, company_id, sku, name_zh, name_en, specification, price, active, image, sort_order)
values
  ('00000000-0000-4000-8000-000000000001', 'packom-china', 'JAKE-MINT-PEP', 'Jake 无糖薄荷含片', 'Jake Sugar-free Peppermint', '14.4g × 12 盒', 238, true, '/candy/jake-mints.jpg', 10),
  ('00000000-0000-4000-8000-000000000002', 'packom-china', 'JAKE-VIT-CIT', 'Jake 维生素糖果', 'Jake Vitamincandy Citrus', '18g × 12 盒', 298, true, '/candy/jake-candy.jpg', 20),
  ('00000000-0000-4000-8000-000000000003', 'packom-china', 'WHOLE-SLEEP', 'Whole Sleep 睡眠含片', 'Whole Sleep Lozenges', '15 片 × 10 盒', 569, true, '/candy/whole-sleep.jpg', 30),
  ('00000000-0000-4000-8000-000000000004', 'packom-china', 'WHOLE-GASTRO', 'Whole Gastro 餐后含片', 'Whole Gastro Lozenges', '12 片 × 10 盒', 529, true, '/candy/whole-gastro.png', 40)
on conflict (company_id, sku) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  specification = excluded.specification,
  price = excluded.price,
  active = excluded.active,
  image = excluded.image,
  sort_order = excluded.sort_order,
  updated_at = now();
