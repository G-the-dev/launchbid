"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/mail";
import { SHARE_X_TOKENS, TOKEN_PACKS, formatTokens } from "@/lib/tokens";

export async function boostWithTokens(
  productId: string,
  tokens: number
): Promise<{ balance?: number; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("boost_with_tokens", {
    p_product: productId,
    p_tokens: Math.floor(tokens),
  });
  if (error) return { error: error.message };
  revalidatePath("/");
  return { balance: Number(data) };
}

const X_POST_RE =
  /^https?:\/\/(www\.)?(x|twitter)\.com\/[A-Za-z0-9_]{1,15}\/status\/\d+/;

// Instant verification: X's public oEmbed endpoint returns the post's text
// for any public post, so we can check it actually mentions LaunchBid.
async function verifySharePost(postUrl: string): Promise<{ error?: string }> {
  const normalized = postUrl.replace(/\/\/(www\.)?x\.com\//, "//twitter.com/");
  try {
    const res = await fetch(
      `https://publish.twitter.com/oembed?omit_script=1&url=${encodeURIComponent(normalized)}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (res.status === 404) {
      return { error: "That post doesn't exist or isn't public. Check the link." };
    }
    if (!res.ok) {
      return { error: "Couldn't verify the post right now. Try again in a minute." };
    }
    const data = (await res.json()) as { html?: string };
    const text = (data.html ?? "").toLowerCase();
    if (!text.includes("launchbid")) {
      return { error: "That post doesn't mention LaunchBid. Share the post from the button above, then paste its link." };
    }
    return {};
  } catch {
    return { error: "Couldn't verify the post right now. Try again in a minute." };
  }
}

export async function claimShareReward(
  postUrl: string
): Promise<{ balance?: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session is still starting. Try again in a second." };
  if (!X_POST_RE.test(postUrl.trim())) {
    return { error: "That doesn't look like a link to an X post." };
  }

  const verification = await verifySharePost(postUrl.trim());
  if (verification.error) return { error: verification.error };

  const { data, error } = await createAdminClient().rpc("credit_tokens", {
    p_user: user.id,
    p_delta: SHARE_X_TOKENS,
    p_kind: "share_x",
    p_meta: postUrl.trim().slice(0, 300),
  });
  if (error) {
    if (error.message.includes("token_events_share_once")) {
      return { error: "You've already claimed the share reward." };
    }
    return { error: error.message };
  }
  return { balance: Number(data) };
}

function approveSignature(purchaseId: string): string {
  return crypto
    .createHmac("sha256", process.env.PURCHASE_APPROVE_SECRET!)
    .update(purchaseId)
    .digest("hex");
}

export async function createPurchase(input: {
  packInr: number;
  email: string;
  utr: string;
}): Promise<{ ok?: true; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session is still starting. Try again in a second." };

  const pack = TOKEN_PACKS.find((p) => p.inr === input.packInr);
  if (!pack) return { error: "Pick a token pack." };
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email. Token updates go there." };
  }
  const utr = input.utr.trim();
  if (!/^[A-Za-z0-9]{6,30}$/.test(utr)) {
    return { error: "Enter the UPI transaction / UTR number from your payment app." };
  }

  const admin = createAdminClient();
  const { data: purchase, error } = await admin
    .from("purchases")
    .insert({
      user_id: user.id,
      email,
      amount_inr: pack.inr,
      tokens: pack.tokens,
      utr,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  const approveUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/purchases/approve?id=${purchase.id}&sig=${approveSignature(purchase.id)}`;
  const { error: mailError } = await sendMail({
    to: process.env.OWNER_EMAIL ?? process.env.GMAIL_USER!,
    subject: `LaunchBid: approve ₹${pack.inr} → ${formatTokens(pack.tokens)} (UTR ${utr})`,
    html: `<p>Token purchase waiting for approval.</p>
<ul>
  <li>Buyer: ${email}</li>
  <li>Pack: ₹${pack.inr} → ${pack.tokens} tokens</li>
  <li>UTR: <b>${utr}</b></li>
</ul>
<p>Check the UPI credit in your bank app, then</p>
<p><a href="${approveUrl}">Approve and credit ${pack.tokens} tokens</a></p>`,
  });
  if (mailError) {
    // Purchase row exists; it can still be approved from the Supabase table.
    return { error: "Request saved, but the notification mail failed. Your tokens will still be credited after manual review." };
  }
  return { ok: true };
}
