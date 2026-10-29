"use client";

import { useEffect, useState } from "react";
import { signInWithGoogle } from "@/lib/auth";

/** Google blocks sign-in inside embedded webviews (WhatsApp, Instagram, Facebook). */
function inEmbeddedBrowser(): boolean {
  const ua = navigator.userAgent;
  return /FBAN|FBAV|Instagram|Line\/|; wv\)|WhatsApp/i.test(ua);
}

export default function SignInCard({ next, failed }: { next: string; failed?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(failed ? "Sign-in did not finish. Please try again." : "");
  const [embedded, setEmbedded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setEmbedded(inEmbeddedBrowser()), []);

  // Safari restores this page from its back/forward cache with the button still
  // disabled when someone comes back from Google or WhatsApp. Reset it.
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => {
      if (e.persisted) setBusy(false);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  async function start() {
    setBusy(true);
    setError("");
    const message = await signInWithGoogle(next);
    if (message) {
      setError("Could not start Google sign-in. Please try again.");
      setBusy(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div className="strong">Sign in to continue</div>
        <p className="sub" style={{ margin: "4px 0 0" }}>
          We use Google only to know who owns a ride, so only you can edit or
          delete it. We never see your Google password.
        </p>
      </div>

      {embedded ? (
        <div className="callout warn" style={{ padding: "10px 12px" }}>
          <p className="fine" style={{ color: "#4a3300" }}>
            Google does not allow sign-in inside WhatsApp&apos;s built-in browser.
            Open this page in Chrome or Safari (menu, then Open in browser), or
            copy the link and paste it there.
          </p>
          <button type="button" className="linkbtn" onClick={copyLink}>
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      ) : null}

      <button type="button" className="btn btn-primary block" onClick={start} disabled={busy}>
        {busy ? "Opening Google…" : "Continue with Google"}
      </button>

      {busy ? (
        <p className="fine">
          Signing you in. This can take a few seconds.
          {next.startsWith("/connect") ? " WhatsApp opens when it is done." : ""}
        </p>
      ) : null}

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
