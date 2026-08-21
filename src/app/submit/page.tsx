import { createClient } from "@/lib/supabase/server";
import SubmitForm from "@/components/SubmitForm";
import { LISTING_COST_TOKENS, SHARE_X_TOKENS } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;

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

  return (
    <div className="mx-auto max-w-lg pt-12">
      <h1 className="pixel-text text-2xl uppercase">Spawn your product</h1>
      <p className="mt-1 mb-8 text-base text-pretty text-mcgray">
        Paste your URL and we&apos;ll pull the name and description. Spawning
        costs {LISTING_COST_TOKENS} ⚡. Short on tokens? One verified X share
        earns {SHARE_X_TOKENS} ⚡, right in this flow.
      </p>
      <SubmitForm initialUrl={url ?? ""} balance={balance} />
    </div>
  );
}
