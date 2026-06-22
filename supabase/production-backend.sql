-- BJ ELECTRONICS PRODUCTION BACKEND (SUPABASE)
-- Full SaaS ecommerce schema

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'customer',
  phone text,
  created_at timestamp default now()
);

create table if not exists categories (
  id text primary key,
  name text,
  slug text unique,
  icon text,
  description text,
  sort_order int default 0,
  active boolean default true,
  created_at timestamp default now()
);

create table if not exists products (
  id text primary key,
  name text,
  slug text unique,
  price numeric,
  discount_price numeric,
  image text,
  rating numeric default 4.5,
  stock int default 0,
  category text,
  description text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists orders (
  id text primary key,
  user_id uuid references auth.users(id),
  order_number text unique,
  customer_name text,
  phone text,
  address text,
  payment_method text,
  payment_status text default 'pending',
  order_status text default 'processing',
  subtotal numeric default 0,
  shipping_fee numeric default 0,
  discount numeric default 0,
  total numeric default 0,
  created_at timestamp default now()
);

create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id text references orders(id) on delete cascade,
  product_id text references products(id),
  quantity int,
  price numeric
);

create table if not exists inventory_logs (
  id uuid default gen_random_uuid() primary key,
  product_id text references products(id),
  change int,
  reason text,
  created_at timestamp default now()
);

create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  title text,
  message text,
  type text default 'info',
  read boolean default false,
  created_at timestamp default now()
);

alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table inventory_logs enable row level security;
alter table notifications enable row level security;

create policy "Public product read"
on products for select
using (true);

create policy "User orders"
on orders for select
using (auth.uid() = user_id);

create policy "Create orders"
on orders for insert
with check (true);

create or replace function place_order_public(payload jsonb)
returns jsonb
language plpgsql
as $$
declare
  new_order_id text := 'ORD-' || floor(random()*1000000)::text;
begin
  insert into orders (
    id, order_number, customer_name, phone, address,
    payment_method, subtotal, total
  ) values (
    new_order_id, new_order_id,
    payload->>'customer_name',
    payload->>'phone',
    payload->>'address',
    payload->>'payment_method',
    (payload->>'subtotal')::numeric,
    (payload->>'total')::numeric
  );
  return jsonb_build_object('order_id', new_order_id);
end;
$$;
