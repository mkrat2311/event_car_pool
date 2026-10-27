import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";

/** Google sends people back here; we swap the code for a session. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const supabase = await createSupabaseServer();
  if (supabase && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/signin?error=1&next=${encodeURIComponent(next)}`);
}
