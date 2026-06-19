-- BJ ELECTRONICS Supabase schema
-- Run this in Supabase SQL Editor before connecting the frontend.
-- For demo/admin testing, permissive anon policies are included. Harden RLS before accepting real payments/customer data.

create table if not exists categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  icon text default '📦',
  description text,
  active boolean default true,
  sort_order integer default 0
);

create table if not exists products (
  id text primary key,
  sku text unique,
  name text not null,
  slug text unique not null,
  category_slug text references categories(slug) on update cascade,
  brand text,
  description text,
  specs jsonb default '{}'::jsonb,
  image text default '📦',
  price numeric(12,2) not null default 0,
  compare_at_price numeric(12,2) default 0,
  discount_percent integer default 0,
  stock integer default 0,
  low_stock_threshold integer default 10,
  rating numeric(3,2) default 4.5,
  review_count integer default 0,
  featured boolean default false,
  flash_deal boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists customers (
  id text primary key,
  name text not null,
  phone text,
  email text,
  address text,
  total_orders integer default 0,
  total_spent numeric(12,2) default 0,
  last_order_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists orders (
  id text primary key,
  order_number text unique not null,
  customer_name text not null,
  phone text not null,
  email text,
  division text,
  district text,
  area text,
  address text,
  delivery_zone text default 'inside_dhaka',
  payment_method text default 'COD',
  payment_status text default 'Pending',
  order_status text default 'Processing',
  items jsonb default '[]'::jsonb,
  subtotal numeric(12,2) default 0,
  shipping_fee numeric(12,2) default 0,
  discount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists promotions (
  id text primary key,
  title text not null,
  subtitle text,
  type text,
  discount_value numeric(12,2) default 0,
  active boolean default true,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  target_category text
);

create table if not exists store_settings (
  id text primary key default 'default',
  store_name text default 'BJ ELECTRONICS',
  logo_text text default 'BJ ELECTRONICS',
  hotline text default '09612-345678',
  delivery_location text default 'Delivering to Dhaka 1205',
  hero_eyebrow text default 'NEW ARRIVAL',
  hero_title text default 'Upgrade Your Digital Life',
  hero_subtitle text default 'Discover the latest electronics with best prices in Bangladesh.',
  footer_credit text default 'All rights Reserved@2026. Build & Developed By SAR INDUSTRIES NETWORK.',
  bank_offer_text text,
  emi_offer_text text,
  currency text default 'BDT',
  active_theme text default 'light',
  updated_at timestamptz default now()
);

create table if not exists audit_logs (
  id text primary key,
  actor text,
  action text,
  entity_type text,
  entity_id text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists inventory_movements (
  id text primary key,
  product_id text references products(id) on delete cascade,
  type text,
  quantity integer,
  previous_stock integer,
  new_stock integer,
  reason text,
  created_at timestamptz default now()
);

alter table categories enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table promotions enable row level security;
alter table store_settings enable row level security;
alter table audit_logs enable row level security;
alter table inventory_movements enable row level security;

-- Demo policies for the frontend-only deployment. Replace with stricter authenticated admin policies before real production payments.
do $$ begin
  create policy "public categories" on categories for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public products" on products for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public orders" on orders for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public customers" on customers for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public promotions" on promotions for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public store_settings" on store_settings for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public audit_logs" on audit_logs for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public inventory_movements" on inventory_movements for all using (true) with check (true);
exception when duplicate_object then null; end $$;
