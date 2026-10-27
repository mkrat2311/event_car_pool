import Link from "next/link";
import type { Listing } from "@/lib/types";
import { getEvent } from "@/lib/event";
import { areaLabel, initial, seatsLabel } from "@/lib/format";
import { fmtDate, fmtTime } from "@/lib/time";
import { MoonIcon, SunIcon } from "./Icons";

export default function ListingCard({ listing }: { listing: Listing }) {
  const ev = getEvent();
  const cat = ev.categories.find((c) => c.id === listing.categoryId);
  return (
    <Link
      href={`/ride/${listing.id}`}
      className="card pad"
      style={{ display: "block", opacity: listing.status === "FULL" ? 0.7 : 1 }}
    >
      <div className="row" style={{ padding: 0 }}>
        <span className="avatar">{initial(listing.displayName)}</span>
        <div className="grow">
          <div className="strong">{listing.displayName}</div>
          <div className="small">{areaLabel(listing)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="strong">{fmtTime(listing.departAt)}</div>
          <div className="small" style={{ fontSize: 12 }}>
            {fmtDate(listing.departAt)}
          </div>
        </div>
      </div>
      <div className="chips" style={{ marginTop: 12 }}>
        <span className={listing.status === "FULL" ? "chip dark" : "chip green"}>
          {seatsLabel(listing)}
        </span>
        {listing.costNote ? <span className="chip">{listing.costNote}</span> : null}
        {cat ? (
          <span className={cat.isNight ? "chip night" : "chip"}>
            {cat.isNight ? <MoonIcon size={14} /> : <SunIcon size={14} />}
            &nbsp;{cat.name}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
