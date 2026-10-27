"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import BottomNav from "@/components/BottomNav";
import SignInCard from "@/components/SignInCard";
import { EditIcon, TrashIcon } from "@/components/Icons";
import { getEvent } from "@/lib/event";
import { seatsLabel } from "@/lib/format";
import { useListings } from "@/lib/store";
import { supabaseEnabled } from "@/lib/supabase/config";
import { fmtDate, fmtTime } from "@/lib/time";
import type { Listing } from "@/lib/types";

export default function MyListingsPage() {
  const ev = getEvent();
  const { mine, ready, update, remove } = useListings();
  const [tab, setTab] = useState<"active" | "past">("active");
  const [message, setMessage] = useState("");
  const { user, ready: authReady, signOut } = useAuth();

  const now = Date.now();
  const active = mine.filter((l) => new Date(l.departAt).getTime() >= now);
  const past = mine.filter((l) => new Date(l.departAt).getTime() < now);
  const shown = tab === "active" ? active : past;

  async function toggleStatus(l: Listing) {
    setMessage((await update({ ...l, status: l.status === "ACTIVE" ? "FULL" : "ACTIVE" })) ?? "");
  }

  async function confirmDelete(l: Listing) {
    if (window.confirm("Delete this listing? This cannot be undone.")) {
      setMessage((await remove(l.id)) ?? "");
    }
  }

  if (supabaseEnabled && authReady && !user) {
    return (
      <>
        <main className="page" style={{ gap: 14 }}>
          <div>
            <h1 className="title">My listings</h1>
            <p className="sub">Sign in to see and manage your rides</p>
          </div>
          <SignInCard next="/my" />
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <main className="page" style={{ gap: 14 }}>
        <div>
          <h1 className="title">My listings</h1>
          <p className="sub">Only you can edit or delete these</p>
        </div>

        {message ? (
          <p className="error" role="alert">
            {message}
          </p>
        ) : null}

        <div className="tabs" role="tablist" aria-label="Active or past">
          <button role="tab" aria-selected={tab === "active"} onClick={() => setTab("active")}>
            Active · {active.length}
          </button>
          <button role="tab" aria-selected={tab === "past"} onClick={() => setTab("past")}>
            Past · {past.length}
          </button>
        </div>

        {!ready ? (
          <p className="sub">Loading…</p>
        ) : shown.length === 0 ? (
          <div className="card empty">
            <div className="strong">
              {tab === "active" ? "No rides posted yet" : "Nothing in the past"}
            </div>
            {tab === "active" ? (
              <>
                <p className="sub" style={{ margin: "6px 0 14px" }}>
                  Offer a seat or ask for one, and people can reach you on WhatsApp.
                </p>
                <Link href="/offer" className="btn btn-primary">
                  Post a ride
                </Link>
              </>
            ) : null}
          </div>
        ) : (
          shown.map((l) => {
            const cat = ev.categories.find((c) => c.id === l.categoryId);
            const full = l.status === "FULL";
            const toggleLabel = full
              ? "Reopen"
              : l.type === "OFFER"
                ? "Mark full"
                : "Got a ride";
            return (
              <div className="card pad" key={l.id}>
                <div className="chips" style={{ marginBottom: 8 }}>
                  <span className={l.type === "OFFER" ? "chip sm green" : "chip sm night"}>
                    {l.type === "OFFER" ? "Offer" : "Request"}
                  </span>
                  <span className={full ? "chip sm dark" : "chip sm"}>
                    {full ? "Full" : "Live"}
                  </span>
                </div>
                <div className="strong">
                  {l.origin.label} to {l.dest.label}
                </div>
                <div className="small" style={{ marginTop: 2 }}>
                  {fmtDate(l.departAt)} · {fmtTime(l.departAt)} · {seatsLabel(l)}
                  {cat ? ` · ${cat.name}` : ""}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Link href={`/my/edit/${l.id}`} className="btn btn-outline grow">
                    <EditIcon size={18} />
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline grow"
                    onClick={() => toggleStatus(l)}
                  >
                    {toggleLabel}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger grow"
                    onClick={() => confirmDelete(l)}
                  >
                    <TrashIcon size={18} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}

        {supabaseEnabled ? (
          user ? (
            <p className="fine">
              Signed in with Google.{" "}
              <button type="button" className="linkbtn" onClick={() => void signOut()}>
                Sign out
              </button>
            </p>
          ) : null
        ) : (
          <p className="fine">
            Demo mode: your rides are saved in this browser only. Google sign-in,
            sign out and account deletion arrive in the next step.
          </p>
        )}
      </main>
      <BottomNav />
    </>
  );
}
