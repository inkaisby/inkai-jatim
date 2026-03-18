-- Portal INKAI Jatim - Tahap 1 (public read-only)
-- Notes:
-- - RLS enabled on all portal tables
-- - Public (anon + authenticated) can only SELECT published+public
-- - Insert/Update/Delete are intentionally NOT allowed (service role bypasses RLS)

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'portal_status') then
    create type portal_status as enum ('draft', 'review', 'published', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'portal_visibility') then
    create type portal_visibility as enum ('public', 'internal');
  end if;
end$$;

-- ----------------------------
-- Categories / Tags
-- ----------------------------

create table if not exists public.portal_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists portal_categories_slug_uq on public.portal_categories (slug);

alter table public.portal_categories enable row level security;

create policy "portal_categories_public_read"
on public.portal_categories
for select
to anon, authenticated
using (true);

create table if not exists public.portal_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists portal_tags_slug_uq on public.portal_tags (slug);

alter table public.portal_tags enable row level security;

create policy "portal_tags_public_read"
on public.portal_tags
for select
to anon, authenticated
using (true);

-- ----------------------------
-- Posts (Berita / Pengumuman)
-- ----------------------------

create table if not exists public.portal_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  excerpt text,
  content text,
  cover_image_path text,
  category_id uuid references public.portal_categories(id) on delete set null,
  status portal_status not null default 'draft',
  visibility portal_visibility not null default 'public',
  is_pinned boolean not null default false,
  pinned_order integer,
  published_at timestamptz,
  author_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists portal_posts_slug_uq on public.portal_posts (slug);
create index if not exists portal_posts_published_at_idx on public.portal_posts (published_at desc);
create index if not exists portal_posts_category_idx on public.portal_posts (category_id);
create index if not exists portal_posts_pinned_idx on public.portal_posts (is_pinned, pinned_order);

alter table public.portal_posts enable row level security;

create policy "portal_posts_public_read_published_public"
on public.portal_posts
for select
to anon, authenticated
using (status = 'published' and visibility = 'public');

-- Tags join
create table if not exists public.portal_post_tags (
  post_id uuid not null references public.portal_posts(id) on delete cascade,
  tag_id uuid not null references public.portal_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

alter table public.portal_post_tags enable row level security;

create policy "portal_post_tags_public_read"
on public.portal_post_tags
for select
to anon, authenticated
using (true);

-- ----------------------------
-- Events (Agenda)
-- ----------------------------

create table if not exists public.portal_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  type text,
  start_at timestamptz not null,
  end_at timestamptz,
  location_text text,
  city_id uuid,
  pic_name text,
  pic_contact text,
  registration_url text,
  status portal_status not null default 'draft',
  visibility portal_visibility not null default 'public',
  published_at timestamptz,
  author_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists portal_events_slug_uq on public.portal_events (slug);
create index if not exists portal_events_start_at_idx on public.portal_events (start_at asc);
create index if not exists portal_events_published_at_idx on public.portal_events (published_at desc);

alter table public.portal_events enable row level security;

create policy "portal_events_public_read_published_public"
on public.portal_events
for select
to anon, authenticated
using (status = 'published' and visibility = 'public');

-- ----------------------------
-- Dojos
-- ----------------------------

create table if not exists public.portal_dojos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  address text,
  city_id uuid,
  lat double precision,
  lng double precision,
  schedule_json jsonb,
  official_contact_name text,
  official_contact_phone text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  visibility portal_visibility not null default 'public',
  dojo_pic_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists portal_dojos_slug_uq on public.portal_dojos (slug);
create index if not exists portal_dojos_name_idx on public.portal_dojos (name);

alter table public.portal_dojos enable row level security;

create policy "portal_dojos_public_read_active_public"
on public.portal_dojos
for select
to anon, authenticated
using (status = 'active' and visibility = 'public');

-- ----------------------------
-- Documents
-- ----------------------------

create table if not exists public.portal_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  category_id uuid references public.portal_categories(id) on delete set null,
  file_path text not null,
  mime_type text,
  file_size bigint,
  version_label text,
  status portal_status not null default 'draft',
  visibility portal_visibility not null default 'public',
  published_at timestamptz,
  owner_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists portal_documents_slug_uq on public.portal_documents (slug) where slug is not null;
create index if not exists portal_documents_published_at_idx on public.portal_documents (published_at desc);
create index if not exists portal_documents_category_idx on public.portal_documents (category_id);

alter table public.portal_documents enable row level security;

create policy "portal_documents_public_read_published_public"
on public.portal_documents
for select
to anon, authenticated
using (status = 'published' and visibility = 'public');

-- ----------------------------
-- Audit logs (server-only writes)
-- ----------------------------

create table if not exists public.portal_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.portal_audit_logs enable row level security;

create policy "portal_audit_logs_admin_read_only_placeholder"
on public.portal_audit_logs
for select
to authenticated
using (false);

-- ----------------------------
-- Storage buckets + policies
-- ----------------------------
-- Buckets:
-- - portal-public: public read
-- - portal-internal: private (no public read)

insert into storage.buckets (id, name, public)
values ('portal-public', 'portal-public', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('portal-internal', 'portal-internal', false)
on conflict (id) do nothing;

-- Allow anyone to read objects from portal-public bucket
create policy "portal_public_bucket_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'portal-public');

-- Deny reads from portal-internal by default (will be opened in Tahap 2 via role-based policy)
create policy "portal_internal_bucket_read_denied"
on storage.objects
for select
to anon, authenticated
using (bucket_id <> 'portal-internal');

