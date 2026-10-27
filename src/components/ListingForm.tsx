"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { getEvent } from "@/lib/event";
import { firstName } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import {
  ME,
  loadAccountProfile,
  loadProfile,
  newId,
  saveAccountProfile,
  saveProfile,
  useListings,
} from "@/lib/store";
import { supabaseEnabled } from "@/lib/supabase/config";
import { fmtTime, istDateKey, istIso, istTimeInput } from "@/lib/time";
import {
  LEG_LABEL,
  type Leg,
  type Listing,
  type ListingType,
  type Place,
} from "@/lib/types";
import { MinusIcon, PlusIcon } from "./Icons";
import PlaceInput from "./PlaceInput";
import SignInCard from "./SignInCard";

const LEGS: Leg[] = ["TO_EVENT", "LOCAL_TO_START", "RETURN"];

const DEFAULT_DATE: Record<Leg, string> = {
  TO_EVENT: "2026-11-27",
  LOCAL_TO_START: "2026-11-28",
  RETURN: "2026-11-29",
};

interface Props {
  initial?: Listing;
}

export default function ListingForm({ initial }: Props) {
  const ev = getEvent();
  const router = useRouter();
  const pathname = usePathname() ?? "/offer";
  const { add, update } = useListings();
  const { user, ready: authReady } = useAuth();
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<ListingType>(initial?.type ?? "OFFER");
  const [leg, setLeg] = useState<Leg>(initial?.leg ?? "TO_EVENT");
  const [place, setPlace] = useState<Place | null>(
    initial ? (initial.leg === "RETURN" ? initial.dest : initial.origin) : null,
  );
  // The event end of the trip is pre-filled but can be changed, for example to a stay.
  const [fixed, setFixed] = useState<Place | null>(
    initial
      ? initial.leg === "RETURN"
        ? initial.origin
        : initial.dest
      : ev.venue,
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    initial ? initial.categoryId : "50k-day",
  );
  const [date, setDate] = useState(
    initial ? istDateKey(initial.departAt) : DEFAULT_DATE.TO_EVENT,
  );
  const [time, setTime] = useState(initial ? istTimeInput(initial.departAt) : "06:30");
  const [seats, setSeats] = useState(initial?.seats ?? 3);
  const [costNote, setCostNote] = useState(initial?.costNote ?? "Fuel split");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [name, setName] = useState(initial?.displayName ?? "");
  const [phone, setPhone] = useState(
    initial?.contact ? initial.contact.replace(/^91/, "") : "",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (supabaseEnabled) {
      if (!user) return;
      void loadAccountProfile(user.id).then((p) => {
        setName((cur) => cur || p.name || user.name);
        setPhone((cur) => cur || p.whatsapp);
      });
      return;
    }
    if (initial) return;
    const p = loadProfile();
    if (p.name) setName(p.name);
    if (p.whatsapp) setPhone(p.whatsapp);
  }, [initial, user]);

  function chooseLeg(next: Leg) {
    setLeg(next);
    setPlace(null);
    setFixed(next === "LOCAL_TO_START" ? ev.parking.place : ev.venue);
    setDate(DEFAULT_DATE[next]);
  }

  const cat = ev.categories.find((c) => c.id === categoryId);

  const fixedLabel = leg === "RETURN" ? "Leaving from" : "Going to";
  const fixedHint =
    leg === "LOCAL_TO_START"
      ? `Filled in for you. ${ev.parking.note}. Change it if you are going elsewhere.`
      : leg === "RETURN"
        ? "Filled in for you. Change it if you are leaving from your stay."
        : "Filled in for you. Change it if you are going to your stay.";
  const placeLabel =
    leg === "RETURN"
      ? "Going to"
      : leg === "LOCAL_TO_START"
        ? "Where you are staying"
        : type === "OFFER"
          ? "Leaving from"
          : "Travelling from";

  async function submit(e: FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (!place) {
      setError("Please pick a place from the list.");
      return;
    }
    if (!fixed) {
      setError(
        leg === "RETURN"
          ? "Please pick where you are leaving from."
          : "Please pick where you are going.",
      );
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (digits.length !== 10) {
      setError("Enter a 10-digit WhatsApp number.");
      return;
    }
    if (supabaseEnabled && !user) {
      setError("Please sign in with Google first.");
      return;
    }
    setError("");
    setSaving(true);

    if (supabaseEnabled && user) {
      const saved = await saveAccountProfile(user.id, {
        name: name.trim(),
        whatsapp: digits,
      });
      if (saved) {
        setError(saved);
        setSaving(false);
        return;
      }
    } else {
      saveProfile({ name: name.trim(), whatsapp: digits });
    }

    const listing: Listing = {
      id: initial?.id ?? newId(),
      ownerId: user?.id ?? ME,
      type,
      leg,
      categoryId,
      origin: leg === "RETURN" ? fixed : place,
      dest: leg === "RETURN" ? place : fixed,
      departAt: istIso(date, time),
      seats,
      costNote: costNote.trim(),
      notes: notes.trim(),
      displayName: firstName(name),
      status: initial?.status ?? "ACTIVE",
      // Demo mode only. With the database the number stays in the profile.
      contact: supabaseEnabled ? undefined : `91${digits}`,
    };
    const failed = initial ? await update(listing) : await add(listing);
    if (failed) {
      setError(failed);
      setSaving(false);
      return;
    }
    router.push("/my");
  }

  const fixedField = (
    <PlaceInput
      key={`fixed-${leg}`}
      id="fixed"
      label={fixedLabel}
      value={fixed}
      onChange={setFixed}
      hint={fixedHint}
    />
  );

  if (supabaseEnabled && !authReady) return <p className="sub">Loading…</p>;
  if (supabaseEnabled && !user) return <SignInCard next={pathname} />;

  return (
    <form
      onSubmit={submit}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div className="segment" role="tablist" aria-label="Offer or request">
        <button
          type="button"
          role="tab"
          aria-selected={type === "OFFER"}
          onClick={() => setType("OFFER")}
        >
          I have seats
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={type === "REQUEST"}
          onClick={() => setType("REQUEST")}
        >
          I need a seat
        </button>
      </div>

      <div>
        <div className="label">Which trip?</div>
        <div className="chips">
          {LEGS.map((l) => (
            <button
              type="button"
              key={l}
              className="pill"
              aria-pressed={leg === l}
              onClick={() => chooseLeg(l)}
            >
              {LEG_LABEL[l]}
            </button>
          ))}
        </div>
      </div>

      {leg === "RETURN" ? fixedField : null}
      <PlaceInput
        key={leg}
        id="place"
        label={placeLabel}
        value={place}
        onChange={setPlace}
        hint={
          leg === "LOCAL_TO_START"
            ? "Pick your homestay or hotel, or a landmark near it."
            : "Pick a landmark or area, not your home address. Everyone browsing can see it on a map."
        }
      />
      {leg !== "RETURN" ? fixedField : null}

      <div style={{ display: "flex", gap: 12 }}>
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="date">Date</label>
          <select
            id="date"
            className="select"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          >
            {ev.days.map((d) => (
              <option key={d.id} value={d.date}>
                {d.short}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="time">Leaving at</label>
          <input
            id="time"
            className="input"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div className="stepper">
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            {type === "OFFER" ? "Seats available" : "Seats needed"}
          </div>
          <div className="small" style={{ fontSize: 12 }}>
            {type === "OFFER" ? "Not counting you" : "Including you"}
          </div>
        </div>
        <div className="ctl">
          <button
            type="button"
            aria-label="One fewer seat"
            onClick={() => setSeats((s) => Math.max(1, s - 1))}
          >
            <MinusIcon size={20} />
          </button>
          <span className="count" aria-live="polite">
            {seats}
          </span>
          <button
            type="button"
            aria-label="One more seat"
            onClick={() => setSeats((s) => Math.min(8, s + 1))}
          >
            <PlusIcon size={20} />
          </button>
        </div>
      </div>

      <div>
        <div className="label">Which race are you running?</div>
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
          <button
            type="button"
            className="pill"
            aria-pressed={categoryId === null}
            onClick={() => setCategoryId(null)}
          >
            Not running
          </button>
        </div>
        {cat ? (
          <div className="hint" style={{ marginTop: 6 }}>
            {cat.name} starts {fmtTime(cat.startAt)}. Bib pickup is Fri 12:00 PM to
            6:00 PM, or {ev.bibPickupMinutesBefore} minutes before your start.
          </div>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="cost">Cost sharing (optional)</label>
        <input
          id="cost"
          className="input"
          type="text"
          value={costNote}
          onChange={(e) => setCostNote(e.target.value)}
          placeholder="e.g. Fuel split"
        />
      </div>

      <div className="field">
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          className="textarea"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Pickup spot, stops, luggage"
        />
      </div>

      <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {supabaseEnabled ? null : (
          <div className="callout warn" style={{ padding: "10px 12px" }}>
            <p className="fine" style={{ color: "#4a3300" }}>
              Demo mode: Google sign-in comes next. For now your ride is saved in
              this browser only.
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
            Used only when someone taps Chat on WhatsApp. It never appears on your
            listing.
          </div>
        </div>
      </div>

      <p className="fine">Rides only. Crew and pacers are not permitted by the race.</p>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary block" disabled={saving}>
        {saving ? "Saving…" : initial ? "Save changes" : "Post ride"}
      </button>
    </form>
  );
}
