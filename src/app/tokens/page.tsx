import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { TOKEN_PACKS, formatTokens, upiPayUri } from "@/lib/tokens";
import BuyTokensForm from "@/components/BuyTokensForm";

export const dynamic = "force-dynamic";

export default async function TokensPage() {
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

  const vpa = process.env.NEXT_PUBLIC_UPI_VPA ?? "";
  const packs = await Promise.all(
    TOKEN_PACKS.map(async (pack) => ({
      ...pack,
      qr: vpa
        ? await QRCode.toDataURL(upiPayUri(vpa, pack.inr), {
            margin: 1,
            width: 240,
          })
        : null,
    }))
  );

  return (
    <div className="mx-auto max-w-lg pt-12">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold">Buy tokens</h1>
        <span className="text-sm tabular-nums text-zinc-400">
          Your balance: {formatTokens(balance)}
        </span>
      </div>
      <p className="mt-1 mb-8 text-base text-pretty text-zinc-400">
        Pay with any UPI app in three steps — pick a pack, scan, confirm.
        Tokens land after we match your payment, confirmed by email.
      </p>

      <BuyTokensForm packs={packs} vpa={vpa} defaultEmail={user?.email ?? ""} />
    </div>
  );
}
