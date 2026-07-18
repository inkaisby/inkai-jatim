"use client";

import { AdminPageHeader } from "./admin-ui";

export function KebijakanView() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        eyebrow="Sistem"
        title="Profil & Kebijakan"
        description="Identitas organisasi Pengprov Jawa Timur untuk portal publik dan operasional."
      />
      <div className="glass-card space-y-3 p-5 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Nama organisasi</p>
          <p className="font-semibold">INKAI Pengprov Jawa Timur</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Wilayah</p>
          <p className="font-semibold">JAWA TIMUR</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Portal</p>
          <p className="font-semibold">https://inkai-jatim.vercel.app</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Form edit kebijakan/kontak bank akan terhubung ke `/v1/settings` bila kunci Provinsi sudah
          distandarkan di backend.
        </p>
      </div>
    </div>
  );
}
