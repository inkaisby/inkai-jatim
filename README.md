# INKAI Jatim Portal

Portal resmi INKAI Jawa Timur dengan autentikasi terintegrasi ke database operasional (`User`, `Member`, RBAC).

## Setup lokal

```bash
npm install
cp .env.example .env.local
# isi env vars
npm run dev
```

## Env wajib (Vercel)

| Variable | Keterangan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mzmdhkwleufeiyaspmns.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Key `sb_publishable_...` dari Supabase |
| `SUPABASE_SECRET_KEY` | Key `sb_secret_...` (server only) |
| `PORTAL_SESSION_SECRET` | Random string min 32 karakter |
| `NEXT_PUBLIC_APP_URL` | `https://inkai-jatim.vercel.app` |
| `DIRECT_URL` | PostgreSQL session pooler (port 5432) + password DB |

Legacy alias yang juga didukung: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

File siap salin: `vercel.env.copy.txt` (local only, tidak di-commit).

## Database migration

```bash
# Opsi A: otomatis (butuh SUPABASE_DB_URL)
npm run db:migrate

# Opsi B: manual via Supabase SQL Editor
# jalankan berurutan file di supabase/migrations/
```

Migration penting:
- `20260713_000004_portal_user_member_integration.sql`
- `20260713_000005_production_hardening.sql`

Seed permission ADMIN_DOJO (data-only):

```bash
npm run db:seed-permissions
```

## Fitur utama

- Portal publik: berita, agenda, dojo, dokumen
- Login/register anggota (Provinsi → Cabang → Dojo)
- Dashboard RBAC scoped per wilayah
- Verifikasi anggota pending (admin cabang/dojo)
- Forgot/reset password
- Health check: `/api/health`

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run db:migrate
npm run db:seed-permissions
```

## Deploy Vercel

Set semua env dari `.env.example` di Project Settings Vercel, lalu deploy branch `main`.
