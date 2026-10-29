"use client";

import { useCallback, useEffect, useState } from "react";
import { fromRow, toRow, type ListingRow } from "./db";
import { getEvent } from "./event";
import { SEED_LISTINGS } from "./seed";
import { getBrowserClient } from "./supabase/browser";
import { supabaseEnabled } from "./supabase/config";
import type { Listing, Profile } from "./types";

/**
 * Two backends behind one hook. With Supabase env vars set, listings live in
 * the database and Google sign-in is required to write. Without them the app
 * runs in demo mode.
 *
 * DEMO STORAGE. Rides you post are kept in this browser only (localStorage),
 * and "me" stands in for the signed-in Google account. Both are replaced by
 * the database and Google sign-in.
 */
const MINE_KEY = "ecp.mine.v1";
const PROFILE_KEY = "ecp.profile.v1";
export const ME = "me";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); the demo then forgets on reload.
  }
}

/** Result of a write: null on success, otherwise a short message to show. */
type WriteResult = Promise<string | null>;

function useDemoListings(_initial?: Listing[]) {
  const [mine, setMine] = useState<Listing[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMine(readJson<Listing[]>(MINE_KEY, []));
    setReady(true);
  }, []);

  const commit = useCallback((next: Listing[]) => {
    setMine(next);
    writeJson(MINE_KEY, next);
  }, []);

  const add = useCallback(
    async (listing: Listing): WriteResult => {
      commit([...readJson<Listing[]>(MINE_KEY, []), listing]);
      return null;
    },
    [commit],
  );

  const update = useCallback(
    async (listing: Listing): WriteResult => {
      commit(
        readJson<Listing[]>(MINE_KEY, []).map((l) =>
          l.id === listing.id ? listing : l,
        ),
      );
      return null;
    },
    [commit],
  );

  const remove = useCallback(
    async (id: string): WriteResult => {
      commit(readJson<Listing[]>(MINE_KEY, []).filter((l) => l.id !== id));
      return null;
    },
    [commit],
  );

  return {
    ready,
    fresh: ready,
    userId: ME as string | null,
    mine,
    all: [...SEED_LISTINGS, ...mine],
    add,
    update,
    remove,
  };
}

function useDbListings(initial?: Listing[]) {
  const [rows, setRows] = useState<Listing[]>(initial ?? []);
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(initial !== undefined);
  // true once the browser has loaded its own copy (the server copy can be up to 15 s old)
  const [fresh, setFresh] = useState(false);
  const eventId = getEvent().id;

  const refresh = useCallback(async () => {
    const sb = getBrowserClient();
    // getSession reads the saved session locally (no network); RLS protects the data.
    const [{ data: auth }, { data, error }] = await Promise.all([
      sb.auth.getSession(),
      sb.from("listings").select("*").eq("event_id", eventId).order("depart_at"),
    ]);
    setUserId(auth.session?.user.id ?? null);
    if (!error && data) setRows((data as ListingRow[]).map(fromRow));
    setReady(true);
    setFresh(true);
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (listing: Listing): WriteResult => {
      const { error } = await getBrowserClient()
        .from("listings")
        .insert(toRow(listing, eventId));
      if (error) return "Could not save your ride. Please try again.";
      await refresh();
      return null;
    },
    [eventId, refresh],
  );

  const update = useCallback(
    async (listing: Listing): WriteResult => {
      const { error } = await getBrowserClient()
        .from("listings")
        .update(toRow(listing, eventId))
        .eq("id", listing.id);
      if (error) return "Could not save your changes. Please try again.";
      await refresh();
      return null;
    },
    [eventId, refresh],
  );

  const remove = useCallback(
    async (id: string): WriteResult => {
      const { error } = await getBrowserClient().from("listings").delete().eq("id", id);
      if (error) return "Could not delete. Please try again.";
      await refresh();
      return null;
    },
    [refresh],
  );

  return {
    ready,
    fresh,
    userId,
    mine: userId ? rows.filter((l) => l.ownerId === userId) : [],
    all: rows,
    add,
    update,
    remove,
  };
}

/** The mode never changes while the app runs, so the hook order is stable. */
export const useListings = supabaseEnabled ? useDbListings : useDemoListings;

export function loadProfile(): Profile {
  return readJson<Profile>(PROFILE_KEY, { name: "", whatsapp: "" });
}

export function saveProfile(profile: Profile): void {
  writeJson(PROFILE_KEY, profile);
}

/** Signed-in profile: name and WhatsApp (10 digits, no +91). Empty if none saved yet. */
export async function loadAccountProfile(userId: string): Promise<Profile> {
  const { data } = await getBrowserClient()
    .from("profiles")
    .select("display_name, whatsapp")
    .eq("id", userId)
    .maybeSingle();
  const row = data as { display_name: string; whatsapp: string } | null;
  return row
    ? { name: row.display_name, whatsapp: row.whatsapp.replace(/^\+91/, "") }
    : { name: "", whatsapp: "" };
}

/** Saves the WhatsApp number as E.164 (+91XXXXXXXXXX). Returns an error message or null. */
export async function saveAccountProfile(
  userId: string,
  profile: Profile,
): Promise<string | null> {
  const { error } = await getBrowserClient().from("profiles").upsert({
    id: userId,
    display_name: profile.name,
    whatsapp: `+91${profile.whatsapp}`,
  });
  return error ? "Could not save your details. Please try again." : null;
}

/** Report a listing (signed-in users only). Returns an error message or null. */
export async function reportListing(listingId: string): Promise<string | null> {
  const { error } = await getBrowserClient()
    .from("reports")
    .insert({ listing_id: listingId, reason: "Reported from the ride page" });
  return error ? "Could not send the report. Please try again." : null;
}

export function newId(): string {
  return `me-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Build the WhatsApp link with a prefilled message.
 * Seed listings have no number, so WhatsApp opens its contact picker instead.
 * In the real app this is a server redirect that keeps the number private.
 */
export function whatsappUrl(listing: Listing, text: string): string {
  const digits = (listing.contact ?? "").replace(/\D/g, "");
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}
