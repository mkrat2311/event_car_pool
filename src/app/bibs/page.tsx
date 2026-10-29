import { fetchBibsServer } from "@/lib/serverData";
import BibsClient from "./BibsClient";

// Serve a copy with the bibs already in it; the browser refreshes it right away.
// Render per request (the data fetch itself is cached for 15 s), so a build-time snapshot is never served.
export const dynamic = "force-dynamic";

export default async function BibsPage() {
  const initial = await fetchBibsServer();
  return <BibsClient initial={initial} />;
}
