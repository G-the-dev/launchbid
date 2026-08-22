import crypto from "crypto";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatTokens } from "@/lib/tokens";
import { timeAgo } from "@/lib/format";
import { approvePurchase, rejectPurchase } from "./actions";

export const metadata = { robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

type Purchase = {
  id: string;
  email: string;
  amount_inr: number | null;
  tokens: number;
  utr: string | null;
  status: "pending" | "approved" | "rejected";
  source: string;
  created_at: string;
  approved_at: string | null;
};

const STATUS_STYLE: Record<Purchase["status"], string> = {
  pending: "text-gold",
  approved: "text-emerald",
  rejected: "text-mcred",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const expected = process.env.ADMIN_KEY ?? "";
  const given = key ?? "";
  const authorized =
    expected.length > 0 &&
    given.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!authorized) notFound();

  const admin = createAdminClient();
  const [{ data: purchasesData }, { count: userCount }, { count: productCount }, { count: boostCount }] =
    await Promise.all([
      admin.from("purchases").select("*").order("created_at", { ascending: false }).limit(100),
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("products").select("*", { count: "exact", head: true }),
      admin.from("boosts").select("*", { count: "exact", head: true }),
    ]);
  const purchases = (purchasesData ?? []) as Purchase[];

  const pending = purchases.filter((p) => p.status === "pending");
  const approved = purchases.filter((p) => p.status === "approved");
  const revenue = approved.reduce((sum, p) => sum + Number(p.amount_inr ?? 0), 0);
  const revenueUsd =
    approved.reduce((sum, p) => sum + Number((p as { amount_cents?: number }).amount_cents ?? 0), 0) / 100;
  const tokensSold = approved.reduce((sum, p) => sum + Number(p.tokens), 0);

  const stats = [
    { k: "Pending payments", v: String(pending.length) },
    { k: "Revenue", v: `₹${revenue} + $${revenueUsd.toFixed(0)}` },
    { k: "Tokens sold", v: formatTokens(tokensSold) },
    { k: "Players", v: String(userCount ?? 0) },
    { k: "Products", v: String(productCount ?? 0) },
    { k: "Bids placed", v: String(boostCount ?? 0) },
  ];

  return (
    <div className="pt-12">
      <h1 className="pixel-text text-2xl uppercase">Payments admin</h1>
      <p className="mt-1 mb-6 text-sm text-mcgray">
        Owner-only. Card payments credit automatically; UPI rows need manual approval.
      </p>

      <div className="mc-panel grid grid-cols-2 divide-x-2 divide-black/70 text-center sm:grid-cols-6">
        {stats.map(({ k, v }) => (
          <div key={k} className="px-2 py-3">
            <div className="pixel-text text-base tabular-nums">{v}</div>
            <div className="mt-0.5 text-xs text-mcgray">{k}</div>
          </div>
        ))}
      </div>

      <div className="mc-panel mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black/70 text-left text-xs uppercase text-mcdim">
              <th className="px-4 py-3 font-normal">When</th>
              <th className="py-3 pr-4 font-normal">Buyer</th>
              <th className="py-3 pr-4 font-normal">Amount</th>
              <th className="py-3 pr-4 font-normal">Tokens</th>
              <th className="py-3 pr-4 font-normal">UTR</th>
              <th className="py-3 pr-4 font-normal">Status</th>
              <th className="py-3 pr-4 text-right font-normal">Action</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-mcgray">
                  No payments yet. They'll appear here the moment a buyer
                  submits a UTR.
                </td>
              </tr>
            )}
            {purchases.map((p) => (
              <tr key={p.id} className="border-b-2 border-black/40 last:border-b-0">
                <td className="px-4 py-3 whitespace-nowrap text-mcgray" title={p.created_at}>
                  {timeAgo(p.created_at)}
                </td>
                <td className="max-w-48 truncate py-3 pr-4">{p.email}</td>
                <td className="py-3 pr-4 tabular-nums">
                  {p.amount_inr != null ? `₹${p.amount_inr}` : "-"}
                </td>
                <td className="py-3 pr-4 tabular-nums">{formatTokens(p.tokens)}</td>
                <td className="py-3 pr-4 font-mono text-xs">{p.utr ?? "-"}</td>
                <td className={`pixel-text py-3 pr-4 text-xs uppercase ${STATUS_STYLE[p.status]}`}>
                  {p.status}
                </td>
                <td className="py-3 pr-4 text-right whitespace-nowrap">
                  {p.status === "pending" ? (
                    <span className="inline-flex gap-2">
                      <form action={approvePurchase}>
                        <input type="hidden" name="key" value={given} />
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="mc-btn mc-btn-grass px-3 py-1.5 text-xs">
                          Approve
                        </button>
                      </form>
                      <form action={rejectPurchase}>
                        <input type="hidden" name="key" value={given} />
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="mc-btn px-3 py-1.5 text-xs">
                          Reject
                        </button>
                      </form>
                    </span>
                  ) : (
                    <span className="text-xs text-mcdim">
                      {p.approved_at ? timeAgo(p.approved_at) : "-"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
