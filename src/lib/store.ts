"use client";

import { useCallback, useEffect, useState } from "react";
import type { Listing, Profile } from "./types";
import { SEED_LISTINGS } from "./seed";

/**
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

export function useListings() {
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
    (listing: Listing) => commit([...readJson<Listing[]>(MINE_KEY, []), listing]),
    [commit],
  );

  const update = useCallback(
    (listing: Listing) =>
      commit(
        readJson<Listing[]>(MINE_KEY, []).map((l) =>
          l.id === listing.id ? listing : l,
        ),
      ),
    [commit],
  );

  const remove = useCallback(
    (id: string) =>
      commit(readJson<Listing[]>(MINE_KEY, []).filter((l) => l.id !== id)),
    [commit],
  );

  return {
    ready,
    mine,
    all: [...SEED_LISTINGS, ...mine],
    add,
    update,
    remove,
  };
}

export function loadProfile(): Profile {
  return readJson<Profile>(PROFILE_KEY, { name: "", whatsapp: "" });
}

export function saveProfile(profile: Profile): void {
  writeJson(PROFILE_KEY, profile);
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
