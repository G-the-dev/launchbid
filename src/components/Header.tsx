import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatTokens } from "@/lib/tokens";
import { btnQuiet } from "@/lib/ui";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let balance = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("token_balance")
      .eq("id", user.id)
      .single();
    balance = Number(profile?.token_balance ?? 0);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-background/80 backdrop-blur dark:border-white/10">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-lg font-semibold">
          Launch<span className="text-amber-500">Bid</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/earn" className={btnQuiet}>
            Earn
          </Link>
          <Link href="/dashboard" className={btnQuiet}>
            My products
          </Link>
          <Link
            href="/tokens"
            title="Your token balance — get more"
            className="inline-flex items-center rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold tabular-nums transition-colors hover:border-amber-500 dark:border-white/15 dark:hover:border-amber-500"
          >
            {formatTokens(balance)}
          </Link>
        </nav>
      </div>
    </header>
  );
}
