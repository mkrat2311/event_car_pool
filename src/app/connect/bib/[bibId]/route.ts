import type { NextRequest } from "next/server";
import { connectRedirect } from "@/lib/connect";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bibId: string }> },
) {
  const { bibId } = await params;
  return connectRedirect(request, bibId, {
    rpc: "get_bib_contact",
    arg: "p_bib_id",
    back: () => "/bibs",
  });
}
