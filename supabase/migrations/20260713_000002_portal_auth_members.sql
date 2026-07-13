-- Portal INKAI Jatim - Tahap 2 (Auth / Member profiles)
-- Links Supabase Auth users to portal member metadata.

create table if not exists public.portal_member_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  member_id text,
  dojo_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portal_member_profiles_status_idx
  on public.portal_member_profiles (status);

alter table public.portal_member_profiles enable row level security;

create policy "portal_member_profiles_select_own"
on public.portal_member_profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "portal_member_profiles_insert_own"
on public.portal_member_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "portal_member_profiles_update_own"
on public.portal_member_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.handle_new_portal_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.portal_member_profiles (user_id, full_name, member_id, dojo_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data->>'member_id', ''),
    nullif(new.raw_user_meta_data->>'dojo_name', '')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_portal_member on auth.users;

create trigger on_auth_user_created_portal_member
  after insert on auth.users
  for each row
  execute function public.handle_new_portal_member();
