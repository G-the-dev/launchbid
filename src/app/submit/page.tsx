import SubmitForm from "@/components/SubmitForm";
import { WELCOME_TOKENS } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  return (
    <div className="mx-auto max-w-lg pt-12">
      <h1 className="text-2xl font-semibold">List your product</h1>
      <p className="mt-1 mb-8 text-base text-pretty text-zinc-400">
        Paste your URL and we&apos;ll pull the name and description. You can
        edit both. Your first listing earns {WELCOME_TOKENS} free tokens.
      </p>
      <SubmitForm initialUrl={url ?? ""} />
    </div>
  );
}
