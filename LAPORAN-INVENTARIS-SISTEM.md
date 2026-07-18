# Laporan Inventaris Sistem — INKAI Jawa Timur

**Aplikasi:** Portal web Institut Karate-Do Indonesia (INKAI) Pengprov Jawa Timur  
**Repository:** `inkai-jatim`  
**Platform:** Next.js (App Router) + Inkai API + Supabase/PostgreSQL  
**URL produksi:** https://inkai-jatim.vercel.app  
**Tanggal dokumen:** 18 Juli 2026  
**Peran:** living context untuk pengurus & agent — baca sebelum develop; update bersamaan dengan perubahan kode. Nama file ini **tetap**.

**Posisi organisasi:** portal **Provinsi (Pengprov)**, bukan Cabang. Referensi cabang operasional yang matang: `inkai-sby` (Cabang Surabaya) — jangan mengasumsikan fitur 1:1.

---

## 1. Ringkasan eksekutif

Sistem **inkai-jatim** adalah portal resmi **Pengurus Provinsi Jawa Timur** yang melayani:

1. **Publik** — profil organisasi, berita, agenda, dan direktori dojo se-Jawa Timur.
2. **Pengurus berjenjang** — admin scoped RBAC (`/admin`) untuk ringkasan wilayah, organisasi (dojo), verifikasi anggota, dan profil akun.
3. **Calon / anggota** — login & registrasi (Provinsi Jatim → Cabang → Dojo), forgot/reset password.

**Bukan** portal operasional harian Cabang (iuran, UKT, absensi GPS, store, dll.). Fitur itu menjadi tanggung jawab produk cabang (contoh: `inkai-sby`) kecuali Pengprov secara eksplisit membutuhkan oversight *read-only* lintas cabang.

---

## 2. Tujuan sistem

| Tujuan | Keterangan |
|--------|------------|
| Identitas Pengprov Jatim | Portal publik resmi wilayah Jawa Timur |
| Digitalisasi masuk keanggotaan | Registrasi → verifikasi admin sesuai cakupan |
| Transparansi organisasi | Struktur, berita, agenda, dojo |
| Kontrol akses wilayah | RBAC User → Dojo → Cabang → Provinsi → Pusat |
| Oversight multi-cabang | Ringkasan & daftar scoped (fondasi; belum laporan lengkap) |

---

## 3. Arsitektur singkat

```
[Browser]
    │
    ▼
[Next.js — inkai-jatim.vercel.app]
    ├── Auth cookie (Inkai token + session portal)
    ├── UI Publik / Admin (`/admin`)
    │
    ├──► Inkai API (auth, stats, org, members) — sumber operasional utama
    └──► Supabase / PostgreSQL (RBAC, scope wilayah, permission, data portal)
```

**Environment utama:** `INKAI_API_URL`, `NEXT_PUBLIC_INKAI_API_URL`, `NEXT_PUBLIC_APP_URL`, serta (jika dipakai) `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY` / publishable key, `PORTAL_SESSION_SECRET`, `DIRECT_URL`.

**Konstanta wilayah:** `JATIM_PROVINCE_NAME = "JAWA TIMUR"` di `lib/portal/organization.ts`.

---

## 4. Fitur website publik

| Route | Fungsi | Status |
|-------|--------|--------|
| `/` | Beranda (hero, CTA, cuplikan konten) | Aktif |
| `/profil` | Profil / struktur organisasi Pengprov | Aktif (konten struktur masih cenderung statis) |
| `/berita` | Daftar berita | Aktif (bergantung tabel/data portal) |
| `/berita/[slug]` | Detail berita | Aktif |
| `/agenda` | Daftar agenda | Aktif |
| `/agenda/[slug]` | Detail agenda | Aktif |
| `/dojo` | Direktori dojo se-Jatim | Aktif |
| `/dojo/[slug]` | Profil dojo | Aktif |
| `/forgot-password` | Ajuan reset password | Aktif |
| `/reset-password` | Set password baru | Aktif |
| Login / daftar | Modal di portal (`login-modal`) | Aktif |

**Catatan teknis:** terdapat folder `app/portal/` selain route group `app/(portal)/` — potensi duplikasi warisan; route kanonik yang dipakai layout adalah `(portal)`.

---

## 5. Portal admin (`/admin`) — kanonik

**URL kanonik admin = `/admin`.**  
`/dashboard` dan `/dashboard/*` di-redirect permanen (308) ke `/admin/*` via `middleware.ts` (kompatibilitas link lama).

**Integrasi:** semua data operasional admin lewat **inkai-backend** (`https://inkai-ecosystem.vercel.app`, path `/v1/*`).

| Modul | Route | Status | Fungsi |
|-------|-------|--------|--------|
| Beranda Admin | `/admin` | Aktif | KPI + menu eksekutif (selaras sby) |
| Kelola Anggota | `/admin/anggota` | Aktif | Cari/filter/export/verifikasi registrasi |
| Verifikasi | `/admin/verifikasi` | Aktif | Antrian klaim Inkai API |
| Organisasi | `/admin/organisasi` | Aktif | Dojo/ranting + filter cabang |
| Iuran Anggota | `/admin/iuran` | Aktif | Daftar + verifikasi pembayaran |
| UKT | `/admin/ukt` | Aktif | Oversight event UKT |
| Event & Kegiatan | `/admin/kegiatan` | Aktif | Daftar event |
| Absensi | `/admin/absensi` | Aktif | Log kehadiran scoped |
| Materi Digital | `/admin/materi` | Placeholder | Menu siap; upload menunggu endpoint |
| Store | `/admin/store` | Aktif | Katalog `/v1/inventory` |
| Pesan | `/admin/pesan` | Aktif | Inbox chat + tab broadcast |
| Carousel Beranda | `/admin/carousel` | Aktif | CRUD slide beranda |
| Notifikasi | `/admin/notifikasi` | Aktif | Inbox notifikasi admin |
| Log Audit | `/admin/audit` | Aktif | Log + export CSV |
| Pengaturan | `/admin/pengaturan/*` | Aktif | Hub + user/cabang/ranting/kebijakan/peran/geofencing/akun |

**Sidebar:** struktur grup **identik inkai-sby** (`lib/admin-nav.ts`): Keanggotaan / Keuangan & UKT / Kegiatan & Absensi / Konten & Layanan / Sistem. Filter `ADMIN_DOJO` sama pola sby.

**Alias:** `/admin/profil` → `/admin/pengaturan/akun`; `/admin/cabang` → `/admin/pengaturan/cabang`.

### 5.1 API proxy admin (lokal → backend)

```
/api/members                     → GET /v1/members
/api/members/[id]/verify        → PATCH /v1/members/:id/registration
/api/admin/verifications*        → /v1/verifications*
/api/admin/events                → /v1/events
/api/admin/billing*              → /v1/billing*
/api/admin/attendance            → /v1/attendance
/api/admin/store*                → /v1/inventory*
/api/admin/carousel*             → /v1/news-carousel*
/api/admin/audit                 → /v1/audit-logs
/api/admin/notifications         → /v1/notifications/my
/api/admin/pesan                 → /v1/chat/conversations
/api/admin/broadcast             → /v1/notifications/broadcast
```

### 5.2 Perbedaan vs inkai-sby (sengaja / sementara)

- Scope data: **Provinsi Jawa Timur**, bukan Cabang Surabaya
- Materi digital: menu ada, upload penuh menunggu endpoint materi khusus
- Kedalaman UKT/iuran/absensi: oversight via API (belum seluruh alur nota/gate sby)
- Pengaturan user multi-akun: fondasi UI; CRUD penuh menyusul API wilayah-accounts

---

## 6. Hierarki wilayah & peran

### 6.1 Struktur organisasi

```
Pusat / Nasional
  └── Provinsi (Pengprov Jawa Timur)   ← fokus produk inkai-jatim
        └── Cabang (kota/kab)
              └── Ranting / Dojo
                    └── Anggota
```

### 6.2 Kode peran (portal)

| Role | Label UI | Cakupan di Jatim |
|------|----------|------------------|
| `ADMIN_PUSAT` / `ADMINISTRATOR` / `ADMIN` | Administrator Pusat | Semua dojo di Provinsi JAWA TIMUR |
| `ADMIN_PROVINCE` | Admin Provinsi | Semua cabang & dojo di `managedProvinceId` |
| `ADMIN_BRANCH` | Admin Cabang | Dojo di `managedBranchId` |
| `ADMIN_DOJO` | Admin Dojo/Ranting | Satu `managedDojoId` |
| `MEMBER` | Anggota | Dojo sendiri |
| `PARENT` | Orang Tua/Wali | (didukung di tipe; pemakaian terbatas) |

Implementasi scope dojo: `getScopedDojoIds()` di `lib/auth/permissions.ts`.

### 6.3 Permission slug (saat ini tipis)

| Slug | Dipakai untuk |
|------|----------------|
| `members` | Kelola / lihat anggota |
| `verification` | Approve / reject pending |

Seed: `npm run db:seed-permissions` / migrasi hardening.

### 6.4 Prinsip RBAC wilayah (arah produk)

Selaras matriks ekosistem INKAI (referensi sby):

| Area | Anggota | Ranting | Cabang | **Pengprov** |
|------|---------|---------|--------|--------------|
| Profil sendiri | Edit | — | — | — |
| Verifikasi calon | — | Ya (scope) | Ya (scope) | Ya (scope Provinsi) |
| Kyu / DAN / NIA assign | Tidak edit sendiri | Terbatas | Operasional cabang | Umumnya **lihat** |
| Iuran / UKT tulis | Bayar sendiri (produk cabang) | Operasional | Operasional | Umumnya **lihat** / oversight |
| Nonaktif anggota | — | Scope dojo | Scope cabang | Umumnya **lihat** kecuali kebijakan berubah |

**Jangan** menempel hak tulis cabang ke UI Pengprov tanpa keputusan organisasi eksplisit.

---

## 7. Entitas & integrasi data

| Sumber | Entitas / endpoint penting |
|--------|----------------------------|
| Inkai API | `/v1/auth/*`, `/v1/dashboard/stats`, `/v1/org/provinces`, anggota, org |
| Supabase | `User`, `Member`, `Province`, `Branch`, `Dojo`, `Role`, `Permission`, `_UserRoles`, `RolePermission`, konten portal (jika tabel ada) |

**Catatan produksi:** error publik terkait `portal_posts` (schema cache) menandakan konten berita/agenda belum sepenuhnya terhubung DB — lihat §11.

---

## 8. Alur bisnis yang sudah berjalan

### 8.1 Keanggotaan (inti Jatim)

1. Calon daftar via modal login/daftar — pilih Cabang & Dojo di Jawa Timur.
2. `POST /api/auth/register` → backend / Inkai + relasi portal.
3. Status menunggu verifikasi (`pending` / `PENDING`).
4. Admin dengan permission membuka `/admin/anggota` → **approve** atau **reject** (`/api/members/[id]/verify`).
5. Anggota / pengurus login → redirect ke `/admin`.

### 8.2 Akses admin

1. Middleware cek cookie token untuk `/admin/*`.
2. Layout server `getSessionUser()`; tanpa sesi → `/?login=1`.
3. Data ringkasan dari Inkai API + scope RBAC lokal.

### 8.3 Belum ada di Jatim

- Siklus iuran, UKT, absensi, event non-UKT, pesan, store, materi, pindah dojo, piagam, audit log UI, pengaturan multi-akun.

---

## 9. Integrasi teknis

| Integrasi | Fungsi |
|-----------|--------|
| Inkai API | Auth token, stats, org, members |
| Cookie session | `INKAI_TOKEN_COOKIE` + session portal |
| Supabase admin client | RBAC, scope, permission (`lib/supabase/admin.ts` — **bukan** route UI) |
| Middleware | Proteksi `/admin`; redirect `/dashboard` → `/admin` |

---

## 10. Peta route API lokal

```
/api/auth/login
/api/auth/logout
/api/auth/register
/api/auth/me
/api/auth/forgot-password
/api/auth/reset-password
/api/members                 Daftar anggota (scoped, search/branchId/status)
/api/members/[id]/verify    Approve / reject registrasi
/api/admin/verifications     Antrian klaim pending
/api/admin/verifications/[id] Proses klaim
/api/admin/events            Daftar kegiatan
/api/admin/broadcast         Broadcast notifikasi Provinsi
/api/org/branches            Cabang (registrasi / org)
/api/org/dojos               Dojo per cabang
/api/health                  Health check
```

API operasional Inkai (contoh): `/v1/dashboard/stats`, `/v1/org/provinces`, `/v1/auth/me`, `/v1/members`, `/v1/verifications/*`, `/v1/events`, `/v1/notifications/broadcast` — dipanggil server-side.

---

## 11. Status kelengkapan & celah

| Area | Status | Catatan |
|------|--------|---------|
| Portal publik dasar | Aktif | Profil, berita, agenda, dojo |
| Konten berita/agenda DB | Rentan | Perlu pastikan tabel portal & seed; error `portal_posts` pernah muncul di produksi |
| Auth login/register/reset | Aktif | Modal + halaman forgot/reset |
| Admin `/admin` Pengprov | Aktif | Beranda, Cabang, Dojo, Anggota, Verifikasi, Kegiatan, Broadcast, Profil |
| Redirect legacy `/dashboard` | Aktif | 308 → `/admin` |
| Verifikasi registrasi anggota | Aktif | Approve/reject via Inkai API |
| Verifikasi klaim (mutasi/prestasi) | Aktif | `/admin/verifikasi` |
| Broadcast Provinsi | Aktif | Target role opsional |
| Export CSV anggota | Aktif | Client-side dari hasil filter |
| RBAC scope dojo / cabang / provinsi | Diterapkan | Backend + portal |
| Backend stats scope cabang | Diperbaiki | `branchWhere` + `pendingVerifications` di `dashboardController` |
| Filter anggota `branchId` | Aktif | Backend + UI |
| Domain `inkai-admin.vercel.app` | Belum | 404 di Vercel; CORS sudah diizinkan di backend |
| Matriks RBAC di UI Pengaturan | Belum | Permission tipis di kode |
| Kelola akun ADMIN_BRANCH | Belum | Fase lanjut |
| CRUD Pengurus Provinsi admin | Belum | Publik masih statis |
| Duplikasi `app/portal` vs `(portal)` | Utang teknis | Bersihkan saat aman |

---

## 12. Indikator yang bisa dilaporkan (arah KPI Pengprov)

1. Jumlah **cabang** & **dojo** aktif se-Jatim  
2. Anggota aktif / pending / ditolak (rollup & per cabang)  
3. Antrian verifikasi & aging  
4. (Nanti) ringkasan iuran & UKT lintas cabang — read-only  
5. Kelengkapan data pengurus Provinsi  

---

## 13. Perbandingan singkat dengan `inkai-sby`

| | **inkai-jatim** | **inkai-sby** |
|--|-----------------|---------------|
| Tingkat org | Pengprov Jawa Timur | Cabang Surabaya |
| Admin URL | `/admin` (4 halaman) | `/admin` (~20 modul ops) |
| Fokus | Portal + oversight scoped | Operasional harian cabang/ranting |
| Anggota self-service | Belum | `/dashboard` lengkap |
| Clone 1:1? | **Tidak** | Referensi alur & RBAC saja |

---

## 14. Kesimpulan

INKAI Jatim sudah punya **portal Pengprov** yang selaras inkai-backend: branding Jawa Timur, hierarki Pusat→Provinsi→Cabang→Dojo, auth, dan admin di `/admin` untuk oversight multi-cabang (ringkasan, cabang, dojo, anggota, verifikasi klaim, kegiatan, broadcast).

Yang paling matang hari ini:

- Identitas publik Pengprov  
- Login/registrasi berjenjang wilayah  
- Admin Pengprov scoped + verifikasi registrasi & klaim  
- Broadcast & oversight kegiatan via Inkai API  
- URL admin selaras ekosistem (`/admin`)  

Prioritas pengembangan lanjutan:

1. Deploy/alias domain `inkai-admin` bila diperlukan (saat ini 404) + pastikan backend production ter-deploy dengan patch stats/filter  
2. Stabilkan konten publik (berita/agenda/DB)  
3. Kelola akun cabang di bawah Pengprov  
4. Admin pengurus Provinsi + oversight iuran/UKT read-only  
5. (Opsional) bersihkan utang teknis folder `app/portal`

---

## 15. Riwayat penyusunan dokumen

| Tanggal | Keterangan |
|---------|------------|
| 18 Juli 2026 | Inventaris awal `inkai-jatim`: posisi Pengprov, publik, admin `/admin` (ex-`/dashboard`), RBAC, API, celah vs `inkai-sby`, rule agent |
| 18 Juli 2026 | Paket komplit Pengprov: Cabang, Dojo filter, Anggota search/export, Verifikasi klaim, Kegiatan, Broadcast; proxy API ke inkai-backend; patch backend stats scope + filter `branchId` + CORS `inkai-admin` |
| 18 Juli 2026 | Samakan sidebar & modul admin dengan `inkai-sby` (Keanggotaan/Keuangan/Kegiatan/Konten/Sistem + pengaturan hub); halaman iuran/ukt/absensi/store/pesan/carousel/notifikasi/audit |

---

*Dokumen ini living inventaris organisasi (bukan laporan sekali-jadi) dan dapat dilampirkan pada presentasi pengurus Provinsi / Cabang.*
