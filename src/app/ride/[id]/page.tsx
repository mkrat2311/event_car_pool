import { fetchListingsServer } from "@/lib/serverData";
import RideClient from "./RideClient";

// Serve a copy with the rides already in it; the browser refreshes it right away.
// Render per request (the data fetch itself is cached for 15 s), so a build-time snapshot is never served.
export const dynamic = "force-dynamic";

export default async function RideDetailPage() {
  const initial = await fetchListingsServer();
  return <RideClient initial={initial} />;
}
