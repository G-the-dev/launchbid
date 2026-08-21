import SubmitForm from "@/components/SubmitForm";

export const dynamic = "force-dynamic";

export default function SubmitPage() {
  return (
    <div className="pt-12 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Submit your product</h1>
      <p className="text-sm opacity-70 mt-2 mb-8">
        Paste your website URL — we&apos;ll pull the name and description, you
        tweak it, then boost it onto the board. Your first listing earns a
        25-token welcome bonus.
      </p>
      <SubmitForm />
    </div>
  );
}
