-- Token boosts have no Razorpay order; the legacy column must be optional.
alter table public.boosts alter column razorpay_order_id drop not null;
