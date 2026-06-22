-- BJ ELECTRONICS admin authentication and RLS hardening

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text default 'BJ Electronics Admin',
  role text default 'admin' check (role in ('owner','admin','staff')),
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.admin_profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    exists(
      select 1 from public.admin_profiles ap
      where ap.user_id = auth.uid()
        and ap.active = true
        and ap.role in ('owner','admin','staff')
    ),
    false
  );
$$;

create policy "public read active products" on public.products for select using (active = true or public.is_admin());
create policy "public read active categories" on public.categories for select using (active = true or public.is_admin());
create policy "public read active promotions" on public.promotions for select using (active = true or public.is_admin());
create policy "public read store settings" on public.store_settings for select using (true);

create policy "admin manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage promotions" on public.promotions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage store settings" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage customers" on public.customers for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage payments" on public.payments for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage notifications" on public.notifications for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage inventory logs" on public.inventory_logs for all using (public.is_admin()) with check (public.is_admin());
create policy "admin profiles self or admin read" on public.admin_profiles for select using (user_id = auth.uid() or public.is_admin());

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.place_order_public(jsonb) to anon, authenticated;
