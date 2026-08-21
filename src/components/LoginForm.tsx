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

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
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
            autoFocus
            className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-transparent px-4 py-2.5 outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-xl bg-amber-500 text-black py-2.5 font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {status === "sending" ? "Sending…" : "Email me a magic link"}
          </button>
        </form>
      )}
      <p className="text-xs opacity-60 text-center">
        No password needed — the link signs you in.
      </p>
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}
