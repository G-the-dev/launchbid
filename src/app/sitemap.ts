import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://launchbid.lol";
  const { data: products } = await createAdminClient()
    .from("products")
    .select("slug, last_boost_at, created_at")
    .order("total_amount", { ascending: false })
    .limit(1000);

  return [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/rules`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/earn`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/tokens`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/submit`, changeFrequency: "monthly", priority: 0.8 },
    ...(products ?? []).map((p) => ({
      url: `${base}/p/${p.slug}`,
      lastModified: new Date(p.last_boost_at ?? p.created_at),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
