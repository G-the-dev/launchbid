import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Request-scoped caches: Header and the page share one session read and one
// balance query per request instead of each doing their own.
export const getServerClient = cache(createClient);

export const getSessionUser = cache(async () => {
  const supabase = await getServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
});

export const getBalance = cache(async () => {
  const user = await getSessionUser();
  if (!user) return 0;
  const supabase = await getServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("token_balance")
    .eq("id", user.id)
    .single();
  return Number(data?.token_balance ?? 0);
});
