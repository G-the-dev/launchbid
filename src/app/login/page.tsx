import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <div className="pt-16 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-center">Sign in to LaunchBid</h1>
      <p className="text-sm opacity-70 text-center mt-2 mb-8">
        Submit your product and start bidding for the top spot.
      </p>
      <LoginForm next={next ?? "/"} authError={error} />
    </div>
  );
}
