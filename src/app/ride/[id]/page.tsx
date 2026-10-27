"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackIcon, ChatIcon } from "@/components/Icons";
import { getEvent } from "@/lib/event";
import { initial, seatsLabel } from "@/lib/format";
import { reportListing, useListings, whatsappUrl } from "@/lib/store";
import { supabaseEnabled } from "@/lib/supabase/config";
import { fmtDate, fmtTime } from "@/lib/time";
import { LEG_LABEL } from "@/lib/types";

export default function RideDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const ev = getEvent();
  const router = useRouter();
  const { all, ready, userId } = useListings();
  const [reported, setReported] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("contact");
    if (c === "slow") setNotice("Too many chats opened in a short time. Please wait a few minutes.");
    else if (c === "unavailable")
      setNotice("This person cannot be reached right now. The ride may be full or removed.");
  }, []);

  async function report(listingId: string) {
    if (!supabaseEnabled) {
      setReported(true);
      return;
    }
    if (!userId) {
      router.push(`/signin?next=${encodeURIComponent(`/ride/${listingId}`)}`);
      return;
    }
    const failed = await reportListing(listingId);
    if (failed) setNotice(failed);
    else setReported(true);
  }

  const listing = all.find((l) => l.id === id);

  if (!listing) {
    return (
      <>
        <header className="topbar">
          <Link href="/find" className="back" aria-label="Back to results">
            <BackIcon />
          </Link>
          <h1>Ride details</h1>
        </header>
        <main className="page">
          <p className="sub">{ready ? "We could not find that ride." : "Loading…"}</p>
          {ready ? (
            <Link href="/find" className="btn btn-primary">
              Back to all rides
            </Link>
          ) : null}
        </main>
      </>
    );
  }

  const cat = ev.categories.find((c) => c.id === listing.categoryId);
  const when = `${fmtDate(listing.departAt)} at ${fmtTime(listing.departAt)}`;
  const route = `${listing.origin.label} to ${listing.dest.label}`;
  const message =
    listing.type === "OFFER"
      ? `Hi ${listing.displayName}, I saw your ride for ${ev.shortName} on ${when}, ${route}. Is a seat still free?`
      : `Hi ${listing.displayName}, I saw your request for a seat for ${ev.shortName} on ${when}, ${route}. I may be able to help. Are you still looking?`;
  const mine = listing.ownerId === userId;
  const chatHref = supabaseEnabled
    ? `/connect/${listing.id}?text=${encodeURIComponent(message)}`
    : whatsappUrl(listing, message);

  return (
    <>
      <header className="topbar">
        <Link href="/find" className="back" aria-label="Back to results">
          <BackIcon />
        </Link>
        <h1>Ride details</h1>
      </header>

      <main className="page" style={{ gap: 12, paddingTop: 8 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="row" style={{ padding: 0 }}>
            <span className="avatar lg">{initial(listing.displayName)}</span>
            <div className="grow">
              <div className="strong" style={{ fontSize: 18 }}>
                {listing.displayName}
              </div>
              <div className="small">
                {listing.type === "OFFER" ? "Offering a ride" : "Looking for a ride"}
              </div>
            </div>
            <span className={listing.status === "FULL" ? "chip dark" : "chip green"}>
              {seatsLabel(listing)}
            </span>
          </div>

          <div className="route">
            <div className="rail">
              <span className="dot" />
              <span className="line" />
              <span className="dot hollow" />
            </div>
            <div className="stops">
              <div>
                <div className="strong">{listing.origin.label}</div>
                <div className="small">
                  {fmtDate(listing.departAt)} · leaves {fmtTime(listing.departAt)}
                </div>
              </div>
              <div>
                <div className="strong">{listing.dest.label}</div>
                <div className="small">
                  {listing.leg === "TO_EVENT"
                    ? "Event area, near the Start Area"
                    : LEG_LABEL[listing.leg]}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="list">
          <div className="kv">
            <span>Race</span>
            <span>{cat ? `${cat.name}, starts ${fmtTime(cat.startAt)}` : "Not running"}</span>
          </div>
          <div className="kv">
            <span>Cost</span>
            <span>{listing.costNote || "Not specified"}</span>
          </div>
          <div className="kv">
            <span>Trip</span>
            <span>{LEG_LABEL[listing.leg]}</span>
          </div>
        </div>

        {listing.notes ? (
          <div className="card pad">
            <div className="label" style={{ marginBottom: 4 }}>
              Note from {listing.displayName}
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{listing.notes}</p>
          </div>
        ) : null}

        {!mine ? (
          <div className="callout">
            <div className="label" style={{ color: "#1e5a3c", marginBottom: 4 }}>
              Message we will prefill in WhatsApp
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{message}</p>
          </div>
        ) : null}
      </main>

      <footer className="footer-cta">
        {mine ? (
          <Link href={`/my/edit/${listing.id}`} className="btn btn-primary block">
            Edit your listing
          </Link>
        ) : (
          <a
            href={chatHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary block"
          >
            <ChatIcon size={22} />
            Chat on WhatsApp
          </a>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            gap: 12,
          }}
        >
          <p className="fine" style={{ maxWidth: 250 }}>
            {reported
              ? supabaseEnabled
                ? "Thanks. We will look at this listing."
                : "Thanks. Reported (demo: nothing is sent yet)."
              : "Opens WhatsApp. We only connect people; travel is at your own risk."}
          </p>
          {!mine && !reported ? (
            <button
              type="button"
              className="linkbtn"
              style={{ color: "#a33a2b" }}
              onClick={() => void report(listing.id)}
            >
              Report
            </button>
          ) : null}
        </div>
        {notice ? (
          <p className="error" role="alert" style={{ marginTop: 6 }}>
            {notice}
          </p>
        ) : null}
        {supabaseEnabled || listing.contact || mine ? null : (
          <p className="fine" style={{ marginTop: 6 }}>
            Sample ride: WhatsApp will ask you to pick a contact. Real listings open the poster&apos;s chat.
          </p>
        )}
      </footer>
    </>
  );
}
