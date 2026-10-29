import type { BibListing, BibStatus, Leg, Listing, ListingStatus, ListingType, Place } from "./types";

/** A row of public.listings as the database returns it. */
export interface ListingRow {
  id: string;
  owner_id: string;
  event_id: string;
  type: ListingType;
  leg: Leg;
  category_id: string | null;
  origin_place_id: string | null;
  origin_label: string;
  origin_lat: number;
  origin_lng: number;
  dest_place_id: string | null;
  dest_label: string;
  dest_lat: number;
  dest_lng: number;
  depart_at: string;
  seats: number;
  cost_note: string;
  notes: string;
  display_name: string;
  status: ListingStatus;
}

function place(id: string | null, label: string, lat: number, lng: number): Place {
  return { placeId: id ?? undefined, label, lat, lng };
}

export function fromRow(r: ListingRow): Listing {
  return {
    id: r.id,
    ownerId: r.owner_id,
    type: r.type,
    leg: r.leg,
    categoryId: r.category_id,
    origin: place(r.origin_place_id, r.origin_label, r.origin_lat, r.origin_lng),
    dest: place(r.dest_place_id, r.dest_label, r.dest_lat, r.dest_lng),
    departAt: r.depart_at,
    seats: r.seats,
    costNote: r.cost_note,
    notes: r.notes,
    displayName: r.display_name,
    status: r.status,
  };
}

/** Columns the owner may write. owner_id comes from the signed-in user in the database. */
export function toRow(l: Listing, eventId: string) {
  return {
    event_id: eventId,
    type: l.type,
    leg: l.leg,
    category_id: l.categoryId,
    origin_place_id: l.origin.placeId ?? null,
    origin_label: l.origin.label,
    origin_lat: l.origin.lat,
    origin_lng: l.origin.lng,
    dest_place_id: l.dest.placeId ?? null,
    dest_label: l.dest.label,
    dest_lat: l.dest.lat,
    dest_lng: l.dest.lng,
    depart_at: l.departAt,
    seats: l.seats,
    cost_note: l.costNote,
    notes: l.notes,
    display_name: l.displayName,
    status: l.status,
  };
}

/** A row of public.bib_listings as the database returns it. */
export interface BibRow {
  id: string;
  owner_id: string;
  category_id: string;
  note: string;
  display_name: string;
  status: BibStatus;
  created_at: string;
}

export function fromBibRow(r: BibRow): BibListing {
  return {
    id: r.id,
    ownerId: r.owner_id,
    categoryId: r.category_id,
    note: r.note,
    displayName: r.display_name,
    status: r.status,
    createdAt: r.created_at,
  };
}
