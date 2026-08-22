-- Dodo joins UPI and Polar as a purchase source.
alter table public.purchases drop constraint purchases_source_check;
alter table public.purchases add constraint purchases_source_check check (source in ('upi', 'polar', 'dodo'));
