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
- `SUPABASE_SERVICE_ROLE_KEY` (server auth/register)
- `PORTAL_SESSION_SECRET` (JWT session cookie, min 32 karakter)

## Auth / Login Member (Tahap 2+)
Portal login terintegrasi dengan tabel operasional:
- `User` + `_UserRoles` + `Role` (RBAC)
- `Member` (anggota per dojo)
- `portal_member_profiles` (status verifikasi portal)

Migration:
- `supabase/migrations/20260713_000004_portal_user_member_integration.sql`
- `supabase/migrations/20260713_000005_production_hardening.sql` (**permissions + sync dojo**)

Jalankan otomatis:
```bash
npm run db:migrate          # butuh SUPABASE_DB_URL
npm run db:seed-permissions # butuh SUPABASE_SERVICE_ROLE_KEY
```

API routes:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/org/branches`
- `GET /api/org/dojos?branchId=...`

Dropdown pendaftaran: Provinsi (Jatim) → Cabang → Dojo/Ranting dari tabel `Branch` + `Dojo`.

Di Supabase Dashboard, pastikan:
- **Authentication > Providers > Email** aktif (opsional, portal pakai tabel `User`)
- Jalankan migration `20260713_000004_portal_user_member_integration.sql`

