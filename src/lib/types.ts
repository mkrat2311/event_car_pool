export type Leg = "TO_EVENT" | "LOCAL_TO_START" | "RETURN";
export type ListingType = "OFFER" | "REQUEST";
export type ListingStatus = "ACTIVE" | "FULL";

export interface Place {
  placeId?: string;
  label: string;
  lat: number;
  lng: number;
}

export interface Category {
  id: string;
  name: string;
  /** UTC ISO timestamp of the race start */
  startAt: string;
  /** UTC ISO timestamp of the final cut-off */
  cutoffAt: string;
  isNight: boolean;
}

export interface KeyLocation {
  id: string;
  label: string;
  note: string;
  place: Place;
}

export interface EventDay {
  id: string;
  /** IST calendar date, YYYY-MM-DD */
  date: string;
  short: string;
  title: string;
  detail: string;
}

export interface EventInfo {
  id: string;
  name: string;
  shortName: string;
  town: string;
  venue: Place;
  startArea: KeyLocation;
  parking: KeyLocation;
  categories: Category[];
  days: EventDay[];
  /** Minutes before a start time when bib pickup opens on race day */
  bibPickupMinutesBefore: number;
  /** UTC ISO timestamp after which bib transfers are closed */
  bibTransferDeadlineAt: string;
  /** Where transfer requests are emailed */
  bibTransferEmail: string;
  sourceNote: string;
}

export interface Listing {
  id: string;
  ownerId: string;
  type: ListingType;
  leg: Leg;
  /** null means "not running" */
  categoryId: string | null;
  origin: Place;
  dest: Place;
  /** UTC ISO timestamp of departure */
  departAt: string;
  seats: number;
  costNote: string;
  notes: string;
  displayName: string;
  status: ListingStatus;
  /**
   * DEMO ONLY. In the real app the WhatsApp number lives in the Profile table
   * and is never sent to the browser; it is used only by a server redirect.
   */
  contact?: string;
}

export type BibStatus = "ACTIVE" | "TAKEN";

/** A runner offering to transfer their bib to someone in the same category. */
export interface BibListing {
  id: string;
  ownerId: string;
  categoryId: string;
  note: string;
  displayName: string;
  status: BibStatus;
  /** UTC ISO timestamp */
  createdAt: string;
  /** DEMO ONLY, like Listing.contact */
  contact?: string;
}

export interface Profile {
  name: string;
  whatsapp: string;
}

export const LEG_LABEL: Record<Leg, string> = {
  TO_EVENT: "Home to event",
  LOCAL_TO_START: "Stay to start line",
  RETURN: "Return",
};

export const LEG_TAB: Record<Leg, string> = {
  TO_EVENT: "To event",
  LOCAL_TO_START: "To start line",
  RETURN: "Return",
};
