import type { Place } from "./types";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

/** True when a Google Maps key is configured; otherwise a built-in list is used. */
export const placesEnabled = Boolean(KEY);

export interface Suggestion {
  placeId?: string;
  label: string;
  /** Present for the built-in list, where coordinates are already known. */
  place?: Place;
}

/** Built-in fallback used when no Google key is set (and as a safety net). */
export const LOCAL_PLACES: Place[] = [
  { label: "Bengaluru, Karnataka", lat: 12.9716, lng: 77.5946 },
  { label: "Indiranagar, Bengaluru", lat: 12.9784, lng: 77.6408 },
  { label: "Whitefield, Bengaluru", lat: 12.9698, lng: 77.75 },
  { label: "Jayanagar, Bengaluru", lat: 12.9308, lng: 77.5838 },
  { label: "Koramangala, Bengaluru", lat: 12.9352, lng: 77.6245 },
  { label: "Yeshwanthpur, Bengaluru", lat: 13.0285, lng: 77.5409 },
  { label: "Mysuru, Karnataka", lat: 12.2958, lng: 76.6394 },
  { label: "Hassan, Karnataka", lat: 13.0068, lng: 76.1004 },
  { label: "Mangaluru, Karnataka", lat: 12.9141, lng: 74.856 },
  { label: "Hubballi, Karnataka", lat: 15.3647, lng: 75.124 },
  { label: "Chikkamagaluru, Karnataka", lat: 13.3161, lng: 75.772 },
  { label: "Mallanduru, Chikkamagaluru", lat: 13.37, lng: 75.66 },
];

export function searchLocal(query: string): Suggestion[] {
  const q = query.trim().toLowerCase();
  const list = q
    ? LOCAL_PLACES.filter((p) => p.label.toLowerCase().includes(q))
    : LOCAL_PLACES;
  return list.slice(0, 6).map((p) => ({ label: p.label, place: p }));
}

/** Google Places API (New) autocomplete, limited to India. */
export async function autocomplete(
  input: string,
  sessionToken: string,
): Promise<Suggestion[]> {
  if (!KEY) return searchLocal(input);
  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
    },
    body: JSON.stringify({
      input,
      sessionToken,
      includedRegionCodes: ["in"],
    }),
  });
  if (!res.ok) throw new Error(`Places autocomplete failed (${res.status})`);
  const data = (await res.json()) as {
    suggestions?: {
      placePrediction?: { placeId: string; text: { text: string } };
    }[];
  };
  const out: Suggestion[] = [];
  for (const s of data.suggestions ?? []) {
    if (s.placePrediction) {
      out.push({
        placeId: s.placePrediction.placeId,
        label: s.placePrediction.text.text,
      });
    }
  }
  return out;
}

/**
 * Fetch coordinates for a chosen suggestion. Asking only for `location`
 * keeps this at the cheapest Place Details tier and closes the session.
 */
export async function placeDetails(
  suggestion: Suggestion,
  sessionToken: string,
): Promise<Place> {
  if (suggestion.place) return suggestion.place;
  if (!KEY || !suggestion.placeId) {
    throw new Error("No place details available");
  }
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(
      suggestion.placeId,
    )}?sessionToken=${encodeURIComponent(sessionToken)}`,
    {
      headers: {
        "X-Goog-Api-Key": KEY,
        "X-Goog-FieldMask": "location",
      },
    },
  );
  if (!res.ok) throw new Error(`Place details failed (${res.status})`);
  const data = (await res.json()) as {
    location?: { latitude: number; longitude: number };
  };
  if (!data.location) throw new Error("Place has no location");
  return {
    placeId: suggestion.placeId,
    label: suggestion.label,
    lat: data.location.latitude,
    lng: data.location.longitude,
  };
}
