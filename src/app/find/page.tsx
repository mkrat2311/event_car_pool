"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { getEvent } from "@/lib/event";
import { useListings } from "@/lib/store";
import { istDateKey } from "@/lib/time";
import { LEG_TAB, type Leg, type ListingType } from "@/lib/types";

const LEGS: Leg[] = ["TO_EVENT", "LOCAL_TO_START", "RETURN"];

export default function FindPage() {
  const ev = getEvent();
  const { all } = useListings();
  const [leg, setLeg] = useState<Leg>("TO_EVENT");
  const [date, setDate] = useState("any");
  const [race, setRace] = useState("any");
  const [kind, setKind] = useState<ListingType>("OFFER");

  const matches = useMemo(() => {
    return all
      .filter((l) => l.leg === leg && l.status === "ACTIVE")
      .filter((l) => date === "any" || istDateKey(l.departAt) === date)
      .filter((l) => race === "any" || l.categoryId === race)
      .sort((a, b) => a.departAt.localeCompare(b.departAt));
  }, [all, leg, date, race]);

  const offers = matches.filter((l) => l.type === "OFFER");
  const requests = matches.filter((l) => l.type === "REQUEST");
  const shown = kind === "OFFER" ? offers : requests;

  return (
    <>
      <main className="page" style={{ gap: 14 }}>
        <div>
          <h1 className="title">Find a ride</h1>
          <p className="sub">{ev.name} · no sign-in needed to browse</p>
        </div>

        <div className="segment" role="tablist" aria-label="Trip leg">
          {LEGS.map((l) => (
            <button
              key={l}
              role="tab"
              aria-selected={leg === l}
              onClick={() => setLeg(l)}
            >
              {LEG_TAB[l]}
            </button>
          ))}
        </div>

        <div className="filters">
          <select aria-label="Date" value={date} onChange={(e) => setDate(e.target.value)}>
            <option value="any">Any date</option>
            {ev.days.map((d) => (
              <option key={d.id} value={d.date}>
                {d.short}
              </option>
            ))}
          </select>
          <select aria-label="Race" value={race} onChange={(e) => setRace(e.target.value)}>
            <option value="any">Any race</option>
            {ev.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="tabs" role="tablist" aria-label="Offers or requests">
          <button role="tab" aria-selected={kind === "OFFER"} onClick={() => setKind("OFFER")}>
            Offers · {offers.length}
          </button>
          <button role="tab" aria-selected={kind === "REQUEST"} onClick={() => setKind("REQUEST")}>
            Requests · {requests.length}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shown.length > 0 ? (
            shown.map((l) => <ListingCard key={l.id} listing={l} />)
          ) : (
            <div className="card empty">
              <div className="strong">
                {kind === "OFFER" ? "No offers match yet" : "No requests match yet"}
              </div>
              <p className="sub" style={{ margin: "6px 0 14px" }}>
                Try another date, or post your own.
              </p>
              <Link href="/offer" className="btn btn-primary">
                Post a ride
              </Link>
            </div>
          )}
        </div>

        <p className="fine">
          Showing all rides for this trip, soonest first. Riders can often
          be picked up along the way, so check each route.
        </p>
      </main>
      <BottomNav />
    </>
  );
}
