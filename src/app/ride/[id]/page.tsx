import { fetchListingsServer } from "@/lib/serverData";
import RideClient from "./RideClient";

// Serve a copy with the rides already in it; the browser refreshes it right away.
export const revalidate = 15;

export default async function RideDetailPage() {
  const initial = await fetchListingsServer();
  return <RideClient initial={initial} />;
}
