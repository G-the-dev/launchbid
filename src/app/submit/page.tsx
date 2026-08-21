import SubmitForm from "@/components/SubmitForm";
import { WELCOME_TOKENS } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-lg pt-12">
      <h1 className="text-2xl font-semibold">List your product</h1>
      <p className="mt-1 mb-8 text-base text-pretty text-zinc-400">
        Paste your URL and we'll pull the name and description — you can edit
        both. Your first listing earns {WELCOME_TOKENS} free tokens.
      </p>
      <SubmitForm />
    </div>
  );
}
