-- Board shows when each product was last bid on.
alter table public.products add column last_boost_at timestamptz;

create or replace function public.apply_boost() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.products
     set total_amount = total_amount + new.amount,
         boost_count  = boost_count + 1,
         last_boost_at = now()
   where id = new.product_id;
  return new;
end $$;
