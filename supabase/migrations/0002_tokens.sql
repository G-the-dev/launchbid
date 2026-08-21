-- Token economy: bidding runs on tokens, not direct payments.
-- Earn: +25 first listing, +50 share on X (once), +2 per site visited (max 10/day).
-- Buy: manual UPI (QR + VPA) -> owner approves via emailed link -> tokens credited.

alter table public.profiles add column token_balance bigint not null default 0 check (token_balance >= 0);
alter table public.products add column click_count int not null default 0;
alter table public.boosts alter column razorpay_payment_id drop not null;
alter table public.boosts add column source text not null default 'tokens' check (source in ('tokens', 'razorpay'));

-- Immutable token ledger
create table public.token_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta bigint not null,
  kind text not null check (kind in ('welcome', 'share_x', 'visit', 'purchase', 'boost')),
  product_id uuid references public.products(id) on delete set null,
  purchase_id uuid,
  meta text,
  created_at timestamptz not null default now()
);
create index token_events_user_idx on public.token_events (user_id, created_at desc);
-- one-time rewards enforced at the schema level
create unique index token_events_welcome_once on public.token_events (user_id) where kind = 'welcome';
create unique index token_events_share_once on public.token_events (user_id) where kind = 'share_x';

-- One rewarded visit per user/product/day
create table public.visits (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  visited_on date not null default current_date,
  primary key (user_id, product_id, visited_on)
);

-- Manual UPI token purchases
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  amount_inr int not null check (amount_inr > 0),
  tokens bigint not null check (tokens > 0),
  utr text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

alter table public.token_events enable row level security;
alter table public.visits enable row level security;
alter table public.purchases enable row level security;

create policy "token events own read" on public.token_events for select using (auth.uid() = user_id);
create policy "visits own read" on public.visits for select using (auth.uid() = user_id);
create policy "purchases own read" on public.purchases for select using (auth.uid() = user_id);
-- no client write policies: all writes go through the definer functions below or service_role

-- Atomic ledger insert + balance update. Service-role / definer use only.
create or replace function public.credit_tokens(
  p_user uuid,
  p_delta bigint,
  p_kind text,
  p_product uuid default null,
  p_purchase uuid default null,
  p_meta text default null
) returns bigint
language plpgsql security definer set search_path = public as $$
declare new_balance bigint;
begin
  insert into token_events (user_id, delta, kind, product_id, purchase_id, meta)
  values (p_user, p_delta, p_kind, p_product, p_purchase, p_meta);
  update profiles set token_balance = token_balance + p_delta where id = p_user
  returning token_balance into new_balance;
  return new_balance;
end $$;
revoke all on function public.credit_tokens(uuid, bigint, text, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.credit_tokens(uuid, bigint, text, uuid, uuid, text) to service_role;

-- Spend tokens to boost a product (any signed-in user, any product).
create or replace function public.boost_with_tokens(p_product uuid, p_tokens bigint)
returns bigint
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  new_balance bigint;
begin
  if v_user is null then raise exception 'Sign in to boost.'; end if;
  if p_tokens < 5 then raise exception 'Minimum boost is 5 tokens.'; end if;
  update profiles set token_balance = token_balance - p_tokens
   where id = v_user and token_balance >= p_tokens
  returning token_balance into new_balance;
  if new_balance is null then raise exception 'Not enough tokens.'; end if;
  insert into token_events (user_id, delta, kind, product_id)
  values (v_user, -p_tokens, 'boost', p_product);
  insert into boosts (product_id, user_id, amount, source)
  values (p_product, v_user, p_tokens, 'tokens');
  return new_balance;
end $$;
grant execute on function public.boost_with_tokens(uuid, bigint) to authenticated;

-- Count a click; reward the visitor +2 tokens (not own product, once per product per day, max 10 rewarded visits/day).
create or replace function public.register_visit(p_product uuid)
returns bigint
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_owner uuid;
  v_count int;
begin
  update products set click_count = click_count + 1 where id = p_product
  returning owner_id into v_owner;
  if v_user is null or v_owner is null or v_owner = v_user then return 0; end if;
  begin
    insert into visits (user_id, product_id) values (v_user, p_product);
  exception when unique_violation then
    return 0;
  end;
  select count(*) into v_count from visits where user_id = v_user and visited_on = current_date;
  if v_count > 10 then return 0; end if;
  perform credit_tokens(v_user, 2, 'visit', p_product);
  return 2;
end $$;
grant execute on function public.register_visit(uuid) to authenticated, anon;
