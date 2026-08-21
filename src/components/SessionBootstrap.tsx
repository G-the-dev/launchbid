"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// No sign-in: every visitor gets an anonymous Supabase session on first visit.
// Tokens and listings hang off that browser identity.
export default function SessionBootstrap() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (!error) router.refresh();
      }
    });
  }, [router]);

  return null;
}
