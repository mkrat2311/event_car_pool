# Event Car Pool

A carpool board for event participants (first event: Malnad Ultra 2026). People
offer or request rides, find a match, then continue on WhatsApp. See `PRD.md` for
the full spec and `CLAUDE.md` for working rules.

**Current state:** demo mode. The screens work with sample rides; rides you post
are kept in your browser only. Google sign-in and the database come next.

## Run it on your computer

You need Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local     # then add your Google key (optional, see below)
npm run dev
```

Open http://localhost:3000.

### Google place search (optional)

Without a key, place search uses a small built-in list of Karnataka places. To search
anywhere, put your browser key in `.env.local`:

```
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-key-here
```

The key must allow **Places API (New)** only, with HTTP referrer restrictions for
`http://localhost:3000/*` and your deployed address. `.env.local` is ignored by git;
never commit a key.

### Supabase and Google sign-in (optional)

Add both values from Supabase (Project Settings, API) to `.env.local` and to Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Run `supabase/001_init.sql` once in the Supabase SQL Editor. With these set, listings
are stored in the database and Google sign-in is required to post. Without them the
app stays in demo mode.

## Check it

```bash
npm run typecheck
npm run build
```

## Put it online (GitHub + Vercel)

1. Create an empty repository on GitHub named `event_car_pool` and push this code to it.
2. On vercel.com, sign in with GitHub, choose **Add New → Project**, and import the repo.
3. In the project's **Settings → Environment Variables**, add `NEXT_PUBLIC_GOOGLE_MAPS_KEY`.
4. Deploy. Vercel gives you a free `*.vercel.app` address.
5. In Google Cloud, add `https://your-address.vercel.app/*` to the API key's allowed
   referrers.

## Layout

- `src/app/` pages: home, find, ride details, post, my listings, edit, privacy
- `src/components/` shared pieces (place search, listing card, post/edit form, nav)
- `src/lib/` event data, sample rides, place search, time helpers, browser storage

## What is sample or temporary

- `src/lib/seed.ts`: made-up rides so you can try the flow.
- `src/lib/store.ts`: browser storage standing in for the database and for sign-in.
- The name and WhatsApp number fields on the post form: replaced by Google sign-in.
- Event coordinates in `src/lib/event.ts` are approximate until exact Google Places
  lookups are added.
