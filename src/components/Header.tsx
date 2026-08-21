import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { formatTokens } from "@/lib/tokens";

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
    <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="font-bold text-lg tracking-tight shrink-0">
          Launch<span className="text-amber-500">Bid</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user && (
            <Link
              href="/tokens"
              className="rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1 font-medium tabular-nums hover:bg-amber-500/20 transition-colors"
              title="Your token balance — click to get more"
            >
              {formatTokens(balance)}
            </Link>
          )}
          <Link href="/earn" className="hover:underline">
            Earn
          </Link>
          <Link
            href="/submit"
            className="rounded-full bg-amber-500 text-black font-medium px-4 py-1.5 hover:bg-amber-400 transition-colors"
          >
            Submit
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <form action={signOut}>
                <button type="submit" className="opacity-70 hover:opacity-100">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:underline">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
