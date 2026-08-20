"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({
  next,
  authError,
}: {
  next: string;
  authError?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(
    authError ? "Sign-in failed. Please try again." : null
  );

  const callbackUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const signInWithGoogle = async () => {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    if (error) setError(error.message);
  };

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl() },
    });
    if (error) {
      setError(error.message);
      setStatus("idle");
    } else {
      setStatus("sent");
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={signInWithGoogle}
        className="w-full rounded-xl border border-black/15 dark:border-white/15 py-2.5 font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        Continue with Google
      </button>

      <div className="flex items-center gap-3 text-xs opacity-50">
        <span className="flex-1 border-t border-current" />
        or
        <span className="flex-1 border-t border-current" />
      </div>

      {status === "sent" ? (
        <p className="text-center text-sm rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 py-3 px-4">
          Magic link sent — check your email and open it on this device.
        </p>
      ) : (
        <form onSubmit={sendMagicLink} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-transparent px-4 py-2.5 outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-xl bg-foreground text-background py-2.5 font-medium disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Email me a magic link"}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}
