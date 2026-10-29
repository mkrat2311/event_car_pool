import type { Listing } from "./types";

export function seatsLabel(l: Listing): string {
  const n = l.seats;
  if (l.status === "FULL") return l.type === "OFFER" ? "Full" : "Sorted";
  if (l.type === "OFFER") return n === 1 ? "1 seat" : `${n} seats`;
  return n === 1 ? "Needs 1 seat" : `Needs ${n} seats`;
}

/** The non-event end of the trip, shown on cards. */
export function areaLabel(l: Listing): string {
  return l.leg === "RETURN" ? `To ${l.dest.label}` : l.origin.label;
}

export function initial(name: string): string {
  return (name.trim()[0] ?? "?").toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/** "today", "yesterday" or "N days ago" for a UTC ISO timestamp, by calendar day in IST. */
export function listedAgo(iso: string, now: Date = new Date()): string {
  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
  const a = new Date(`${dayKey(new Date(iso))}T00:00:00Z`).getTime();
  const b = new Date(`${dayKey(now)}T00:00:00Z`).getTime();
  const days = Math.max(0, Math.round((b - a) / 86_400_000));
  if (days === 0) return "Listed today";
  if (days === 1) return "Listed yesterday";
  return `Listed ${days} days ago`;
}

/** Whole days from now until an ISO timestamp, rounded up; 0 if it has passed. */
export function daysLeft(iso: string, now: Date = new Date()): number {
  const ms = new Date(iso).getTime() - now.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / 86_400_000);
}
