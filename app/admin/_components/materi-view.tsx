"use client";

import { AdminEmptyState, AdminPageHeader } from "./admin-ui";

export function MateriView() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Konten & Layanan"
        title="Materi Digital"
        description="Katalog materi digital untuk anggota (selaras menu inkai-sby). Penyimpanan file mengikuti endpoint konten Inkai API bila tersedia."
      />
      <AdminEmptyState message="Modul materi digital siap di menu. Unggah/katalog penuh menyusul saat endpoint materi Provinsi aktif di inkai-backend." />
    </div>
  );
}
