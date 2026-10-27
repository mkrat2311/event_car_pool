"use client";

import { useState } from "react";
import { placesEnabled } from "@/lib/places";
import type { Place } from "@/lib/types";
import { PinIcon } from "./Icons";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";

function coords(p: Place): string {
  return `${p.lat},${p.lng}`;
}

/** Opens the Google Maps app (or site) with the route already set. */
export function directionsUrl(origin: Place, dest: Place): string {
  const q = new URLSearchParams({
    api: "1",
    origin: coords(origin),
    destination: coords(dest),
    travelmode: "driving",
  });
  return `https://www.google.com/maps/dir/?${q.toString()}`;
}

/**
 * Route between a ride's two places. The embedded map loads only when tapped,
 * to save data on weak networks. It needs "Maps Embed API" enabled for the key.
 */
export default function RouteMap({ origin, dest }: { origin: Place; dest: Place }) {
  const [show, setShow] = useState(false);

  const src = `https://www.google.com/maps/embed/v1/directions?${new URLSearchParams({
    key: KEY,
    origin: coords(origin),
    destination: coords(dest),
    mode: "driving",
  }).toString()}`;

  return (
    <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <a
          href={directionsUrl(origin, dest)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline grow"
        >
          <PinIcon size={18} />
          Open in Google Maps
        </a>
        {placesEnabled ? (
          <button
            type="button"
            className="btn btn-outline grow"
            aria-expanded={show}
            onClick={() => setShow((s) => !s)}
          >
            {show ? "Hide map" : "Show map"}
          </button>
        ) : null}
      </div>
      {show && placesEnabled ? (
        <iframe
          title="Route map"
          className="map-frame"
          src={src}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : null}
    </div>
  );
}
