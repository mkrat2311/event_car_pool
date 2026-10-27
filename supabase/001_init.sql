-- Event Car Pool: initial schema. Run once in Supabase -> SQL Editor.
-- Privacy: listings are public to read but hold no contact details.
-- The WhatsApp number lives in profiles and is readable only by its owner
-- and by get_contact(), which the server calls for /connect/[listingId].

create table public.admins (
  email text primary key
);
insert into public.admins (email) values ('mkrat2311@gmail.com');

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  whatsapp text not null check (whatsapp ~ '^\+91[0-9]{10}$'),
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  event_id text not null default 'malnad-ultra-2026',
  type text not null check (type in ('OFFER', 'REQUEST')),
  leg text not null check (leg in ('TO_EVENT', 'LOCAL_TO_START', 'RETURN')),
  category_id text,
  origin_place_id text,
  origin_label text not null,
  origin_lat double precision not null,
  origin_lng double precision not null,
  dest_place_id text,
  dest_label text not null,
  dest_lat double precision not null,
  dest_lng double precision not null,
  depart_at timestamptz not null,
  seats int not null check (seats between 1 and 8),
  cost_note text not null default '',
  notes text not null default '' check (char_length(notes) <= 300),
  display_name text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'FULL')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listings_event_leg_depart on public.listings (event_id, leg, depart_at);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  reporter_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reason text not null check (char_length(reason) <= 300),
  created_at timestamptz not null default now()
);

alter table public.admins   enable row level security;
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.reports  enable row level security;

-- admins: no policies = nobody can read or write from the app (is_admin() bypasses via security definer)

create policy "profile: own read"   on public.profiles for select using (id = auth.uid());
create policy "profile: own insert" on public.profiles for insert with check (id = auth.uid());
create policy "profile: own update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profile: own delete" on public.profiles for delete using (id = auth.uid());

create policy "listing: public read"   on public.listings for select using (true);
create policy "listing: owner insert"  on public.listings for insert with check (owner_id = auth.uid());
create policy "listing: owner/admin update" on public.listings for update
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy "listing: owner/admin delete" on public.listings for delete
  using (owner_id = auth.uid() or public.is_admin());

create policy "report: signed-in insert" on public.reports for insert with check (reporter_id = auth.uid());
create policy "report: admin read"       on public.reports for select using (public.is_admin());
create policy "report: admin delete"     on public.reports for delete using (public.is_admin());

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger listings_touch before update on public.listings
  for each row execute function public.touch_updated_at();

-- The only way to read someone's WhatsApp number. Called by the server route
-- /connect/[listingId]. Requires a signed-in caller (PRD section 12: proposed, to confirm).
create or replace function public.get_contact(p_listing_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select p.whatsapp
  from public.listings l
  join public.profiles p on p.id = l.owner_id
  where l.id = p_listing_id and l.status = 'ACTIVE' and auth.uid() is not null;
$$;
revoke all on function public.get_contact(uuid) from public, anon;
grant execute on function public.get_contact(uuid) to authenticated;
