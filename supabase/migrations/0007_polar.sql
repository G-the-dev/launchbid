-- International purchases via Polar alongside manual UPI.
alter table public.purchases add column source text not null default 'upi' check (source in ('upi', 'polar'));
alter table public.purchases add column external_id text unique;
alter table public.purchases add column amount_cents int;
alter table public.purchases alter column amount_inr drop not null;
