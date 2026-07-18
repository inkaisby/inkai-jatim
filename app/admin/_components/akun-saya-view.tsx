"use client";

import { useDashboardData } from "./dashboard-data-context";
import { AdminPageHeader } from "./admin-ui";
import { getPrimaryRoleLabel } from "@/lib/dashboard/labels";

export function AkunSayaView() {
  const { user, roleLabel, hierarchy, profileStatus, memberStatus } = useDashboardData();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        eyebrow="Sistem"
        title="Akun Saya"
        description="Profil akun admin yang sedang login."
      />
      <div className="glass-card space-y-4 p-5">
        <div>
          <p className="text-xs text-muted-foreground">Nama</p>
          <p className="font-semibold">{user.fullName ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="font-semibold">{user.email}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Role</p>
          <p className="font-semibold">{roleLabel || getPrimaryRoleLabel(user.roles)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="font-semibold">{profileStatus ?? memberStatus ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Hierarki</p>
          <p className="text-sm">{hierarchy.map((h) => h.name).join(" → ")}</p>
        </div>
      </div>
    </div>
  );
}
