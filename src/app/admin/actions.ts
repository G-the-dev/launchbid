"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/mail";
import { tokensCreditedEmail } from "@/lib/email";

function keyOk(key: string): boolean {
  const expected = process.env.ADMIN_KEY ?? "";
  const a = Buffer.from(key);
  const b = Buffer.from(expected);
  return expected.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function approvePurchase(formData: FormData) {
  const key = String(formData.get("key") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!keyOk(key) || !id) return;

  const admin = createAdminClient();
  const { data: purchase } = await admin
    .from("purchases")
    .select("*")
    .eq("id", id)
    .single();
  if (!purchase || purchase.status !== "pending") return;

  const { error } = await admin.rpc("credit_tokens", {
    p_user: purchase.user_id,
    p_delta: purchase.tokens,
    p_kind: "purchase",
    p_purchase: purchase.id,
  });
  if (error) return;

  await admin
    .from("purchases")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", id);

  await sendMail({
    to: purchase.email,
    subject: `Your ${purchase.tokens} ⚡ just landed on LaunchBid`,
    html: tokensCreditedEmail({
      tokens: purchase.tokens,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
    }),
  });

  revalidatePath("/admin");
}

export async function rejectPurchase(formData: FormData) {
  const key = String(formData.get("key") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!keyOk(key) || !id) return;

  await createAdminClient()
    .from("purchases")
    .update({ status: "rejected" })
    .eq("id", id)
    .eq("status", "pending");

  revalidatePath("/admin");
}
