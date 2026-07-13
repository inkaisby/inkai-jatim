# Supabase migrations (Portal INKAI Jatim)

Migration utama untuk portal publik ada di:
- `supabase/migrations/20260318_000001_portal_public.sql`

## Cara apply (pilih salah satu)

### A) Supabase CLI (disarankan)
1. Install Supabase CLI.
2. Login dan link project.
3. Jalankan migration.

### B) Supabase SQL Editor (manual cepat)
Copy-paste isi file migration ke SQL Editor di Supabase, lalu jalankan.

## Env yang dibutuhkan aplikasi
Buat `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Auth / Login Member (Tahap 2)
Migration auth ada di:
- `supabase/migrations/20260713_000002_portal_auth_members.sql`

Tabel `portal_member_profiles` menyimpan profil anggota (nama, cabang, status verifikasi).
Dropdown pendaftaran mengambil data dari tabel `Branch` (filter provinsi Jawa Timur).
Trigger `on_auth_user_created_portal_member` otomatis membuat profil saat user mendaftar via Supabase Auth.

Migration cabang:
- `supabase/migrations/20260713_000003_portal_member_branch.sql`

Di Supabase Dashboard, pastikan:
- **Authentication > Providers > Email** aktif
- **Site URL** diset ke `https://inkai-jatim.vercel.app` (dan `http://localhost:3000` untuk dev)
- Jalankan migration Tahap 2 setelah migration Tahap 1

