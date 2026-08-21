-- Close abuse loopholes: one claim per X post (not just per user),
-- and slugs must be clean url-safe strings even via direct RPC calls.
create unique index token_events_share_post_once on public.token_events (meta) where kind = 'share_x';
alter table public.products add constraint products_slug_format check (slug ~ '^[a-z0-9-]{1,80}$');
