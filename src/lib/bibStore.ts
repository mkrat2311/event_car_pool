"use client";

import { useCallback, useEffect, useState } from "react";
import { fromBibRow, type BibRow } from "./db";
import { getEvent } from "./event";
import { getBrowserClient } from "./supabase/browser";
import { supabaseEnabled } from "./supabase/config";
import type { BibListing, BibStatus } from "./types";

/** Result of a write: null on success, otherwise a short message to show. */
type WriteResult = Promise<string | null>;

/** Draft of a new bib listing. The owner comes from the signed-in user. */
export interface BibDraft {
  categoryId: string;
  note: string;
  displayName: string;
  /** Demo mode only */
  contact?: string;
}

const DEMO_KEY = "ecp.bibs.v1";
const DEMO_ME = "me";

const DAY = 24 * 60 * 60 * 1000;
function ago(days: number): string {
  return new Date(Date.now() - days * DAY).toISOString();
}

/** SAMPLE DATA for demo mode only. */
const SEEDS: BibListing[] = [
  { id: "bib-seed-1", ownerId: "seed", categoryId: "50k-day", note: "Injured, cannot run. Bib is in my name.", displayName: "Arjun", status: "ACTIVE", createdAt: ago(0) },
  { id: "bib-seed-2", ownerId: "seed", categoryId: "50k-night", note: "Work trip clash. Happy to hand over the bib.", displayName: "Meera", status: "ACTIVE", createdAt: ago(1) },
  { id: "bib-seed-3", ownerId: "seed", categoryId: "100k", note: "Family event on race day.", displayName: "Karthik", status: "ACTIVE", createdAt: ago(2) },
  { id: "bib-seed-4", ownerId: "seed", categoryId: "30k", note: "Cannot travel. Replacement must be eligible.", displayName: "Sneha", status: "ACTIVE", createdAt: ago(2) },
];

function readDemo(): BibListing[] {
  try {
    const raw = window.localStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as BibListing[]) : [];
  } catch {
    return [];
  }
}

function writeDemo(list: BibListing[]): void {
  try {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(list));
  } catch {
    // Storage can be unavailable; the demo then forgets on reload.
  }
}

function useDemoBibs(_initial?: BibListing[]) {
  const [mine, setMine] = useState<BibListing[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMine(readDemo());
    setReady(true);
  }, []);

  const commit = useCallback((next: BibListing[]) => {
    setMine(next);
    writeDemo(next);
  }, []);

  const add = useCallback(
    async (d: BibDraft): WriteResult => {
      const current = readDemo();
      if (current.length > 0) return "You already have a bib listed.";
      commit([
        ...current,
        {
          id: `bib-me-${Date.now().toString(36)}`,
          ownerId: DEMO_ME,
          categoryId: d.categoryId,
          note: d.note,
          displayName: d.displayName,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
          contact: d.contact,
        },
      ]);
      return null;
    },
    [commit],
  );

  const setStatus = useCallback(
    async (id: string, status: BibStatus): WriteResult => {
      commit(readDemo().map((b) => (b.id === id ? { ...b, status } : b)));
      return null;
    },
    [commit],
  );

  const remove = useCallback(
    async (id: string): WriteResult => {
      commit(readDemo().filter((b) => b.id !== id));
      return null;
    },
    [commit],
  );

  return {
    ready,
    fresh: ready,
    userId: DEMO_ME as string | null,
    mine,
    all: [...SEEDS, ...mine],
    add,
    setStatus,
    remove,
  };
}

function useDbBibs(initial?: BibListing[]) {
  const [rows, setRows] = useState<BibListing[]>(initial ?? []);
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(initial !== undefined);
  const [fresh, setFresh] = useState(false);
  const eventId = getEvent().id;

  const refresh = useCallback(async () => {
    const sb = getBrowserClient();
    // getSession reads the saved session locally (no network); RLS protects the data.
    const [{ data: auth }, { data, error }] = await Promise.all([
      sb.auth.getSession(),
      sb
        .from("bib_listings")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false }),
    ]);
    setUserId(auth.session?.user.id ?? null);
    if (!error && data) setRows((data as BibRow[]).map(fromBibRow));
    setReady(true);
    setFresh(true);
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (d: BibDraft): WriteResult => {
      const { error } = await getBrowserClient().from("bib_listings").insert({
        event_id: eventId,
        category_id: d.categoryId,
        note: d.note,
        display_name: d.displayName,
      });
      if (error) {
        // 23505 = unique violation: this person already has a bib listed
        return error.code === "23505"
          ? "You already have a bib listed."
          : "Could not list your bib. Please try again.";
      }
      await refresh();
      return null;
    },
    [eventId, refresh],
  );

  const setStatus = useCallback(
    async (id: string, status: BibStatus): WriteResult => {
      const { error } = await getBrowserClient()
        .from("bib_listings")
        .update({ status })
        .eq("id", id);
      if (error) return "Could not save that. Please try again.";
      await refresh();
      return null;
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string): WriteResult => {
      const { error } = await getBrowserClient().from("bib_listings").delete().eq("id", id);
      if (error) return "Could not remove it. Please try again.";
      await refresh();
      return null;
    },
    [refresh],
  );

  return {
    ready,
    fresh,
    userId,
    mine: userId ? rows.filter((b) => b.ownerId === userId) : [],
    all: rows,
    add,
    setStatus,
    remove,
  };
}

/** The mode never changes while the app runs, so the hook order is stable. */
export const useBibs = supabaseEnabled ? useDbBibs : useDemoBibs;

/** Chat link. In database mode it goes through the server redirect that hides the number. */
export function bibChatUrl(bib: BibListing, text: string): string {
  if (supabaseEnabled) {
    return `/connect/bib/${bib.id}?text=${encodeURIComponent(text)}`;
  }
  const digits = (bib.contact ?? "").replace(/\D/g, "");
  return `https://wa.me/${digits ? digits : ""}?text=${encodeURIComponent(text)}`;
}

export function transfersClosed(): boolean {
  return Date.now() > new Date(getEvent().bibTransferDeadlineAt).getTime();
}

/** Opens the user's email app with the request to the organisers prepared. They add the cc. */
export function transferEmailUrl(categoryName: string): string {
  const subject = `Bib transfer request - ${categoryName}`;
  const body = [
    "Hello,",
    "",
    `I would like to transfer my ${getEvent().name} bib (${categoryName}) to another runner.`,
    "",
    "Runner giving up the bib: [your name]",
    "Replacement runner (copied on this email): [name]",
    "",
    "Thank you",
  ].join("\n");
  return `mailto:${getEvent().bibTransferEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
