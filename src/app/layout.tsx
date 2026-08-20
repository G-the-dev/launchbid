import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LaunchBid — the leaderboard money built",
  description:
    "Promote your product by bidding for it. The top 10 highest-boosted products own the leaderboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 pb-16">
          {children}
        </main>
        <footer className="border-t border-black/10 dark:border-white/10 py-6 text-center text-xs opacity-60">
          LaunchBid — every rupee is a vote. Top 10 win the board.
        </footer>
      </body>
    </html>
  );
}
