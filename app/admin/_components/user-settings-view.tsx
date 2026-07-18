"use client";

import { AdminEmptyState, AdminPageHeader } from "./admin-ui";
import { useDashboardData } from "./dashboard-data-context";

export function UserSettingsView() {
  const { user, roleLabel } = useDashboardData();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Sistem"
        title="Pengaturan User"
        description="Kelola akun admin dalam cakupan Provinsi. CRUD multi-akun cabang menyusul endpoint wilayah-accounts."
      />
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold">Akun aktif</h2>
        <p className="mt-2 text-sm">{user.fullName ?? user.email}</p>
        <p className="text-xs text-muted-foreground">{user.email} · {roleLabel}</p>
      </div>
      <AdminEmptyState message="Daftar multi-user per cabang/ranting akan terhubung ke API pengaturan wilayah Inkai." />
    </div>
  );
}
