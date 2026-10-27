# PRD: Event Car Pool

**Status:** Draft v0.3 | **Date:** 27 Oct 2026 | **Owner:** TBD
**Source of event facts:** malnadultra.com (Race Guide, Plan Trip), checked 27 Oct 2026

## 1. Problem
Malnad Ultra is a trail ultra held in Mallanduru, a remote spot about 260 km and 5 hours from Bengaluru. Runners travel in from Bengaluru, Mysuru and elsewhere, stay in homestays 5-10 km from the venue, then get to the Start Area at very different times depending on their category (6:30 AM to 4:30 PM). The organizers themselves recommend forming groups to travel and point people to a WhatsApp community to find each other. Ride offers and requests get buried in that chat, so seats go empty and people without a vehicle struggle.

## 2. Goal
A simple site, shared inside the event's WhatsApp group, where a participant can **offer** or **request** a ride, search for a match, and jump to WhatsApp to finalise. Success = more filled seats with less back-and-forth in the group.

## 3. Non-goals (v1)
- In-app chat, payments, fare splitting
- Ride tracking, ratings, insurance
- Passwords, OTP, or any sign-in method other than Google
- Women-only rides (deferred to a later version)
- Route optimisation and multi-stop pickups
- Native mobile apps

## 4. Users and distribution
- **Driver:** participant or supporter with spare seats. **Rider:** participant needing a seat. **Admin:** whoever runs the app (ideally with the organizers' blessing).
- **Distribution assumption:** the link is shared only in the WhatsApp group created for this event. Users are therefore mostly real participants. This lowers (but does not remove) spam and abuse risk.
- **Rule from the event:** personal crew and pacers are not allowed; pacers must register as runners. The app should not suggest or imply crew/pacer arrangements. A short note on the form: "Rides only. Crew and pacers are not permitted by the race."

## 5. Event data (pre-loaded)
**Event:** Malnad Ultra 2026 (10th edition), Mallanduru, Chikkamagaluru district, Karnataka.
**Race day:** Saturday 28 Nov 2026. **Recommended arrival:** Friday 27 Nov. **Night/100K finish:** up to 3:30 AM Sunday 29 Nov.
**Key locations (auto-fetched from Google Places, stored on the Event):**
- Start/Finish Area, Mallanduru (no vehicles allowed inside)
- Mallanduru Sunset Point: public parking, 5-minute walk from the Start Area
- Mallanduru Circle: main junction for autos/cabs, useful for return trips
- Chikkamagaluru bus stand: where bus arrivals look for onward transport

| Category | Start | Official finish cut-off | Fee |
|---|---|---|---|
| 30 KM | 7:30 AM, 28 Nov | 1:30 PM, 28 Nov | ₹3000 |
| 50 KM (Day) | 7:00 AM, 28 Nov | 5:00 PM, 28 Nov | ₹4000 |
| 50 KM (Night) | 4:30 PM, 28 Nov | 3:30 AM, 29 Nov | ₹4000 |
| 100 KM | 6:30 AM, 28 Nov | 3:30 AM, 29 Nov | ₹5000 |

**Event-day logistics the app should know:**
- Bib pickup: Fri 27 Nov, 12:00 PM-6:00 PM at the Start Area; or on race day from 90 minutes before the category start.
- Breakfast is served at the Start Area from 5:00 AM, so many day-category runners will want to arrive before dawn.
- Mobile networks are patchy near the venue, so people must plan rides before arriving.

## 6. Legs
1. `TO_EVENT`: origin (e.g. Bengaluru, Mysuru, Mangaluru) → Mallanduru / homestay area. Typically Fri 27 Nov.
2. `LOCAL_TO_START`: stay location → Sunset Point parking / Start Area on race day, timed to the category start (with bib pickup if needed).
3. `RETURN`: Mallanduru → home city. Timing depends on category finish: 30K/50K Day on Sat afternoon or evening; 50K Night/100K after 3:30 AM Sun, likely Sun morning.

## 7. Core user flows
### 7.1 Offer a ride
1. Open event page → "Offer a ride"
2. Pick leg and date. Date is pre-filled from the event calendar.
3. **Origin and stay/destination use Google Places search** (autocomplete). The event location (Start Area, Sunset Point, Mallanduru) is pre-filled and auto-fetched, so it is not typed.
4. Enter departure time, seats, cost-share note (e.g. "fuel split"), car/notes, category (30K / 50K Day / 50K Night / 100K).
5. Tap "Post": if not signed in, prompted to **Sign in with Google** (one tap; the filled form is kept while signing in).
6. First time only: confirm display name and enter WhatsApp number (saved to the profile and reused for later listings).
7. Listing goes live and appears under "My listings".

### 7.2 Request a ride
Same form with seats needed.

### 7.3 Search and connect
1. Event page → pick leg (no sign-in needed to browse)
2. Filters: origin (Places search, matches listings within a radius, default 25 km), date, time window, category
3. Results sorted by closest departure time; offers and requests togglable
4. Card shows first name, area, time, seats, cost note, category tag
5. "Chat on WhatsApp" goes through a server redirect that opens `wa.me` with a prefilled message including route, date and time. The number is never included in the list data sent to the browser.
6. Planning continues in WhatsApp

### 7.4 Manage a listing
Signed-in users open "My listings" to edit, mark Full, or delete their own listings. Nobody else can change them.

### 7.5 Admin
Create/edit events, categories, key locations; hide or remove reported listings. Admins are identified by a short allow-list of Google emails.

## 8. Identity and trust
- **Google sign-in** is required to post, edit, or delete. Browsing and searching does not require sign-in (see open question 9).
- Only basic Google scopes (`openid`, `email`, `profile`). No Gmail, Drive, or contacts access.
- A listing belongs to the signed-in Google account. Only the owner (or an admin) can edit, mark Full, or delete it, enforced server-side with row-level security, not just in the UI.
- From Google we store: account id, email, name, photo. **The email is never shown to other users.**
- The WhatsApp number is entered by the user (Google does not provide it), validated for format only. It is shown only through the WhatsApp redirect; cards show first name and area.
- Rate limit per account; cap of active listings per account (e.g. 5); rate limit on the WhatsApp redirect to limit number harvesting.
- Report button on every listing; admin can hide a listing or block an account.
- Disclaimer: "We only connect people. Travel is at your own risk."
- Listings auto-hide after the event ends. Provide a "Delete my account and data" option.

## 9. Functional requirements (v1)
| ID | Requirement | Priority |
|---|---|---|
| F1 | Event page with real categories, start times, key dates and locations | P0 |
| F2 | Create Offer / Request for each leg | P0 |
| F3 | Google Places autocomplete for origin and stay; event location auto-filled | P0 |
| F4 | Search/filter by leg, origin radius, date, time window, category | P0 |
| F5 | WhatsApp redirect with prefilled message | P0 |
| F6 | Google sign-in; profile (name, WhatsApp number) | P0 |
| F7 | "My listings": edit, mark Full, delete (owner only) | P0 |
| F8 | Share button (WhatsApp) and link preview image | P1 |
| F9 | Helper text: bib pickup window and start time next to the chosen category | P1 |
| F10 | Report listing; admin hide/delete/block | P1 |
| F11 | Admin event setup | P1 (can be a seed script for launch) |
| F12 | Delete account and data | P1 |
| F13 | PWA install, cached event info for patchy network | P2 |

## 10. Non-functional requirements
- Mobile-first; fast on mid-range Android over 4G
- Accessible: large tap targets, high contrast
- Phone numbers and emails never logged or exposed in bulk
- Google Cloud usage (Places + OAuth) kept within budget (see §12)
- Expected load: hundreds to ~1,500 users (the event expects 1,000+ runners)

## 11. Data model (draft)
- **Profile**(id = auth user id, email, display_name, photo_url, whatsapp_e164, is_admin, is_blocked, created_at)
- **Event**(id, name, year, start_date, end_date, race_date, timezone, venue_place_id, venue_lat, venue_lng, is_active)
- **KeyLocation**(id, event_id, label, place_id, lat, lng, address, map_url) e.g. Start Area, Sunset Point, Mallanduru Circle
- **Category**(id, event_id, name, distance_km, start_at, cutoff_at, is_night, bib_pickup_note)
- **Listing**(id, event_id, owner_id → Profile, type[OFFER|REQUEST], leg, category_id?, origin_place_id, origin_label, origin_lat, origin_lng, dest_place_id, dest_label, dest_lat, dest_lng, depart_at, seats, cost_note, notes, status[ACTIVE|FULL|HIDDEN|EXPIRED], created_at)
- **Report**(id, listing_id, reporter_id, reason, created_at)

Row-level security: anyone can read ACTIVE listings (without the WhatsApp number); only `owner_id = auth.uid()` or admins can insert/update/delete; Profile rows are readable only by their owner and admins.

## 12. Open questions and risks
1. **Organizer permission and branding.** "Malnad Ultra" is an event run by GIREM. Using the name and the pulled info should be confirmed with them (ideally they share the link in the official community). Until then, label the site as unofficial.
2. **Google Cloud setup and cost.** Places autocomplete needs a billing account and API key. Google sign-in needs an OAuth client and consent screen (basic scopes need no Google verification review, but the app name, support email and privacy policy URL are required). Confirm which Google account owns the project.
3. **Google sign-in inside WhatsApp's in-app browser.** Google blocks sign-in in embedded webviews. Links tapped in WhatsApp may open in an in-app browser; this must be tested on Android and iOS early. If it fails, show an "Open in Chrome/Safari" prompt before sign-in.
4. **Date inconsistency on the event site.** The Plan Trip page says departure on "Sunday, November 28", but 28 Nov 2026 is a Saturday and the Race Guide says the night/100K finish is Sunday the 29th. We treat 28 Nov as race day and 29 Nov as the return day; confirm with the organizers.
5. **Domain.** The name is decided (Event Car Pool, slug `event_car_pool`). There is no custom domain, so v1 launches on the free address the host gives (e.g. a `*.vercel.app` address). The privacy policy page lives on that address. A custom domain can be added later; the API key's allowed referrers and the sign-in redirect addresses must then be updated.
6. **Cost guidance.** Free-text cost note only, or a suggested per-seat share?
7. **Time field for local legs.** "Depart at" only, or also "arrive by" (useful for the 4:30 AM breakfast crowd and for the 3:30 AM night finishers)?
8. **Timeline.** Race is 32 days away. Target a working v1 within about a week so people can plan before 27 Nov.
9. **Sign-in for browsing and contacting.** RESOLVED 27 Oct 2026: browsing is open; tapping "Chat on WhatsApp" requires Google sign-in (protects numbers from scraping). See Decision Log.
10. **Registration status.** The race site says entries are closed for 30K and both 50K categories; 100K registration closes 1 Nov. This does not affect the app, but participant counts will not grow after that.

## 13. Milestones (proposed)
1. Sign off this PRD and CLAUDE.md (today)
2. Set up Google Cloud project: Places key, OAuth client, consent screen (by ~29 Oct)
3. Clickable prototype: event page, offer form with Places search, sign-in step, results (by ~30 Oct)
4. Build v1 (F1-F7), test with a few runners including opening the link from WhatsApp (by ~4 Nov)
5. Share in the event WhatsApp group; add F8-F12 (by ~8 Nov)
6. Monitor through 29 Nov; retrospective; generalise for other events

## 14. Decision Log
| Date | Decision |
|---|---|
| 27 Oct 2026 | Mobile-first PWA website |
| 27 Oct 2026 | Legs: home → event, stay → start, return |
| 27 Oct 2026 | Multi-event platform; Malnad Ultra 2026 first |
| 27 Oct 2026 | Use actual event name and real category times (from malnadultra.com) |
| 27 Oct 2026 | Origin/stay via Google Places search; event location auto-fetched |
| 27 Oct 2026 | Women-only rides out of scope for v1 |
| 27 Oct 2026 | Distribution: shared only in the event's WhatsApp group |
| 27 Oct 2026 | Google sign-in required to post/edit/delete (replaces the earlier no-login, secret-link plan) |
| 27 Oct 2026 | Product name: Event Car Pool (slug `event_car_pool`; Google Cloud project ID `event-car-pool`, since project IDs cannot contain underscores) |
| 27 Oct 2026 | Google Cloud project owned by mkrat2311@gmail.com |
| 27 Oct 2026 | App admin: mkrat2311@gmail.com (initial admin allow-list) |
| 27 Oct 2026 | No custom domain for v1; launch on the host's free address |
| 27 Oct 2026 | Supabase approved as backend (Postgres + Google auth). New tables: `profiles`, `listings`, `reports`, `admins` (schema in `supabase/001_init.sql`). Admins live in the `admins` table (initial: mkrat2311@gmail.com) |
| 27 Oct 2026 | DECIDED by owner: tapping Chat on WhatsApp requires Google sign-in, so numbers cannot be scraped. Implemented via `get_contact()` granted to signed-in users only. Browsing and search stay open |
| 27 Oct 2026 | Home page is minimal: intro, the three trips, and how it works. Race list and "Plan your trip" removed (races stay on the post form) |
| 27 Oct 2026 | The event end of a trip is pre-filled on the post form but editable, so people can enter their stay (replaces "event location is fixed and never typed") |
| 27 Oct 2026 | Ride page shows the route: an "Open in Google Maps" directions link plus an embedded map loaded on tap (Maps Embed API, free). Form hint asks people to pick a landmark or area, not a home address |
