"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatTokens } from "@/lib/tokens";

// The header lives in the root layout, which never re-renders on navigation,
// so the balance is fetched client-side and kept fresh on route changes,
// tab focus, token actions (lb:balance event), and a slow poll.
export default function TokenBalance({ initial }: { initial: number }) {
  const [balance, setBalance] = useState(initial);
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from("profiles")
      .select("token_balance")
      .eq("id", session.user.id)
      .single();
    if (data) setBalance(Number(data.token_balance));
  }, []);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    window.addEventListener("focus", refresh);
    window.addEventListener("lb:balance", refresh);
    const interval = setInterval(refresh, 15_000);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("lb:balance", refresh);
      clearInterval(interval);
    };
  }, [refresh]);

  return <span className="tabular-nums">{formatTokens(balance)}</span>;
}
