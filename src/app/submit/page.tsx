import { getBalance } from "@/lib/data";
import SubmitForm from "@/components/SubmitForm";
import { LISTING_COST_TOKENS, SHARE_X_TOKENS } from "@/lib/tokens";

export const metadata = {
  alternates: { canonical: "/submit" },
  title: "Submit your product",
  description:
    "Submit your product to the LaunchBid leaderboard and promote it by bidding tokens. Listing costs 50 tokens; one verified share on X covers it.",
};

export const dynamic = "force-dynamic";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;

  const balance = await getBalance();

  return (
    <div className="mx-auto max-w-lg pt-12">
      <h1 className="pixel-text text-2xl uppercase">Spawn your product</h1>
      <p className="mt-1 mb-8 text-base text-pretty text-mcgray">
        Paste your URL and we&apos;ll pull the name and description. Spawning
        costs {LISTING_COST_TOKENS} tokens. Short on them? One verified X
        share earns {SHARE_X_TOKENS}, right in this flow.
      </p>
      <SubmitForm initialUrl={url ?? ""} balance={balance} />
    </div>
  );
}
