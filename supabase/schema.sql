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
