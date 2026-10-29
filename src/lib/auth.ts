"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { getBrowserClient } from "./supabase/browser";
import { supabaseEnabled } from "./supabase/config";

export interface AuthUser {
  id: string;
  name: string;
}

function toUser(u: User | null): AuthUser | null {
  if (!u) return null;
  const meta = u.user_metadata as { full_name?: string; name?: string };
  return { id: u.id, name: meta.full_name ?? meta.name ?? "" };
}

/** Who is signed in. In demo mode there is no sign-in and this is always ready. */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(!supabaseEnabled);

  useEffect(() => {
    if (!supabaseEnabled) return;
    const sb = getBrowserClient();
    // Local read of the saved session: no network wait. RLS protects the data.
    void sb.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session?.user ?? null));
      setReady(true);
    });
    const { data } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session?.user ?? null));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await getBrowserClient().auth.signOut();
    window.location.href = "/";
  }, []);

  return { user, ready, signOut };
}

/** Starts Google sign-in. Basic scopes only (openid, email, profile). */
export async function signInWithGoogle(next: string): Promise<string | null> {
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const { error } = await getBrowserClient().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  return error ? error.message : null;
}
