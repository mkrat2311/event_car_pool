-- Bib transfer listings. Run once in Supabase -> SQL Editor, after 001_init.sql.
-- One listing per person per event (a person runs one race).
-- The WhatsApp number stays in profiles; get_bib_contact() is the only way to read it.

create table public.bib_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  event_id text not null default 'malnad-ultra-2026',
  category_id text not null check (category_id in ('30k', '50k-day', '50k-night', '100k')),
  note text not null default '' check (char_length(note) <= 140),
  display_name text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'TAKEN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, owner_id)
);
create index bib_listings_event_cat on public.bib_listings (event_id, category_id, created_at desc);

alter table public.bib_listings enable row level security;

create policy "bib: public read"        on public.bib_listings for select using (true);
create policy "bib: owner insert"       on public.bib_listings for insert with check (owner_id = auth.uid());
create policy "bib: owner/admin update" on public.bib_listings for update
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy "bib: owner/admin delete" on public.bib_listings for delete
  using (owner_id = auth.uid() or public.is_admin());

create trigger bib_listings_touch before update on public.bib_listings
  for each row execute function public.touch_updated_at();

create or replace function public.get_bib_contact(p_bib_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select p.whatsapp
  from public.bib_listings b
  join public.profiles p on p.id = b.owner_id
  where b.id = p_bib_id and b.status = 'ACTIVE' and auth.uid() is not null;
$$;
revoke all on function public.get_bib_contact(uuid) from public, anon;
grant execute on function public.get_bib_contact(uuid) to authenticated;
