-- Seed data (optional) for Portal INKAI Jatim
-- Jalankan ini SETELAH migration `20260318_000001_portal_public.sql`.
-- Catatan: karena RLS aktif, jalankan via SQL Editor (service role) / owner.

-- Categories
insert into public.portal_categories (name, slug)
values
  ('Pengumuman', 'pengumuman'),
  ('Kejuaraan', 'kejuaraan'),
  ('Organisasi', 'organisasi'),
  ('Dojo', 'dojo'),
  ('Prestasi', 'prestasi')
on conflict (slug) do nothing;

-- Posts (1 pinned + beberapa berita)
insert into public.portal_posts
  (title, slug, excerpt, content, category_id, status, visibility, is_pinned, pinned_order, published_at)
values
  (
    'Pengumuman: Portal INKAI Jatim Tahap 1',
    'pengumuman-portal-inkai-jatim-tahap-1',
    'Portal publik sudah tersedia di /portal. Tahap 1 fokus: Berita, Agenda, Dojo, Dokumen.',
    'Portal INKAI Jatim tahap 1 sudah aktif.\n\nKonten internal & halaman login akan dibahas pada tahap berikutnya.',
    (select id from public.portal_categories where slug = 'pengumuman' limit 1),
    'published',
    'public',
    true,
    1,
    now()
  ),
  (
    'Berita: Persiapan agenda bulan ini',
    'berita-persiapan-agenda-bulan-ini',
    'Rangkuman agenda publik yang akan datang.',
    'Silakan cek menu Agenda untuk melihat daftar kegiatan publik yang akan datang.',
    (select id from public.portal_categories where slug = 'organisasi' limit 1),
    'published',
    'public',
    false,
    null,
    now() - interval '2 days'
  ),
  (
    'Prestasi: Highlight atlet minggu ini',
    'prestasi-highlight-atlet-minggu-ini',
    'Kompilasi prestasi atlet INKAI Jatim.',
    'Selamat kepada atlet-atlet berprestasi. Detail akan dilengkapi oleh admin konten.',
    (select id from public.portal_categories where slug = 'prestasi' limit 1),
    'published',
    'public',
    false,
    null,
    now() - interval '7 days'
  )
on conflict (slug) do nothing;

-- Events
insert into public.portal_events
  (title, slug, type, start_at, end_at, location_text, status, visibility, published_at)
values
  (
    'Latihan bersama — Surabaya',
    'latihan-bersama-surabaya',
    'latihan_bersama',
    now() + interval '7 days',
    now() + interval '7 days' + interval '2 hours',
    'Surabaya',
    'published',
    'public',
    now()
  ),
  (
    'Rapat koordinasi pengurus',
    'rapat-koordinasi-pengurus',
    'rapat',
    now() + interval '14 days',
    null,
    'Sekretariat (detail menyusul)',
    'published',
    'public',
    now()
  )
on conflict (slug) do nothing;

-- Dojos
insert into public.portal_dojos
  (name, slug, address, status, visibility)
values
  ('Dojo Contoh Surabaya', 'dojo-contoh-surabaya', 'Surabaya, Jawa Timur', 'active', 'public'),
  ('Dojo Contoh Malang', 'dojo-contoh-malang', 'Malang, Jawa Timur', 'active', 'public')
on conflict (slug) do nothing;

-- Documents (file_path mengarah ke object di bucket portal-public)
-- Upload file dulu ke bucket `portal-public`, lalu sesuaikan path-nya.
insert into public.portal_documents
  (title, slug, file_path, version_label, status, visibility, published_at)
values
  (
    'Template Surat — Contoh',
    'template-surat-contoh',
    'templates/template-surat-contoh.pdf',
    'v1',
    'published',
    'public',
    now()
  )
on conflict (slug) do nothing;

