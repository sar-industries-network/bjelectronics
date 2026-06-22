-- =====================================================
-- BJ ELECTRONICS PRODUCTION BACKEND (SUPABASE)
-- Full SaaS ecommerce schema + RLS + Inventory + Realtime
-- =====================================================

-- =============================
-- PROFILES (AUTH EXTENSION)
-- =============================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'customer',
  phone text,
  created_at timestamp default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);

-- =============================
-- ROLE HELPER
-- =============================
create or replace function is_admin()
returns boolean
language sql stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

-- =============================
-- PRODUCTS RLS
-- =============================
alter table products enable row level security;

create policy "Public product read"
on products for select
using (true);

create policy "Admin product write"
on products for all
using (is_admin())
with check (is_admin());

-- =============================
-- ORDERS RLS
-- =============================
alter table orders enable row level security;

create policy "User orders read"
on orders for select
using (auth.uid() = user_id);

create policy "Order insert"
on orders for insert
with check (true);

-- =============================
-- ORDER ITEMS
-- =============================
alter table order_items enable row level security;

create policy "Order items read"
on order_items for select
using (true);

-- =============================
-- INVENTORY SAFETY TRIGGER
-- =============================
create or replace function prevent_negative_stock()
returns trigger
language plpgsql
as $$
begin
  if (select stock from products where id = NEW.product_id) < NEW.quantity then
    raise exception 'Insufficient stock';
  end if;
  return NEW;
end;
$$;

create or replace function decrease_stock()
returns trigger
language plpgsql
as $$
begin
  update products
  set stock = stock - NEW.quantity
  where id = NEW.product_id;

  insert into inventory_logs(id, product_id, change, reason, created_at)
  values (gen_random_uuid(), NEW.product_id, -NEW.quantity, 'order', now());

  return NEW;
end;
$$;

-- Attach triggers
DROP TRIGGER IF EXISTS trg_check_stock ON order_items;
DROP TRIGGER IF EXISTS trg_decrease_stock ON order_items;

create trigger trg_check_stock
before insert on order_items
for each row execute function prevent_negative_stock();

create trigger trg_decrease_stock
after insert on order_items
for each row execute function decrease_stock();

-- =============================
-- REALTIME NOTES
-- =============================
-- Enable in Supabase Dashboard:
-- products, orders, order_items, inventory_logs, profiles

-- =============================
-- END PRODUCTION BACKEND UPGRADE
-- =====================================================