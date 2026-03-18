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

