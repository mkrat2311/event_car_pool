import type { NextRequest } from "next/server";
import { connectRedirect } from "@/lib/connect";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const { listingId } = await params;
  return connectRedirect(request, listingId, {
    rpc: "get_contact",
    arg: "p_listing_id",
    back: (id) => `/ride/${id}`,
  });
}
