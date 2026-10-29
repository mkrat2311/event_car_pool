import { fetchListingsServer } from "@/lib/serverData";
import FindClient from "./FindClient";

// Serve a copy with the rides already in it; the browser refreshes it right away.
export const revalidate = 15;

export default async function FindPage() {
  const initial = await fetchListingsServer();
  return <FindClient initial={initial} />;
}
