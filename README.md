# LaunchBid

The leaderboard tokens built. Makers list a product by URL and bid **tokens** to
climb; the homepage is the live **top 10 by lifetime tokens boosted**. Tokens are
earned (listing, sharing on X, exploring other products) or bought with **UPI** —
no payment gateway, just scan-and-pay to a VPA with manual approval.

**Stack:** Next.js 16 (App Router) · Supabase (Postgres, Auth, Realtime) · Tailwind v4 · Gmail SMTP (nodemailer) · Vercel

## Token economy

| Action | Tokens |
|---|---|
| Spawn (list) a product | -25 |
| Share LaunchBid on X (post link verified via oEmbed, must mention LaunchBid) | +50 (once) |
| Visit another maker's product from the board | +2 each, max 10 rewarded visits/day |
| Buy via UPI | ₹49→50 · ₹99→110 · ₹199→240 · ₹499→650 |
| Boost a product | −N (min 5), added to that product's lifetime total |

All movements live in the `token_events` ledger; balances can never go negative
(DB-enforced). One-time rewards are enforced with partial unique indexes, and
visit rewards with a `(user, product, day)` primary key — not client logic.

## How buying works (manual UPI, pagehaul-style)

1. Buyer picks a pack on `/tokens`, scans the QR (generated from `NEXT_PUBLIC_UPI_VPA`) or pays the VPA directly.
2. They submit their email + the UTR/transaction ID from their UPI app.
3. The owner gets a Gmail with the details and a signed **approve link**; one tap credits the tokens (idempotent) and emails the buyer a confirmation.
4. The buyer's email is stored on the purchase for product updates.

## Setup

### 1. Supabase

1. Create a project, copy Project Settings → API values into `.env.local`.
2. Apply `supabase/migrations/0001_init.sql` then `0002_tokens.sql` (SQL Editor or `supabase db push`).
3. Auth → enable **Email** (magic links). Add your site URLs to the redirect allowlist.

### 2. Mail + UPI env

- `GMAIL_USER` + `GMAIL_APP_PASSWORD`: the owner Gmail (app password from Google Account → Security → 2-Step Verification → App passwords).
- `NEXT_PUBLIC_UPI_VPA`: the UPI ID that receives payments.
- `PURCHASE_APPROVE_SECRET`: any long random string.

### 3. Run / deploy

```bash
npm install
npm run dev
```

Deploy: push to GitHub → import in Vercel → set all env vars (`NEXT_PUBLIC_SITE_URL` = prod URL) → add the prod URL to Supabase auth redirects.

## Test checklist

- Sign up via magic link → submit a product → +25 tokens appear in header.
- Boost with tokens → balance drops, board re-ranks live in a second window.
- Click another product's outbound link while signed in → +2 tokens (once per product per day; never on your own).
- Claim the X-share reward twice → second claim is refused.
- Buy flow: submit a pack + UTR → owner email arrives → approve link credits tokens exactly once (re-clicking says "already approved") → buyer gets confirmation mail.
