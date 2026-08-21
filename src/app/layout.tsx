import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import SessionBootstrap from "@/components/SessionBootstrap";
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
  title: "LaunchBid — bid your product to #1",
  description:
    "The top 10 spots on this board are for sale. Products rank by tokens bid on them — earn tokens free or buy with UPI, then outbid the board.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <SessionBootstrap />
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24">
          {children}
        </main>
        <footer className="border-t border-stone-200 py-8 dark:border-white/10">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 text-sm text-stone-500 dark:text-stone-400">
            <span>Every token is a bid. Top 10 own the board.</span>
            <Link href="/earn" className="font-medium hover:underline">
              Earn free tokens
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
