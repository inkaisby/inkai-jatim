-- Portal INKAI Jatim - integrate portal auth with existing org tables (User/Member/RBAC)
-- Replaces auth.users linkage with public."User" + public."Member"

drop trigger if exists on_auth_user_created_portal_member on auth.users;

drop table if exists public.portal_member_profiles cascade;

create table public.portal_member_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public."User"(id) on delete cascade,
  member_id uuid unique references public."Member"(id) on delete set null,
  branch_id uuid references public."Branch"(id) on delete set null,
  dojo_id uuid references public."Dojo"(id) on delete set null,
  full_name text not null,
  branch_name text,
  dojo_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portal_member_profiles_status_idx
  on public.portal_member_profiles (status);

create index if not exists portal_member_profiles_branch_idx
  on public.portal_member_profiles (branch_id);

create index if not exists portal_member_profiles_dojo_idx
  on public.portal_member_profiles (dojo_id);

alter table public.portal_member_profiles enable row level security;

create policy "portal_member_profiles_service_all"
on public.portal_member_profiles
for all
to service_role
using (true)
with check (true);

-- Sync portal_dojos from operational Dojo table (Jawa Timur only)
insert into public.portal_dojos (name, slug, address, status, visibility)
select
  d.name,
  lower(
    regexp_replace(
      regexp_replace(trim(d.name), '[^a-zA-Z0-9]+', '-', 'g'),
      '(^-|-$)',
      '',
      'g'
    )
  ) || '-' || substr(d.id::text, 1, 8),
  d.address,
  'active',
  'public'
from public."Dojo" d
join public."Branch" b on b.id = d."branchId"
join public."Province" p on p.id = b."provinceId"
where p.name = 'JAWA TIMUR'
  and d."isDeleted" = false
  and b."isDeleted" = false
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  status = excluded.status,
  visibility = excluded.visibility,
  updated_at = now();
