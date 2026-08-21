"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchSiteMetadata } from "@/lib/metadata";
import type { SiteMetadata } from "@/lib/types";

export async function getSiteMetadata(
  url: string
): Promise<SiteMetadata | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session is still starting. Try again in a second." };
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

// Listing costs 25 tokens; the spawn_product function deducts and inserts atomically.
export async function createProduct(input: {
  url: string;
  name: string;
  tagline: string;
  faviconUrl: string;
}): Promise<{ error: string } | never> {
  const supabase = await createClient();

  const name = input.name.trim().slice(0, 80);
  if (!name) return { error: "Give your product a name." };
  if (!/^https?:\/\//i.test(input.url)) return { error: "Invalid URL." };

  const base = slugify(name);
  let slug = base;

  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.rpc("spawn_product", {
      p_url: input.url,
      p_slug: slug,
      p_name: name,
      p_tagline: input.tagline.trim().slice(0, 140),
      p_favicon: input.faviconUrl,
    });

    if (!error) {
      revalidatePath("/");
      redirect(`/p/${slug}`);
    }
    if (error.message.includes("NOT_ENOUGH_TOKENS")) {
      return { error: "NOT_ENOUGH_TOKENS" };
    }
    if (error.message.includes("products_url_key")) {
      return { error: "That website is already on the board." };
    }
    if (error.message.includes("products_slug_key")) {
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      continue;
    }
    return { error: error.message };
  }
  return { error: "Could not spawn the product. Try a different name." };
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
