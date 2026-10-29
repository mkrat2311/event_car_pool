"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { BackIcon } from "@/components/Icons";
import SignInCard from "@/components/SignInCard";
import { useAuth } from "@/lib/auth";
import { transfersClosed, useBibs } from "@/lib/bibStore";
import { getEvent } from "@/lib/event";
import { firstName } from "@/lib/format";
import { loadAccountProfile, loadProfile, saveAccountProfile, saveProfile } from "@/lib/store";
import { supabaseEnabled } from "@/lib/supabase/config";

export default function ListBibPage() {
  const ev = getEvent();
  const router = useRouter();
  const { user, ready: authReady } = useAuth();
  const { mine, ready, add } = useBibs();

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (supabaseEnabled) {
      if (!user) return;
      void loadAccountProfile(user.id).then((p) => {
        setName((cur) => cur || p.name || user.name);
        setPhone((cur) => cur || p.whatsapp);
      });
      return;
    }
    const p = loadProfile();
    if (p.name) setName(p.name);
    if (p.whatsapp) setPhone(p.whatsapp);
  }, [user]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (!categoryId) return setError("Please pick the race your bib is for.");
    if (!name.trim()) return setError("Please enter your name.");
    if (digits.length !== 10) return setError("Enter a 10-digit WhatsApp number.");
    if (!agree) return setError("Please tick the box to confirm you understand.");
    setError("");
    setSaving(true);

    if (supabaseEnabled && user) {
      const failed = await saveAccountProfile(user.id, { name: name.trim(), whatsapp: digits });
      if (failed) {
        setError(failed);
        setSaving(false);
        return;
      }
    } else {
      saveProfile({ name: name.trim(), whatsapp: digits });
    }

    const failed = await add({
      categoryId,
      note: note.trim(),
      displayName: firstName(name),
      contact: supabaseEnabled ? undefined : `91${digits}`,
    });
    if (failed) {
      setError(failed);
      setSaving(false);
      return;
    }
    router.push(`/bibs/done?c=${encodeURIComponent(categoryId)}`);
  }

  const header = (
    <header className="topbar">
      <Link href="/bibs" className="back" aria-label="Back to bib transfer">
        <BackIcon />
      </Link>
      <h1>List my bib</h1>
    </header>
  );

  if (transfersClosed()) {
    return (
      <>
        {header}
        <main className="page" style={{ paddingTop: 8 }}>
          <div className="callout warn">
            <p className="fine" style={{ color: "#4a3300" }}>
              Bib transfers are closed. The organisers allow no exceptions.
            </p>
          </div>
        </main>
      </>
    );
  }

  if (supabaseEnabled && !authReady) {
    return (
      <>
        {header}
        <main className="page">
          <p className="sub">Loading…</p>
        </main>
      </>
    );
  }

  if (supabaseEnabled && !user) {
    return (
      <>
        {header}
        <main className="page" style={{ paddingTop: 8 }}>
          <SignInCard next="/bibs/new" />
        </main>
      </>
    );
  }

  // While saving, the new listing makes mine non-empty; keep the form until we navigate.
  if (ready && mine.length > 0 && !saving) {
    return (
      <>
        {header}
        <main className="page" style={{ paddingTop: 8, gap: 14 }}>
          <p className="sub">
            You already have a bib listed. Each person can list one bib, since you run one race.
          </p>
          <Link href="/my" className="btn btn-primary">
            View my listings
          </Link>
        </main>
      </>
    );
  }

  const cat = ev.categories.find((c) => c.id === categoryId);

  return (
    <>
      {header}
      <main className="page" style={{ paddingTop: 8 }}>
        <form
          onSubmit={submit}
          noValidate
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <p className="sub" style={{ margin: 0 }}>
            {ev.name}. Runners who want your bib will chat with you on WhatsApp.
          </p>

          <div>
            <div className="label">Which race is your bib for?</div>
            <div className="chips">
              {ev.categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className="pill"
                  aria-pressed={categoryId === c.id}
                  onClick={() => setCategoryId(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="hint" style={{ marginTop: 6 }}>
              {cat
                ? `The bib can only go to someone running ${cat.name}.`
                : "The bib can only go to someone running the same race."}
            </div>
          </div>

          <div className="field">
            <label htmlFor="note">Note (optional)</label>
            <textarea
              id="note"
              className="textarea"
              rows={3}
              maxLength={140}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why you cannot run, anything buyers should know"
            />
            <div className="hint">
              Keep it short. Do not add your phone number, email or bib number.
            </div>
          </div>

          <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {supabaseEnabled ? (
              <div className="label" style={{ margin: 0 }}>
                Your details
              </div>
            ) : (
              <div className="callout warn" style={{ padding: "10px 12px" }}>
                <p className="fine" style={{ color: "#4a3300" }}>
                  Demo mode: saved in this browser only.
                </p>
              </div>
            )}
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input
                id="name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <div className="hint">Others see only your first name</div>
            </div>
            <div className="field">
              <label htmlFor="wa">WhatsApp number</label>
              <div style={{ display: "flex", gap: 8 }}>
                <span
                  className="input locked"
                  style={{ width: "auto", display: "flex", alignItems: "center", fontWeight: 700 }}
                >
                  +91
                </span>
                <input
                  id="wa"
                  className="input"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  autoComplete="tel-national"
                />
              </div>
              <div className="hint">
                Used only when someone taps Chat on WhatsApp. It never appears on your listing.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <input
              id="agree"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              style={{ width: 24, height: 24, flex: "none", margin: 0, accentColor: "#1e5a3c" }}
            />
            <label htmlFor="agree" style={{ fontSize: 13, lineHeight: 1.45 }}>
              I understand the transfer counts only when the organisers confirm it by email. The
              fee is settled directly between the two runners, outside this app.
            </label>
          </div>

          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn btn-primary block" disabled={saving}>
            {saving ? "Listing…" : "List my bib"}
          </button>
        </form>
      </main>
    </>
  );
}
