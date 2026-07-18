"use client";

import { useDashboardData } from "./dashboard-data-context";
import { AdminEmptyState, AdminPageHeader } from "./admin-ui";

export function GeofencingView() {
  const { allDojos } = useDashboardData();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Sistem"
        title="Geofencing Absensi"
        description="Daftar dojo dalam cakupan untuk oversight lokasi absensi. Edit koordinat biasanya dilakukan di tingkat cabang/ranting."
      />
      {allDojos.length === 0 ? (
        <AdminEmptyState message="Belum ada dojo pada cakupan." />
      ) : (
        <div className="space-y-2">
          {allDojos.map((dojo) => (
            <article key={dojo.id} className="glass-card flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{dojo.name}</p>
                <p className="text-xs text-muted-foreground">
                  {dojo.branchName ?? "—"} · {dojo.address ?? "Alamat belum diisi"}
                </p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Koordinat via cabang
              </span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
