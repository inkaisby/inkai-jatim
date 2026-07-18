"use client";

import { AdminPageHeader } from "./admin-ui";

const MATRIX = [
  { area: "Profil & akun sendiri", anggota: "Edit", ranting: "—", cabang: "—", pengprov: "—" },
  { area: "Verifikasi calon anggota", anggota: "—", ranting: "Ya", cabang: "Ya", pengprov: "Ya" },
  { area: "Assign NIA / edit Kyu", anggota: "Lihat", ranting: "Terbatas", cabang: "Ya", pengprov: "Lihat" },
  { area: "Iuran (tulis)", anggota: "Bayar", ranting: "Ya", cabang: "Ya", pengprov: "Lihat" },
  { area: "UKT operasional", anggota: "Daftar", ranting: "Daftarkan", cabang: "Kelola", pengprov: "Lihat" },
  { area: "Nonaktif anggota", anggota: "—", ranting: "Scope dojo", cabang: "Scope cabang", pengprov: "Lihat" },
];

export function PeranView() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Sistem"
        title="Role & Hak Akses"
        description="Matriks wilayah INKAI (selaras dokumentasi inkai-sby) untuk konteks Pengprov Jawa Timur."
      />
      <div className="overflow-x-auto rounded-2xl border border-border/70">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Anggota</th>
              <th className="px-4 py-3">Ranting</th>
              <th className="px-4 py-3">Cabang</th>
              <th className="px-4 py-3">Pengprov</th>
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((row) => (
              <tr key={row.area} className="border-t border-border/60">
                <td className="px-4 py-3 font-medium">{row.area}</td>
                <td className="px-4 py-3 text-xs">{row.anggota}</td>
                <td className="px-4 py-3 text-xs">{row.ranting}</td>
                <td className="px-4 py-3 text-xs">{row.cabang}</td>
                <td className="px-4 py-3 text-xs">{row.pengprov}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
