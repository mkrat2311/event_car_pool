const TZ = "Asia/Kolkata";

/** Build a UTC ISO timestamp from an India date (YYYY-MM-DD) and time (HH:MM). */
export function istIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00+05:30`).toISOString();
}

/** "6:30 AM" */
export function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(iso))
    .toUpperCase();
}

/** "Fri 27 Nov" */
export function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  })
    .format(new Date(iso))
    .replace(",", "");
}

/** India calendar date as YYYY-MM-DD */
export function istDateKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** India clock time as HH:MM (24 hour), for <input type="time"> */
export function istTimeInput(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}
