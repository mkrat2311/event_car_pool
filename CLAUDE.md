# CLAUDE.md

Guidance for Claude when working in this repo. Keep this file short; the full spec lives in `PRD.md`.

## Project
**Event Car Pool** (slug `event_car_pool`; unofficial until the Malnad Ultra organizers agree): a carpool board for Malnad Ultra 2026 participants. People offer or request rides, find a match, then continue on WhatsApp. The app does NOT handle chat, payments, or bookings.

Shared only inside the event's WhatsApp group. Built as a multi-event platform; Malnad Ultra 2026 is the first event.

## Event facts (source: malnadultra.com, checked 27 Oct 2026)
- Venue: Mallanduru (Chikkamagaluru district), ~260 km / 5 h from Bengaluru
- Race day: Sat 28 Nov 2026. Recommended arrival Fri 27 Nov. Night/100K finish by 3:30 AM Sun 29 Nov.
- Categories and starts: 30 KM 7:30 AM | 50 KM (Day) 7:00 AM | 50 KM (Night) 4:30 PM | 100 KM 6:30 AM
- Bib pickup: Fri 27 Nov 12:00-6:00 PM, or race day from 90 min before start
- Key places: Start Area (no vehicles inside), Mallanduru Sunset Point (public parking, 5 min walk), Mallanduru Circle (autos/cabs), Chikkamagaluru bus stand
- Personal crew and pacers are not allowed by the race. Don't suggest them in the UI.
- Always read event data from the Event/Category tables; never hardcode these facts in components.

## Product principles
1. Matching only. Hand off to WhatsApp as fast as possible.
2. Mobile-first. Users arrive from a WhatsApp group link on a phone, often on weak networks.
3. Browsing is open. **Google sign-in is required to post, edit, or delete a listing.** No other auth methods.
4. Event-centric. Everything hangs off an Event.
5. Safety and privacy: expose as little personal data as possible; easy reporting.

## Domain vocabulary (use these exact terms in code and UI)
- **Event**, **Category** (30 KM, 50 KM Day, 50 KM Night, 100 KM), **KeyLocation**
- **Leg**: `TO_EVENT`, `LOCAL_TO_START`, `RETURN`
- **Offer** (has seats) / **Request** (needs seats) = **Listing**
- **Profile**: the signed-in user (Google identity + WhatsApp number)
- **BibListing**: a runner offering to transfer their bib in the same Category (one per person; closes after the transfer deadline in the Event data)

## Auth and privacy rules
- Sign in with Google only, basic scopes only (`openid`, `email`, `profile`).
- A Listing has an `owner_id`. Only the owner or an admin may update/delete it, enforced by row-level security, not just in the UI.
- Never return a user's email or WhatsApp number in listing/search API responses.
- The WhatsApp number is used only inside the server-side redirect (`/connect/[listingId]` → `wa.me`), which is rate limited.
- Admins come from an allow-list of emails in config. Initial admin: mkrat2311@gmail.com.
- No custom domain in v1: the site runs on the host's free address, so keep allowed referrers and OAuth redirect URLs in config, not hardcoded.
- Test sign-in when the link is opened from WhatsApp's in-app browser (Google blocks embedded webviews); keep an "Open in Chrome/Safari" fallback.

## Location handling
- Origin and stay come from Google Places autocomplete. Store `place_id`, label, lat, lng.
- Event locations (Start Area, Sunset Point, etc.) are auto-fetched from Places and stored on the Event. The event end of a trip is pre-filled on the post form but editable (people can enter their stay instead).
- Find shows all rides for a trip with no distance filter (riders can be picked up midway). Keep lat/lng on every listing for maps.
- Keep the Google API key server-side where possible and restrict it by referrer/API.

## Performance
- Supabase is in `ap-southeast-2` (Sydney), so every browser query from India is slow. `vercel.json` pins functions to `syd1` to sit next to it. If the project ever moves to Mumbai (`ap-south-1`), change this to `bom1`.
- Find, Ride and Bib pages are rendered on the server with the public list already in them (data fetch cached 15 s in `src/lib/serverData.ts`; pages are `force-dynamic` so no build-time snapshot is served); the browser refreshes right after. The ride page waits for `fresh` before saying "not found".
- The middleware runs only on `/connect/*`. Browser code reads the session locally (`getSession`); the server uses `getUser` where it matters.

## Google Cloud
- Project name `event_car_pool`, project ID `event-car-pool` (IDs cannot contain underscores). Owner: mkrat2311@gmail.com.
- OAuth consent screen app name: "Event Car Pool". APIs: Places API (New), Maps Embed API (route map on the ride page, free); Google sign-in via Supabase. The browser key must allow both APIs.
- Keys live only in `.env.local` / host environment variables. Never commit them, never paste them in chat or docs.

## Tech stack (proposed, confirm before building)
- Next.js 15 (App Router) + TypeScript, plain CSS in `src/app/globals.css` (Tailwind not used so far). PWA support still to add.
- Supabase (Postgres + Auth with the Google provider), row-level security on (policies in `supabase/001_init.sql`)

## Current status
- Two modes in `src/lib/store.ts`: with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set, listings live in Supabase and Google sign-in is required to write; without them it runs in demo mode (sample rides from `src/lib/seed.ts`, posts kept in browser storage).
- Supabase code is written but untested against a real project. Schema: `supabase/001_init.sql`, then `supabase/002_bibs.sql` (bib transfer). Needs `npm install` (new deps `@supabase/ssr`, `@supabase/supabase-js`).
- The code was written in a sandbox that could not install npm packages, so it has been type-checked only against stand-in types. First real `npm install && npm run build` may surface small fixes.

## Conventions
- TypeScript strict; no `any`.
- Phone numbers in E.164 (`+91XXXXXXXXXX`), validated on input; never logged or sent to analytics.
- Times stored in UTC, shown in `Asia/Kolkata`.
- UI copy plain and short; English first, strings in one file for later Kannada/Hindi.
- Small components, no premature abstraction.

## Commands
- `npm install` install dependencies
- `npm run dev` start at http://localhost:3000
- `npm run typecheck` TypeScript check
- `npm run build` production build
- Env vars: copy `.env.example` to `.env.local`

## Working agreements
- Update `PRD.md` when a product decision changes and add a line to its Decision Log.
- Ask before adding a dependency, a new table, or any feature outside the PRD's v1 scope.
- Open questions live in `PRD.md` §12. Don't silently resolve them.
- Out of scope for v1: chat, payments, other sign-in methods, women-only rides, tracking.
