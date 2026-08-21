import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatTokens } from "@/lib/tokens";
import { btnQuiet, btnSolid } from "@/lib/ui";
import { Logo } from "./Logo";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

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
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
        <Link href="/">
          <Logo />
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
            title="Your token balance: top up with UPI"
            className={`${btnSolid} tabular-nums`}
          >
            {formatTokens(balance)}
            <span aria-hidden className="text-zinc-400">·</span>
            Top up
          </Link>
        </nav>
      </div>
    </header>
  );
}
