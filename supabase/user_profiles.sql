-- Run in Supabase SQL Editor (once). Creates profile + tier for Nexus subscription gates.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  subscription_tier text not null default 'Free',
  language text not null default 'en',
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
  add column if not exists language text not null default 'en';

comment on table public.user_profiles is 'Nexus reader tiers: Free, Basic, Premium, Pro';

alter table public.user_profiles enable row level security;

create policy "user_profiles_select_own"
  on public.user_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "user_profiles_update_own"
  on public.user_profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "user_profiles_insert_own"
  on public.user_profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Optional: seed a row when a user signs up (uncomment if you want auto-rows at Free tier)
-- create or replace function public.handle_new_user()
-- returns trigger as $$
-- begin
--   insert into public.user_profiles (id) values (new.id);
--   return new;
-- end;
-- $$ language plpgsql security definer;
--
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();
