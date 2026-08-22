import QRCode from "qrcode";
import { getBalance } from "@/lib/data";
import { getDodoPacks } from "@/lib/dodo";
import { TOKEN_PACKS, formatTokens, upiPayUri } from "@/lib/tokens";
import BuyTokensForm from "@/components/BuyTokensForm";

// QRs are static per (vpa, amount): render once per server instance, then reuse.
const qrCache = new Map<string, string>();
async function packQr(vpa: string, inr: number): Promise<string | null> {
  if (!vpa) return null;
  const key = `${vpa}:${inr}`;
  if (!qrCache.has(key)) {
    qrCache.set(key, await QRCode.toDataURL(upiPayUri(vpa, inr), { margin: 1, width: 240 }));
  }
  return qrCache.get(key)!;
}

export const metadata = {
  title: "Token shop",
  description: "Buy LaunchBid bidding tokens with UPI. Scan, pay, confirmed to your email.",
};

export const dynamic = "force-dynamic";

export default async function TokensPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string }>;
}) {
  const { paid } = await searchParams;
  const balance = await getBalance();

  const vpa = process.env.NEXT_PUBLIC_UPI_VPA ?? "";
  const packs = await Promise.all(
    TOKEN_PACKS.map(async (pack) => ({ ...pack, qr: await packQr(vpa, pack.inr) }))
  );

  return (
    <div className="mx-auto max-w-lg pt-12">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="pixel-text text-2xl uppercase">Token shop</h1>
        <span className="text-sm tabular-nums text-mcgray">
          Your balance: {formatTokens(balance)}
        </span>
      </div>
      <p className="mt-1 mb-8 text-base text-pretty text-mcgray">
        Pay with any UPI app in three steps: pick a pack, scan, confirm.
        Tokens land after we match your payment, confirmed by email.
      </p>

      {paid === "1" && (
        <div className="mc-panel mb-6 border-gold/50 p-5">
          <p className="pixel-text text-base text-gold">Payment received!</p>
          <p className="mt-1 text-sm text-mcgray">
            Your tokens land automatically within a minute, confirmed to your
            email. Watch the balance in the top bar.
          </p>
        </div>
      )}
      <BuyTokensForm
        packs={packs}
        vpa={vpa}
        defaultEmail=""
        cardPacks={getDodoPacks().map(({ usd, tokens }) => ({ usd, tokens }))}
      />
    </div>
  );
}
