"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSiteMetadata } from "@/lib/metadata";
import { WELCOME_TOKENS } from "@/lib/tokens";
import type { SiteMetadata } from "@/lib/types";

export async function getSiteMetadata(
  url: string
): Promise<SiteMetadata | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session is still starting — try again in a second." };
  return fetchSiteMetadata(url);
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "product"
  );
}

export async function createProduct(input: {
  url: string;
  name: string;
  tagline: string;
  faviconUrl: string;
}): Promise<{ error: string } | never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session is still starting — try again in a second." };

  const name = input.name.trim().slice(0, 80);
  const tagline = input.tagline.trim().slice(0, 140);
  if (!name) return { error: "Give your product a name." };
  if (!/^https?:\/\//i.test(input.url)) return { error: "Invalid URL." };

  const base = slugify(name);
  let slug = base;

  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.from("products").insert({
      owner_id: user.id,
      url: input.url,
      slug,
      name,
      tagline: tagline || null,
      favicon_url: input.faviconUrl || null,
    });

    if (!error) {
      // First-listing welcome bonus; the partial unique index makes it one-time.
      await createAdminClient()
        .rpc("credit_tokens", {
          p_user: user.id,
          p_delta: WELCOME_TOKENS,
          p_kind: "welcome",
        })
        .then(() => {});
      revalidatePath("/");
      redirect(`/p/${slug}`);
    }
    if (error.code === "23505") {
      if (error.message.includes("products_url_key")) {
        return { error: "That website is already listed on LaunchBid." };
      }
      // slug collision — retry with a suffix
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      continue;
    }
    return { error: error.message };
  }
  return { error: "Could not create the product. Try a different name." };
}

export async function updateProduct(
  productId: string,
  input: { name: string; tagline: string }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const name = input.name.trim().slice(0, 80);
  if (!name) return { error: "Name can't be empty." };

  const { error } = await supabase
    .from("products")
    .update({ name, tagline: input.tagline.trim().slice(0, 140) || null })
    .eq("id", productId);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteProduct(productId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/dashboard");
  return {};
}
