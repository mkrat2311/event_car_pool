import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * Shared by the ride and bib redirects. The WhatsApp number is read inside a
 * database function and goes straight into the redirect; it is never returned
 * as JSON or sent to the page.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LIMIT = 20; // taps
const WINDOW_MS = 10 * 60 * 1000; // per 10 minutes, per signed-in user
const hits = new Map<string, number[]>();

/** Best effort: memory is per server instance, so this slows scraping rather than stopping it. */
function tooMany(userId: string): boolean {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(userId, recent);
  return recent.length > LIMIT;
}

interface Target {
  /** Database function that returns the number */
  rpc: "get_contact" | "get_bib_contact";
  /** Name of its argument */
  arg: "p_listing_id" | "p_bib_id";
  /** Page to return to if something goes wrong */
  back: (id: string) => string;
}

export async function connectRedirect(
  request: NextRequest,
  id: string,
  target: Target,
): Promise<NextResponse> {
  const { origin, pathname, search, searchParams } = request.nextUrl;

  if (!UUID.test(id)) return NextResponse.redirect(`${origin}/find`);

  const supabase = await createSupabaseServer();
  if (!supabase) return NextResponse.redirect(`${origin}/find`);

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const back = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(`${origin}/signin?next=${back}`);
  }
  if (tooMany(data.user.id)) {
    return NextResponse.redirect(`${origin}${target.back(id)}?contact=slow`);
  }

  const { data: number, error } = await supabase.rpc(target.rpc, { [target.arg]: id });
  const digits = typeof number === "string" ? number.replace(/\D/g, "") : "";
  if (error || digits.length < 10) {
    return NextResponse.redirect(`${origin}${target.back(id)}?contact=unavailable`);
  }

  const text = (searchParams.get("text") ?? "").slice(0, 500);
  const to = `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  const res = NextResponse.redirect(to);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}
