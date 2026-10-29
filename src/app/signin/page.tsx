"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { BackIcon } from "@/components/Icons";
import SignInCard from "@/components/SignInCard";
import { safeNext } from "@/lib/supabase/config";

export default function SignInPage() {
  const [next, setNext] = useState("/my");
  const [failed, setFailed] = useState(false);
  const { user, ready } = useAuth();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setNext(safeNext(q.get("next")));
    setFailed(q.get("error") === "1");
  }, []);

  // Already signed in (for example Google finished but this page was restored): carry on.
  useEffect(() => {
    if (ready && user) {
      const target = safeNext(new URLSearchParams(window.location.search).get("next"));
      window.location.replace(target);
    }
  }, [ready, user]);

  return (
    <>
      <header className="topbar">
        <Link href="/" className="back" aria-label="Back to home">
          <BackIcon />
        </Link>
        <h1>Sign in</h1>
      </header>
      <main className="page" style={{ paddingTop: 8 }}>
        <SignInCard next={next} failed={failed} />
        <p className="fine">
          Browsing rides never needs sign-in. Google is used only to post, edit
          or delete a ride, and to open a WhatsApp chat.
        </p>
      </main>
    </>
  );
}
