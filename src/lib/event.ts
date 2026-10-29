import type { EventInfo } from "./types";
import { istIso } from "./time";

/**
 * Event data pulled from malnadultra.com (checked 27 Oct 2026).
 * Later this comes from the Event / Category / KeyLocation tables.
 * Exact points, shared by the owner as Google Maps links on 27 Oct 2026:
 * - TOWN: "Malandur, Byaravalli" village point, the destination for home-to-event trips.
 * - PARKING_POINT: "Mallandur Sunrise & Sunset point", the race parking and the
 *   destination for stay-to-start-line trips.
 */
const TOWN = { lat: 13.3674679, lng: 75.661607 };
const PARKING_POINT = { lat: 13.3691458, lng: 75.6479445 };

const VENUE = {
  label: "Mallanduru, Chikkamagaluru",
  ...TOWN,
};

const EVENT: EventInfo = {
  id: "malnad-ultra-2026",
  name: "Malnad Ultra 2026",
  shortName: "Malnad Ultra",
  town: "Mallanduru, Chikkamagaluru",
  venue: VENUE,
  startArea: {
    id: "start-area",
    label: "Start Area, Mallanduru",
    note: "No vehicles are allowed inside the Start Area",
    place: { label: "Start Area, Mallanduru", ...PARKING_POINT },
  },
  parking: {
    id: "sunset-point",
    label: "Mallanduru Sunset Point (parking)",
    note: "Public parking, a 5-minute walk from the Start Area",
    place: {
      label: "Mallanduru Sunset Point (parking)",
      ...PARKING_POINT,
    },
  },
  categories: [
    {
      id: "30k",
      name: "30 KM",
      startAt: istIso("2026-11-28", "07:30"),
      cutoffAt: istIso("2026-11-28", "13:30"),
      isNight: false,
    },
    {
      id: "50k-day",
      name: "50 KM (Day)",
      startAt: istIso("2026-11-28", "07:00"),
      cutoffAt: istIso("2026-11-28", "17:00"),
      isNight: false,
    },
    {
      id: "50k-night",
      name: "50 KM (Night)",
      startAt: istIso("2026-11-28", "16:30"),
      cutoffAt: istIso("2026-11-29", "03:30"),
      isNight: true,
    },
    {
      id: "100k",
      name: "100 KM",
      startAt: istIso("2026-11-28", "06:30"),
      cutoffAt: istIso("2026-11-29", "03:30"),
      isNight: false,
    },
  ],
  days: [
    {
      id: "fri",
      date: "2026-11-27",
      short: "Fri 27 Nov",
      title: "Arrive and collect your bib",
      detail: "Bib pickup 12:00 PM to 6:00 PM at the Start Area",
    },
    {
      id: "sat",
      date: "2026-11-28",
      short: "Sat 28 Nov",
      title: "Race day",
      detail:
        "Cars park at Mallanduru Sunset Point, a 5-minute walk from the Start Area",
    },
    {
      id: "sun",
      date: "2026-11-29",
      short: "Sun 29 Nov",
      title: "Night and 100 KM finish",
      detail: "Final cut-off 3:30 AM. Plan your ride home.",
    },
  ],
  bibTransferDeadlineAt: istIso("2026-11-01", "23:59"),
  bibTransferEmail: "run@malnadultra.com",
  bibPickupMinutesBefore: 90,
  sourceNote: "Event details from malnadultra.com. This app is unofficial.",
};

export function getEvent(): EventInfo {
  return EVENT;
}

export function categoryName(id: string | null): string {
  if (!id) return "Not running";
  return EVENT.categories.find((c) => c.id === id)?.name ?? "Not running";
}
