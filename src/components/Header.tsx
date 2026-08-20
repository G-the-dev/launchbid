import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-bold text-lg tracking-tight">
          Launch<span className="text-amber-500">Bid</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/submit"
            className="rounded-full bg-amber-500 text-black font-medium px-4 py-1.5 hover:bg-amber-400 transition-colors"
          >
            Submit product
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
