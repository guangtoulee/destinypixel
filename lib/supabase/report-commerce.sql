-- Apply after main-site-baseline.sql and membership-auth.sql. No existing report content is removed.
begin;
create table if not exists public.destiny_report_access (
  report_id uuid primary key references public.reports(id) on delete cascade,
  member_id uuid references public.destiny_members(id),
  guest_token_hash text,
  guest_expires_at timestamptz,
  created_at timestamptz not null default now(),
  check (member_id is not null or guest_token_hash is not null)
);
create index if not exists destiny_report_access_member_idx on public.destiny_report_access(member_id);

create table if not exists public.destiny_report_orders (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id),
  member_id uuid not null references public.destiny_members(id),
  paypal_order_id text unique,
  capture_id text unique,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null check (currency = 'USD'),
  mode text not null check (mode in ('sandbox','live')),
  status text not null default 'created' check (status in ('created','pending','completed','refunded','reversed','denied')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists destiny_report_orders_member_idx on public.destiny_report_orders(member_id,created_at desc);
create index if not exists destiny_report_orders_report_idx on public.destiny_report_orders(report_id,member_id,status);
alter table public.destiny_report_orders add column if not exists checkout_retired_at timestamptz;
create table if not exists public.destiny_payment_events (
  id text primary key,
  event_type text not null,
  order_id uuid references public.destiny_report_orders(id),
  created_at timestamptz not null default now()
);
create table if not exists public.destiny_report_generations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  kind text not null check (kind in ('natal','transit')),
  locale text not null check (locale in ('en','zh','zh-TW','ru')),
  target_year integer not null default 0,
  status text not null default 'running' check (status in ('running','ready','error')),
  content text,
  attempts integer not null default 1,
  lease_token uuid not null default gen_random_uuid(),
  lease_expires_at timestamptz not null default now() + interval '2 minutes',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_id,kind,locale,target_year)
);

create or replace function public.destiny_create_private_report(p_payload jsonb, p_member uuid, p_guest_hash text)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := gen_random_uuid(); bid uuid := gen_random_uuid(); rid uuid := gen_random_uuid(); b jsonb := p_payload->'birth';
begin
  if p_member is null and (p_guest_hash is null or length(p_guest_hash) <> 64) then raise exception 'missing owner'; end if;
  insert into users(id,name) values(uid,b->>'name');
  insert into birth_records(id,user_id,name,gender,locale,birth_date,birth_time,birth_place,latitude,longitude,timezone,true_solar_time)
  values(bid,uid,b->>'name',b->>'gender',b->>'locale',(b->>'birthDate')::date,(b->>'birthTime')::time,b->>'birthPlace',(b->>'latitude')::double precision,(b->>'longitude')::double precision,b->>'timezone',b->>'trueSolarTime');
  insert into reports(id,user_id,birth_record_id,bazi_data,astro_data,ai_content,status)
  values(rid,uid,bid,p_payload->'bazi',p_payload->'astro',p_payload->'aiContent','ai_pending');
  insert into destiny_report_access(report_id,member_id,guest_token_hash,guest_expires_at)
  values(rid,p_member,case when p_member is null then p_guest_hash else null end,case when p_member is null then now()+interval '7 days' else null end);
  return rid;
end $$;

create or replace function public.destiny_claim_report(p_report uuid, p_member uuid, p_guest_hash text)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
declare row destiny_report_access;
begin
  if p_member is null then return false; end if;
  select * into row from destiny_report_access where report_id=p_report for update;
  if not found then return false; end if;
  if row.member_id=p_member then return true; end if;
  if row.member_id is not null or p_guest_hash is null or length(p_guest_hash)<>64
    or row.guest_token_hash is distinct from p_guest_hash
    or row.guest_expires_at is null or row.guest_expires_at<=clock_timestamp() then return false; end if;
  update destiny_report_access set member_id=p_member,guest_token_hash=null,guest_expires_at=null where report_id=p_report;
  return true;
end $$;

-- Lock the owner row before finding/creating an order so repeated checkout
-- requests share one local ID (also used as the provider idempotency key).
-- Amount, currency and mode are trusted server configuration, never browser data.
create or replace function public.destiny_begin_checkout(p_report uuid,p_member uuid,p_amount integer,p_currency text,p_mode text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare owner_id uuid; checkout_row destiny_report_orders;
begin
  if p_member is null or p_amount is null or p_amount<=0 or p_currency is distinct from 'USD'
    or p_mode is null or p_mode not in ('sandbox','live') then raise exception 'invalid checkout'; end if;
  select member_id into owner_id from destiny_report_access where report_id=p_report for update;
  if not found or owner_id is distinct from p_member then raise exception 'report access denied'; end if;
  if exists(select 1 from destiny_report_orders where report_id=p_report and member_id=p_member and mode=p_mode and status='completed') then
    raise exception 'report already purchased';
  end if;
  select * into checkout_row from destiny_report_orders
    where report_id=p_report and member_id=p_member and mode=p_mode and status in ('created','pending')
    order by created_at desc,id desc limit 1;
  if found then return to_jsonb(checkout_row); end if;
  insert into destiny_report_orders(report_id,member_id,amount_cents,currency,mode)
    values(p_report,p_member,p_amount,p_currency,p_mode) returning * into checkout_row;
  return to_jsonb(checkout_row);
end $$;

-- Capture enters a non-replaceable state before any provider request. Holding
-- the order lock serializes this transition against checkout replacement.
create or replace function public.destiny_prepare_capture(p_order uuid,p_member uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare checkout_row destiny_report_orders;
begin
  if p_member is null then raise exception 'order access denied'; end if;
  select * into checkout_row from destiny_report_orders where id=p_order and member_id=p_member for update;
  if not found then raise exception 'order access denied'; end if;
  if checkout_row.status='created' then
    update destiny_report_orders set status='pending',updated_at=clock_timestamp() where id=p_order returning * into checkout_row;
  end if;
  return to_jsonb(checkout_row);
end $$;

-- Only call after a fresh authenticated Orders GET explicitly returns VOIDED
-- with the original order identity. A 404, timeout or local age is not proof.
-- Owner-then-order locking matches begin_checkout and makes replacement atomic.
create or replace function public.destiny_replace_voided_checkout(p_order uuid,p_member uuid,p_paypal_order text,p_amount integer,p_currency text,p_mode text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare target_report uuid; owner_id uuid; checkout_row destiny_report_orders;
begin
  if p_member is null or p_paypal_order is null then raise exception 'checkout replacement denied'; end if;
  select report_id into target_report from destiny_report_orders where id=p_order and member_id=p_member;
  if not found then raise exception 'checkout replacement denied'; end if;
  select member_id into owner_id from destiny_report_access where report_id=target_report for update;
  if not found or owner_id is distinct from p_member then raise exception 'checkout replacement denied'; end if;
  select * into checkout_row from destiny_report_orders where id=p_order for update;
  if checkout_row.paypal_order_id is distinct from p_paypal_order or checkout_row.mode is distinct from p_mode then
    raise exception 'checkout replacement denied';
  end if;
  if checkout_row.checkout_retired_at is null then
    if checkout_row.status<>'created' or checkout_row.capture_id is not null or checkout_row.created_at>clock_timestamp()-interval '3 hours' then
      raise exception 'checkout replacement denied';
    end if;
    update destiny_report_orders set status='denied',checkout_retired_at=clock_timestamp(),updated_at=clock_timestamp() where id=p_order;
  elsif checkout_row.status<>'denied' or checkout_row.capture_id is not null then
    raise exception 'checkout replacement denied';
  end if;
  return destiny_begin_checkout(target_report,p_member,p_amount,p_currency,p_mode);
end $$;

create or replace function public.destiny_apply_payment(p_order uuid,p_paypal_order text,p_capture text,p_amount integer,p_currency text,p_state text,p_event_id text default null,p_event_type text default null)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare row destiny_report_orders;
begin
  select * into row from destiny_report_orders where id=p_order for update;
  if not found or p_paypal_order is null or length(trim(p_paypal_order))=0
    or row.paypal_order_id is distinct from p_paypal_order
    or row.amount_cents is distinct from p_amount or row.currency is distinct from p_currency then raise exception 'payment mismatch'; end if;
  if p_capture is null or length(trim(p_capture))=0
    or (row.capture_id is not null and row.capture_id is distinct from p_capture) then raise exception 'capture mismatch'; end if;
  if p_state is null or p_state not in ('pending','completed','refunded','reversed','denied') then raise exception 'invalid state'; end if;
  if p_event_id is not null then
    if length(trim(p_event_id))=0 or p_event_type is null or length(trim(p_event_type))=0 then raise exception 'invalid payment event'; end if;
    insert into destiny_payment_events(id,event_type,order_id) values(p_event_id,p_event_type,p_order) on conflict do nothing;
    if not found then
      if not exists(select 1 from destiny_payment_events where id=p_event_id and order_id=p_order and event_type=p_event_type) then
        raise exception 'payment event mismatch';
      end if;
      return row.status='completed';
    end if;
  end if;
  -- A delayed capture event must never restore access after a refund/reversal.
  if row.status in ('refunded','reversed','denied') and p_state in ('pending','completed') then return false; end if;
  if row.status='completed' and p_state='pending' then return true; end if;
  update destiny_report_orders set capture_id=coalesce(capture_id,p_capture),status=p_state,updated_at=now() where id=p_order;
  return p_state='completed';
end $$;

create or replace function public.destiny_claim_generation(p_report uuid,p_kind text,p_locale text,p_year integer)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare row destiny_report_generations;
begin
  insert into destiny_report_generations(report_id,kind,locale,target_year) values(p_report,p_kind,p_locale,p_year) on conflict do nothing;
  if found then select * into row from destiny_report_generations where report_id=p_report and kind=p_kind and locale=p_locale and target_year=p_year; return jsonb_build_object('state','claimed','id',row.id,'leaseToken',row.lease_token); end if;
  select * into row from destiny_report_generations where report_id=p_report and kind=p_kind and locale=p_locale and target_year=p_year for update;
  if row.status='ready' then return jsonb_build_object('state','ready','content',row.content); end if;
  if row.status='running' and row.lease_expires_at>now() then return jsonb_build_object('state','running'); end if;
  if row.attempts>=5 then return jsonb_build_object('state','exhausted'); end if;
  update destiny_report_generations set status='running',attempts=attempts+1,lease_token=gen_random_uuid(),lease_expires_at=now()+interval '2 minutes',updated_at=now() where id=row.id returning * into row;
  return jsonb_build_object('state','claimed','id',row.id,'leaseToken',row.lease_token);
end $$;

-- Aggregate all stored records, not a paginated admin list. Sandbox transactions
-- are excluded from financial totals and live paid/pending order counts.
create or replace function public.destiny_admin_counts()
returns jsonb language sql security definer set search_path=public,pg_temp as $$
  select jsonb_build_object(
    'members',(select count(*) from destiny_members),
    'reports',(select count(*) from reports),
    'paidOrders',(select count(*) from destiny_report_orders where mode='live' and status='completed'),
    'pendingOrders',(select count(*) from destiny_report_orders where mode='live' and status in ('created','pending')),
    'revenue',coalesce((select jsonb_agg(jsonb_build_object('currency',currency,'amount',amount) order by currency) from (
      select currency,((sum(amount_cents)::numeric/100)::numeric(20,2))::text as amount
      from destiny_report_orders where mode='live' and status='completed' group by currency
    ) totals),'[]'::jsonb)
  );
$$;

alter table destiny_report_access enable row level security;
alter table destiny_report_orders enable row level security;
alter table destiny_payment_events enable row level security;
alter table destiny_report_generations enable row level security;
revoke all on destiny_report_access,destiny_report_orders,destiny_payment_events,destiny_report_generations from public,anon,authenticated;
grant all on destiny_report_access,destiny_report_orders,destiny_payment_events,destiny_report_generations to service_role;
revoke execute on function
  destiny_create_private_report(jsonb,uuid,text),destiny_claim_report(uuid,uuid,text),
  destiny_begin_checkout(uuid,uuid,integer,text,text),destiny_prepare_capture(uuid,uuid),
  destiny_replace_voided_checkout(uuid,uuid,text,integer,text,text),
  destiny_apply_payment(uuid,text,text,integer,text,text,text,text),
  destiny_claim_generation(uuid,text,text,integer),destiny_admin_counts()
  from public,anon,authenticated;
grant execute on function
  destiny_create_private_report(jsonb,uuid,text),destiny_claim_report(uuid,uuid,text),
  destiny_begin_checkout(uuid,uuid,integer,text,text),destiny_prepare_capture(uuid,uuid),
  destiny_replace_voided_checkout(uuid,uuid,text,integer,text,text),
  destiny_apply_payment(uuid,text,text,integer,text,text,text,text),
  destiny_claim_generation(uuid,text,text,integer),destiny_admin_counts()
  to service_role;
commit;
