/** Supabase is optional: with no env vars the app runs in demo mode. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Only allow same-site relative paths after sign-in. */
export function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/my";
  return value;
}
