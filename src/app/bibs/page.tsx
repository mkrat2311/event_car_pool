import { fetchBibsServer } from "@/lib/serverData";
import BibsClient from "./BibsClient";

// Serve a copy with the bibs already in it; the browser refreshes it right away.
export const revalidate = 15;

export default async function BibsPage() {
  const initial = await fetchBibsServer();
  return <BibsClient initial={initial} />;
}
