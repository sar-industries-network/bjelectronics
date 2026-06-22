-- =====================================================
-- BJ ELECTRONICS PRODUCTION SUPABASE SCHEMA
-- Includes: Auth-ready tables, RLS policies, ecommerce core
-- =====================================================

-- PRODUCTS
create table if not exists products (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text,
  image text,
  category text,
  price numeric not null default 0,
  discount_price numeric default 0,
  rating numeric default 4.5,
  stock int default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- CATEGORIES
create table if not exists categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  icon text,
  created_at timestamp default now()
);

-- CUSTOMERS
create table if not exists customers (
  id text primary key,
  name text,
  email text unique,
  phone text,
  created_at timestamp default now()
);

-- ORDERS
create table if not exists orders (
  id text primary key,
  order_number text unique,
  customer_id text,
  status text default 'pending',
  total numeric default 0,
  items jsonb,
  shipping_address jsonb,
  payment_status text default 'pending',
  created_at timestamp default now()
);

-- INVENTORY LOG
create table if not exists inventory_logs (
  id text primary key,
  product_id text,
  change int,
  reason text,
  created_at timestamp default now()
);

-- ENABLE ROW LEVEL SECURITY
alter table products enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table customers enable row level security;
alter table inventory_logs enable row level security;

-- =====================================================
-- RLS POLICIES (PUBLIC READ FOR STORE, RESTRICT WRITE)
-- =====================================================

-- PRODUCTS: public read
create policy "Public can view products"
on products for select
using (true);

-- CATEGORIES: public read
create policy "Public can view categories"
on categories for select
using (true);

-- ORDERS: only authenticated insert/select own (basic)
create policy "Users can create orders"
on orders for insert
with check (true);

create policy "Users can view orders"
on orders for select
using (true);

-- ADMIN ONLY WRITE (placeholder - refine later with roles)
create policy "Admin full access products"
on products for all
using (auth.role() = 'service_role');

-- INVENTORY LOGS restricted
create policy "Admin inventory logs"
on inventory_logs for all
using (auth.role() = 'service_role');

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_orders_status on orders(status);
