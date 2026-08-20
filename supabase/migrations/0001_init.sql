-- LaunchBid initial schema
-- Money is INR stored as paise (bigint). Boosts are an immutable ledger;
-- products.total_amount is maintained by trigger in the same transaction.

-- PROFILES (auto-created from auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
          new.raw_user_meta_data->>'avatar_url');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  url text not null unique check (url ~* '^https?://'),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 80),
  tagline text check (char_length(tagline) <= 140),
  favicon_url text,
  total_amount bigint not null default 0,
  boost_count int not null default 0,
  created_at timestamptz not null default now()
);
create index products_leaderboard_idx on public.products (total_amount desc, created_at asc);

-- ORDERS (payment intents we created with Razorpay)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id text not null unique,
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  amount bigint not null check (amount between 1000 and 50000000),
  status text not null default 'created' check (status in ('created', 'paid', 'failed')),
  created_at timestamptz not null default now()
);

-- BOOSTS (immutable ledger of captured payments)
create table public.boosts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  amount bigint not null check (amount > 0),
  razorpay_payment_id text not null unique,
  razorpay_order_id text not null,
  created_at timestamptz not null default now()
);
create index boosts_product_idx on public.boosts (product_id, created_at desc);

-- Credit the product atomically with the ledger insert
create or replace function public.apply_boost() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.products
     set total_amount = total_amount + new.amount,
         boost_count  = boost_count + 1
   where id = new.product_id;
  return new;
end $$;

create trigger boosts_apply after insert on public.boosts
  for each row execute function public.apply_boost();

-- RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders   enable row level security;
alter table public.boosts   enable row level security;

create policy "profiles public read"  on public.profiles for select using (true);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

create policy "products public read" on public.products for select using (true);
create policy "products owner insert" on public.products for insert
  with check (auth.uid() = owner_id);
create policy "products owner update" on public.products for update
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "products owner delete" on public.products for delete
  using (auth.uid() = owner_id);

-- Column-level lockdown: clients must never write money columns.
revoke insert, update on public.products from anon, authenticated;
grant insert (owner_id, url, slug, name, tagline, favicon_url) on public.products to authenticated;
grant update (name, tagline, favicon_url) on public.products to authenticated;

-- boosts: public read (recent-boosts feed); no write policies, so only the
-- service_role key (webhook / verify routes) can insert.
create policy "boosts public read" on public.boosts for select using (true);

-- orders: user may read their own; writes only via service_role.
create policy "orders own read" on public.orders for select using (auth.uid() = user_id);

-- Realtime leaderboard updates fire off products UPDATEs
alter publication supabase_realtime add table public.products;
