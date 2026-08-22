import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header";
import SessionBootstrap from "@/components/SessionBootstrap";
import "./globals.css";

const minecraft = localFont({
  src: "../fonts/Minecraft.ttf",
  variable: "--font-minecraft",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "LaunchBid: bid your product to #1",
  description:
    "A live leaderboard where tokens are bids. Craft tokens free or trade UPI for packs, then outbid the server for the top spot.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${minecraft.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col">
        {/* The overworld, dimmed behind everything */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bg-world.png"
            alt=""
            className="pixelated size-full object-cover opacity-25"
            fetchPriority="low"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <Analytics />
        <SessionBootstrap />
        <Header />
        <main className="fade-up mx-auto w-full max-w-3xl flex-1 px-4 pb-24">
          {children}
        </main>

        <footer className="border-t-2 border-black bg-background/90">
          <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="pixel-text text-base">
                Launch<span className="text-gold">Bid</span>
              </span>
              <nav className="flex flex-wrap items-center gap-5 text-sm text-mcgray">
                <Link href="/rules" className="hover:text-white">
                  Rules
                </Link>
                <Link href="/earn" className="hover:text-white">
                  Quests
                </Link>
                <Link href="/tokens" className="hover:text-white">
                  Token shop
                </Link>
                {process.env.X_HANDLE && (
                  <a
                    href={`https://x.com/${process.env.X_HANDLE}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden fill="currentColor">
                      <path d="M18.24 2H21.5l-7.1 8.12L22.75 22h-6.54l-5.12-6.7L5.22 22H1.95l7.6-8.68L1.25 2h6.7l4.63 6.12L18.24 2Zm-1.15 18.05h1.81L6.98 3.85H5.04l12.05 16.2Z"/>
                    </svg>
                    @{process.env.X_HANDLE}
                  </a>
                )}
                <a
                  href="https://outbid.lol"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="hover:text-white"
                >
                  Inspired by outbid.lol
                </a>
              </nav>
            </div>
            <p className="mt-5 text-sm text-mcdim">
              Every token is a bid and totals never reset. Clicks are counted
              through go-links, so affiliate and tracking URLs won&apos;t work
              here.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
