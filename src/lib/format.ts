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
