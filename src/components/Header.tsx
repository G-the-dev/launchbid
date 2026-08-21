import Link from "next/link";
import { getBalance } from "@/lib/data";
import { btnQuiet } from "@/lib/ui";
import SoundControl from "./SoundControl";
import TokenBalance from "./TokenBalance";
import { Logo } from "./Logo";

export default async function Header() {
  const balance = await getBalance();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2.5 sm:gap-4">
          <SoundControl />
          <Link href="/earn" className={btnQuiet}>
            Quests
          </Link>
          <Link href="/dashboard" className={btnQuiet}>
            <span className="hidden sm:inline">My products</span>
            <span className="sm:hidden">Mine</span>
          </Link>
          <Link
            href="/tokens"
            title="Your token balance: top up with UPI"
            className="mc-btn mc-btn-grass px-2.5 py-1.5 text-sm tabular-nums sm:px-3.5"
          >
            <TokenBalance initial={balance} />
            <span aria-hidden className="hidden opacity-60 sm:inline">·</span>
            <span className="hidden sm:inline">Top up</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
