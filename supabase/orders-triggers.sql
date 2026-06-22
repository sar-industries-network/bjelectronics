-- =====================================================
-- ORDER + INVENTORY AUTOMATION (PRODUCTION)
-- =====================================================

-- Deduct stock after order insert
create or replace function decrease_stock()
returns trigger as $$
begin
  if NEW.items is not null then
    -- simple loop for JSON items
    -- expects [{product_id, qty}]
    for i in 0..jsonb_array_length(NEW.items)-1 loop
      update products
      set stock = stock - (NEW.items->i->>'qty')::int,
          updated_at = now()
      where id = (NEW.items->i->>'product_id');

      insert into inventory_logs(id, product_id, change, reason)
      values (
        gen_random_uuid()::text,
        (NEW.items->i->>'product_id'),
        -((NEW.items->i->>'qty')::int),
        'ORDER_PLACED'
      );
    end loop;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Trigger on order insert
create trigger trg_decrease_stock
after insert on orders
for each row
execute function decrease_stock();

-- Auto timestamp update
create or replace function update_timestamp()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger trg_products_updated
before update on products
for each row
execute function update_timestamp();
