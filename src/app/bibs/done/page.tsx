"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { transferEmailUrl } from "@/lib/bibStore";
import { getEvent } from "@/lib/event";
import { fmtDate } from "@/lib/time";

const STEPS = [
  {
    title: "Agree the details on WhatsApp",
    text: "The replacement pays the fee directly to you, outside this app.",
  },
  {
    title: "Email the organisers",
    text: "Write to the organisers and copy the runner taking your bib.",
  },
  {
    title: "Mark your bib as taken",
    text: "Do it from My listings so others stop asking.",
  },
];

export default function BibDonePage() {
  const ev = getEvent();
  const [catId, setCatId] = useState("");

  useEffect(() => {
    setCatId(new URLSearchParams(window.location.search).get("c") ?? "");
  }, []);

  const cat = ev.categories.find((c) => c.id === catId);
  const catName = cat?.name ?? "your race";

  return (
    <main className="page" style={{ paddingTop: 36, gap: 18 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 }}>
        <span
          className="icon-tile"
          style={{ width: 56, height: 56, borderRadius: 28 }}
          aria-hidden="true"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h1 className="title" style={{ margin: 0 }}>
          Your bib is listed
        </h1>
        <p className="sub" style={{ margin: 0 }}>
          {catName} · Runners can now chat with you on WhatsApp.
        </p>
      </div>

      <section>
        <h2 className="section">When someone is interested</h2>
        <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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

      <div className="callout warn" style={{ padding: "12px 14px" }}>
        <p className="fine" style={{ color: "#4a3300", fontSize: 13 }}>
          <strong>Last date for transfers is {fmtDate(ev.bibTransferDeadlineAt)}.</strong> Send the
          email as soon as you have a replacement.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <a href={transferEmailUrl(catName)} className="btn btn-primary block">
          Email the organisers
        </a>
        <Link href="/my" className="btn btn-outline block">
          View my listings
        </Link>
      </div>
    </main>
  );
}
