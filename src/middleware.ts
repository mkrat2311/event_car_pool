import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseEnabled } from "@/lib/supabase/config";

/** Refreshes the Google session before the chat redirect. Does nothing in demo mode. */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!supabaseEnabled) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list: { name: string; value: string; options: CookieOptions }[]) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

// Only the chat redirect reads the session on the server. Running this on every
// page would add a network wait to each visit; the browser keeps its own session fresh.
export const config = {
  matcher: ["/connect/:path*"],
};
