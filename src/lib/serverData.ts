import { fromBibRow, fromRow, type BibRow, type ListingRow } from "./db";
import { getEvent } from "./event";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseEnabled } from "./supabase/config";
import type { BibListing, Listing } from "./types";

/**
 * Public data read on the server so pages arrive with the list already in them.
 * Listings are public, so the anon key is enough. Cached for 15 seconds; the
 * browser then refreshes in the background so people see their own changes.
 */
async function rest<T>(table: string, query: string): Promise<T[] | undefined> {
  if (!supabaseEnabled) return undefined;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      next: { revalidate: 15 },
    });
    if (!res.ok) return undefined;
    return (await res.json()) as T[];
  } catch {
    return undefined;
  }
}

/** undefined means "could not load on the server"; the browser then loads them itself. */
export async function fetchListingsServer(): Promise<Listing[] | undefined> {
  const rows = await rest<ListingRow>(
    "listings",
    `select=*&event_id=eq.${encodeURIComponent(getEvent().id)}&order=depart_at.asc`,
  );
  return rows?.map(fromRow);
}

export async function fetchBibsServer(): Promise<BibListing[] | undefined> {
  const rows = await rest<BibRow>(
    "bib_listings",
    `select=*&event_id=eq.${encodeURIComponent(getEvent().id)}&order=created_at.desc`,
  );
  return rows?.map(fromBibRow);
}
