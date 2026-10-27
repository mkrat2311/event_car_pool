"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import PlaceInput from "@/components/PlaceInput";
import { PinIcon } from "@/components/Icons";
import { getEvent } from "@/lib/event";
import { distanceKm } from "@/lib/geo";
import { LOCAL_PLACES } from "@/lib/places";
import { useListings } from "@/lib/store";
import { istDateKey } from "@/lib/time";
import { LEG_TAB, type Leg, type ListingType, type Place } from "@/lib/types";

const LEGS: Leg[] = ["TO_EVENT", "LOCAL_TO_START", "RETURN"];
const RADII = [10, 25, 50, 100];
const DEFAULT_PLACE: Place = LOCAL_PLACES[0];

export default function FindPage() {
  const ev = getEvent();
  const { all } = useListings();
  const [leg, setLeg] = useState<Leg>("TO_EVENT");
  const [place, setPlace] = useState<Place | null>(DEFAULT_PLACE);
  const [date, setDate] = useState("any");
  const [race, setRace] = useState("any");
  const [radius, setRadius] = useState(25);
  const [kind, setKind] = useState<ListingType>("OFFER");

  function chooseLeg(next: Leg) {
    setLeg(next);
    setPlace(next === "LOCAL_TO_START" ? null : DEFAULT_PLACE);
  }

  const matches = useMemo(() => {
    return all
      .filter((l) => l.leg === leg && l.status === "ACTIVE")
      .filter((l) => date === "any" || istDateKey(l.departAt) === date)
      .filter((l) => race === "any" || l.categoryId === race)
      .filter((l) => {
        if (!place) return true;
        const far = leg === "RETURN" ? l.dest : l.origin;
        return distanceKm(place, far) <= radius;
      })
      .sort((a, b) => a.departAt.localeCompare(b.departAt));
  }, [all, leg, date, race, radius, place]);

  const offers = matches.filter((l) => l.type === "OFFER");
  const requests = matches.filter((l) => l.type === "REQUEST");
  const shown = kind === "OFFER" ? offers : requests;

  const placeLabel =
    leg === "TO_EVENT"
      ? "From"
      : leg === "RETURN"
        ? "Going to"
        : "Staying near (optional)";
  const fixedLabel =
    leg === "RETURN"
      ? "From (event location, filled in for you)"
      : "To (event location, filled in for you)";
  const fixedValue =
    leg === "LOCAL_TO_START" ? ev.parking.label : ev.venue.label;

  const fixedField = (
    <div className="field">
      <label htmlFor="fixed">{fixedLabel}</label>
      <div className="with-icon">
        <PinIcon size={20} color="#566a5e" />
        <input id="fixed" className="input locked" value={fixedValue} readOnly />
      </div>
    </div>
  );

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
              onClick={() => chooseLeg(l)}
            >
              {LEG_TAB[l]}
            </button>
          ))}
        </div>

        <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {leg === "RETURN" ? fixedField : null}
          <PlaceInput
            key={leg}
            id="search-place"
            label={placeLabel}
            value={place}
            onChange={setPlace}
          />
          {leg !== "RETURN" ? fixedField : null}
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
          <select
            aria-label="Distance from your place"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          >
            {RADII.map((r) => (
              <option key={r} value={r}>
                Within {r} km
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
                Try a wider distance, another date, or post your own.
              </p>
              <Link href="/offer" className="btn btn-primary">
                Post a ride
              </Link>
            </div>
          )}
        </div>

        <p className="fine">
          {place
            ? `Showing rides within ${radius} km of your place, soonest first.`
            : "Showing all rides for this trip, soonest first."}
        </p>
      </main>
      <BottomNav />
    </>
  );
}
