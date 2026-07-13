-- Production hardening: portal profiles, ADMIN_DOJO permissions, portal_dojos sync

-- 1) portal_member_profiles linked to operational User/Member tables
drop trigger if exists on_auth_user_created_portal_member on auth.users;

create table if not exists public.portal_member_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  member_id uuid unique,
  branch_id uuid,
  dojo_id uuid,
  full_name text not null,
  branch_name text,
  dojo_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portal_member_profiles drop constraint if exists portal_member_profiles_user_id_fkey;
alter table public.portal_member_profiles
  add constraint portal_member_profiles_user_id_fkey
  foreign key (user_id) references public."User"(id) on delete cascade;

alter table public.portal_member_profiles drop constraint if exists portal_member_profiles_member_id_fkey;
alter table public.portal_member_profiles
  add constraint portal_member_profiles_member_id_fkey
  foreign key (member_id) references public."Member"(id) on delete set null;

alter table public.portal_member_profiles drop constraint if exists portal_member_profiles_branch_id_fkey;
alter table public.portal_member_profiles
  add constraint portal_member_profiles_branch_id_fkey
  foreign key (branch_id) references public."Branch"(id) on delete set null;

alter table public.portal_member_profiles drop constraint if exists portal_member_profiles_dojo_id_fkey;
alter table public.portal_member_profiles
  add constraint portal_member_profiles_dojo_id_fkey
  foreign key (dojo_id) references public."Dojo"(id) on delete set null;

create index if not exists portal_member_profiles_status_idx on public.portal_member_profiles (status);
create index if not exists portal_member_profiles_branch_idx on public.portal_member_profiles (branch_id);
create index if not exists portal_member_profiles_dojo_idx on public.portal_member_profiles (dojo_id);

alter table public.portal_member_profiles enable row level security;

drop policy if exists portal_member_profiles_service_all on public.portal_member_profiles;
create policy portal_member_profiles_service_all
on public.portal_member_profiles
for all
to service_role
using (true)
with check (true);

-- 2) ADMIN_DOJO permissions (dashboard, members, verification)
insert into public."RolePermission" ("roleId", "permissionId")
select r.id, p.id
from public."Role" r
cross join public."Permission" p
where r.name = 'ADMIN_DOJO'
  and p.slug in ('dashboard', 'members', 'verification')
on conflict do nothing;

-- 3) Sync portal_dojos from Dojo (Jawa Timur)
insert into public.portal_dojos (name, slug, address, status, visibility)
select
  d.name,
  lower(regexp_replace(regexp_replace(trim(d.name), '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
    || '-' || substr(d.id::text, 1, 8),
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
