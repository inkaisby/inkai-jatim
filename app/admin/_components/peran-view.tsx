"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";

type RoleRow = {
  id: string;
  name: string;
  permissions?: Array<{ permission?: { id: string; name?: string; slug?: string } }>;
  _count?: { users?: number };
};

type Permission = { id: string; name?: string; slug?: string };

export function PeranView() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch("/api/admin/roles"),
        fetch("/api/admin/roles/permissions"),
      ]);
      const rolesJson = (await rolesRes.json()) as { data?: RoleRow[]; error?: string };
      const permsJson = (await permsRes.json()) as { data?: Permission[]; error?: string };
      if (!rolesRes.ok) {
        setMessage(rolesJson.error ?? "Gagal memuat roles (butuh ADMIN).");
        setRoles([]);
      } else {
        setRoles(Array.isArray(rolesJson.data) ? rolesJson.data : []);
      }
      if (permsRes.ok) setPermissions(Array.isArray(permsJson.data) ? permsJson.data : []);
    } catch {
      setMessage("Gagal memuat roles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function selectRole(role: RoleRow) {
    setSelectedRole(role.id);
    const ids = new Set(
      (role.permissions ?? [])
        .map((p) => p.permission?.id)
        .filter(Boolean) as string[],
    );
    setSelectedPerms(ids);
  }

  function togglePerm(id: string) {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save() {
    if (!selectedRole) return;
    const res = await fetch("/api/admin/roles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roleId: selectedRole,
        permissionIds: [...selectedPerms],
      }),
    });
    const json = (await res.json()) as { error?: string; message?: string };
    if (!res.ok) {
      setMessage(json.error ?? "Gagal menyimpan (biasanya hanya ADMINISTRATOR).");
      return;
    }
    setMessage(json.message ?? "Hak akses diperbarui.");
    await load();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Sistem"
        title="Role & Hak Akses"
        description="Edit permission role via Inkai API `/v1/roles` (biasanya terbatas ADMINISTRATOR)."
        onRefresh={() => void load()}
        refreshing={loading}
      />
      {message && <AdminMessage text={message} />}

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat...</p>
      ) : roles.length === 0 ? (
        <AdminEmptyState message="Tidak ada data role / akses ditolak." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => selectRole(role)}
                className={`glass-card w-full p-4 text-left ${
                  selectedRole === role.id ? "border-accent/40" : ""
                }`}
              >
                <p className="font-semibold">{role.name}</p>
                <p className="text-xs text-muted-foreground">
                  {role._count?.users ?? 0} user · {(role.permissions ?? []).length} permission
                </p>
              </button>
            ))}
          </div>
          <div className="glass-card space-y-3 p-4">
            {!selectedRole ? (
              <p className="text-sm text-muted-foreground">Pilih role untuk mengedit permission.</p>
            ) : (
              <>
                <div className="max-h-80 space-y-1 overflow-y-auto">
                  {permissions.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedPerms.has(p.id)}
                        onChange={() => togglePerm(p.id)}
                      />
                      <span>{p.slug || p.name || p.id}</span>
                    </label>
                  ))}
                </div>
                <button type="button" onClick={() => void save()} className="btn-outline w-full text-xs">
                  Simpan permission
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
