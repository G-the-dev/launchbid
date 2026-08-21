import QRCode from "qrcode";
import { getBalance } from "@/lib/data";
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

export const dynamic = "force-dynamic";

export default async function TokensPage() {
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

      <BuyTokensForm packs={packs} vpa={vpa} defaultEmail="" />
    </div>
  );
}
