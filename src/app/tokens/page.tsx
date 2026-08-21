import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { TOKEN_PACKS, formatTokens, upiPayUri } from "@/lib/tokens";
import BuyTokensForm from "@/components/BuyTokensForm";

export const dynamic = "force-dynamic";

export default async function TokensPage() {
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
    <div className="pt-12 max-w-lg mx-auto">
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="text-2xl font-bold">Buy tokens</h1>
        <span className="tabular-nums font-semibold">{formatTokens(balance)}</span>
      </div>
      <p className="text-sm opacity-70 mb-8">
        Pay with any UPI app — scan the QR or send to{" "}
        <span className="font-mono font-medium">{vpa || "(UPI ID coming soon)"}</span>,
        then enter your payment reference below. Tokens land after a quick
        verification, confirmed to your email.
      </p>

      <BuyTokensForm packs={packs} vpa={vpa} defaultEmail={user?.email ?? ""} />
    </div>
  );
}
