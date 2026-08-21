-- Listing is no longer free: spawning a product costs 25 tokens, atomically.
alter table public.token_events drop constraint token_events_kind_check;
alter table public.token_events add constraint token_events_kind_check
  check (kind in ('welcome', 'share_x', 'visit', 'purchase', 'boost', 'spawn'));

create or replace function public.spawn_product(
  p_url text,
  p_slug text,
  p_name text,
  p_tagline text,
  p_favicon text
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_balance bigint;
  v_id uuid;
begin
  if v_user is null then
    raise exception 'Your session is still starting. Try again in a second.';
  end if;
  update profiles set token_balance = token_balance - 25
   where id = v_user and token_balance >= 25
  returning token_balance into v_balance;
  if v_balance is null then
    raise exception 'NOT_ENOUGH_TOKENS';
  end if;
  insert into products (owner_id, url, slug, name, tagline, favicon_url)
  values (v_user, p_url, p_slug, p_name, nullif(p_tagline, ''), nullif(p_favicon, ''))
  returning id into v_id;
  insert into token_events (user_id, delta, kind, product_id)
  values (v_user, -25, 'spawn', v_id);
  return p_slug;
end $$;
grant execute on function public.spawn_product(text, text, text, text, text) to authenticated;
