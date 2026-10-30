-- Run once in Supabase SQL Editor.
create table if not exists public.tributes (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 display_name text not null check (char_length(display_name) between 1 and 70),
 country_code text not null check (country_code ~ '^[A-Z]{2}$'),
 message text not null check (char_length(message) between 5 and 1200),
 status text not null default 'pending' check (status in ('pending','approved','rejected'))
);
create index if not exists tributes_approved_idx on public.tributes (created_at desc) where status = 'approved';
alter table public.tributes enable row level security;
-- No public table policies: only the server-side Edge Function uses service_role.
-- Approve messages in Supabase Table Editor: status = approved.

-- Public clients cannot read pending content or bypass owner moderation.
revoke all on public.tributes from anon, authenticated;
grant select, insert, update, delete on public.tributes to service_role;

-- Additive location migration; existing tributes retain country-level positions.
alter table public.tributes add column if not exists city text check (char_length(city) between 1 and 100);
alter table public.tributes add column if not exists latitude double precision check (latitude between -90 and 90);
alter table public.tributes add column if not exists longitude double precision check (longitude between -180 and 180);
-- Re-running the schema is safe; enforce paired coordinates on all records.
alter table public.tributes drop constraint if exists tributes_coordinate_pair;
alter table public.tributes add constraint tributes_coordinate_pair check ((latitude is null) = (longitude is null));
