"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BibCard from "@/components/BibCard";
import { BackIcon } from "@/components/Icons";
import { transfersClosed, useBibs } from "@/lib/bibStore";
import { getEvent } from "@/lib/event";
import { daysLeft } from "@/lib/format";
import { fmtDate } from "@/lib/time";
import type { BibListing } from "@/lib/types";

const STEPS = [
  {
    title: "Runner giving up the bib lists it",
    text: "Pick the race and sign in with Google.",
  },
  {
    title: "Interested runner chats on WhatsApp",
    text: "Agree the details. The fee is paid directly to the runner giving up the bib, outside this app.",
  },
  {
    title: "Email the organisers",
    text: "The runner giving up the bib emails the organisers and copies the replacement. The organisers finish the transfer.",
  },
];

export default function BibsClient({ initial }: { initial?: BibListing[] }) {
  const ev = getEvent();
  const { all, mine, ready, userId } = useBibs(initial);
  const [race, setRace] = useState("any");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("contact");
    if (c === "slow") setNotice("Too many chats opened in a short time. Please wait a few minutes.");
    else if (c === "unavailable")
      setNotice("This runner cannot be reached right now. The bib may already be taken.");
  }, []);

  const closed = transfersClosed();
  const left = daysLeft(ev.bibTransferDeadlineAt);
  const deadline = fmtDate(ev.bibTransferDeadlineAt);
  const hasMine = mine.length > 0;

  const shown = all
    .filter((b) => b.status === "ACTIVE")
    .filter((b) => race === "any" || b.categoryId === race);

  return (
    <>
      <header className="topbar">
        <Link href="/" className="back" aria-label="Back to home">
          <BackIcon />
        </Link>
        <h1>Bib transfer</h1>
      </header>

      <main className="page" style={{ paddingTop: 8, gap: 16 }}>
        <div className="callout warn" style={{ padding: "12px 14px" }}>
          <div className="strong" style={{ color: "#4a3300", fontSize: 15 }}>
            {closed ? `Transfers closed on ${deadline}` : `Transfers close ${deadline}`}
          </div>
          <p className="fine" style={{ color: "#4a3300", fontSize: 13 }}>
            {closed
              ? "The organisers allow no exceptions."
              : `${left === 1 ? "Last day." : `${left} days left.`} The organisers allow no exceptions.`}
          </p>
        </div>

        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
          Can&apos;t run? List your bib here. Want one? Chat with the runner on WhatsApp. The bib
          must stay in the same race.
        </p>

        {closed ? null : hasMine ? (
          <Link href="/my" className="btn btn-outline block">
            View my bib listing
          </Link>
        ) : (
          <Link href="/bibs/new" className="btn btn-primary block">
            List my bib
          </Link>
        )}

        {notice ? (
          <p className="error" role="alert">
            {notice}
          </p>
        ) : null}

        {closed ? null : (
          <>
            <div>
              <div className="label">Race</div>
              <div className="chips">
                <button
                  type="button"
                  className="pill"
                  aria-pressed={race === "any"}
                  onClick={() => setRace("any")}
                >
                  All
                </button>
                {ev.categories.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    className="pill"
                    aria-pressed={race === c.id}
                    onClick={() => setRace(c.id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="small" style={{ fontWeight: 700 }}>
              {!ready
                ? "Loading…"
                : `${shown.length} ${shown.length === 1 ? "bib" : "bibs"} available`}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ready && shown.length === 0 ? (
                <div className="card empty">
                  <div className="strong">No bibs listed yet</div>
                  <p className="sub" style={{ margin: "6px 0 0" }}>
                    Check back soon, or try another race.
                  </p>
                </div>
              ) : (
                shown.map((b) => (
                  <BibCard key={b.id} bib={b} canChat={b.ownerId !== userId} />
                ))
              )}
            </div>
          </>
        )}

        <section>
          <h2 className="section">How a transfer works</h2>
          <div
            className="card pad"
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {STEPS.map((s, i) => (
              <div key={s.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span className="step-num">{i + 1}</span>
                <div>
                  <div className="strong" style={{ fontSize: 15 }}>
                    {s.title}
                  </div>
                  <div className="small" style={{ lineHeight: 1.4 }}>
                    {s.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="fine">
          Same race only, and the replacement must meet the race&apos;s eligibility rules. We only
          connect people. A transfer counts only when the organisers confirm it. Organisers:{" "}
          {ev.bibTransferEmail}
        </p>
      </main>
    </>
  );
}
