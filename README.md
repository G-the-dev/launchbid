# LaunchBid

The leaderboard money built. Makers list their product by URL and promote it by
**boosting** — paying real money via Razorpay (UPI/cards). Every rupee adds to the
product's lifetime total; the homepage is the **top 10 by total boosted**, updating
live. No free promotion, no upvotes: outbid the board to get on it.

**Stack:** Next.js 16 (App Router) · Supabase (Postgres, Auth, Realtime) · Razorpay (test mode) · Tailwind v4 · Vercel

## How money flows

1. `POST /api/orders` creates a Razorpay order (product/user stamped into server-set `notes`).
2. Razorpay Checkout opens in the browser; the user pays (test UPI: `success@razorpay`).
3. Two crediting paths, both server-verified and idempotent on `razorpay_payment_id`:
   - **Fast path** — Checkout's callback hits `POST /api/payments/verify`, which checks the payment signature (HMAC with the key secret) before crediting.
   - **Authoritative path** — Razorpay's `payment.captured` webhook hits `POST /api/webhooks/razorpay` (HMAC of the raw body with the webhook secret).
4. Inserting into the `boosts` ledger fires a Postgres trigger that bumps `products.total_amount` atomically; Supabase Realtime pushes the change to every open leaderboard.

Clients can never write money: `boosts`/`orders` have no insert policies (service-role only), and column-level grants stop owners from editing `total_amount`.

## Setup

### 1. Supabase

1. Create a project at [database.new](https://database.new) (region `ap-south-1` for India).
2. Copy Project Settings → API values into `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Apply the schema — either paste `supabase/migrations/0001_init.sql` into the SQL Editor, or:
   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```
4. Auth → Providers: enable **Email** (magic links work out of the box) and optionally **Google** (create an OAuth client in Google Cloud Console; the redirect URI to register is shown in the Supabase Google provider settings).
5. Auth → URL Configuration: add `http://localhost:3000/**` (and later your Vercel URL) to the redirect allowlist.

### 2. Razorpay (test mode)

1. Sign up at [razorpay.com](https://razorpay.com), stay in **Test Mode**.
2. Settings → API Keys → Generate: copy `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` into `.env.local`.
3. Webhook (needed for the authoritative path; the app also credits via the verify fast-path, so local dev works without this):
   ```bash
   ngrok http 3000
   ```
   Then Settings → Webhooks → Add: URL `https://<id>.ngrok-free.app/api/webhooks/razorpay`, secret = any string you invent (put the same string in `RAZORPAY_WEBHOOK_SECRET`), event `payment.captured` (+ `payment.failed`).

### 3. Run

```bash
npm install
npm run dev
```

Test payment credentials: UPI `success@razorpay` (or failure: `failure@razorpay`), card `4111 1111 1111 1111` / any future expiry / any CVV / OTP `1234`.

### 4. Deploy (Vercel)

1. Push to GitHub, import in Vercel, set all `.env.local` vars (change `NEXT_PUBLIC_SITE_URL` to the prod URL).
2. Add the Vercel URL to the Supabase auth redirect allowlist (and Google OAuth origins if enabled).
3. Point a second Razorpay webhook at `https://your-app.vercel.app/api/webhooks/razorpay`.

## End-to-end test checklist

- Boost with `success@razorpay` → exactly one `boosts` row, total and rank update, leaderboard re-sorts live in a second window.
- Resend the webhook from the Razorpay dashboard → totals unchanged (idempotent).
- Pay with `failure@razorpay` → no credit, order marked `failed`.
- Two browsers, two accounts, boost war → both leaderboards re-rank without reload.
