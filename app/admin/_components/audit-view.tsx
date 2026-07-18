"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";

type AuditRow = {
  id: string;
  action?: string;
  details?: string | null;
  createdAt?: string;
  user?: { email?: string; fullName?: string };
};

export function AuditView() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const qs = q.trim() ? `?search=${encodeURIComponent(q.trim())}` : "";
      const res = await fetch(`/api/admin/audit${qs}`);
      const json = (await res.json()) as { data?: AuditRow[]; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal memuat audit.");
        setRows([]);
        return;
      }
      setRows(Array.isArray(json.data) ? json.data : []);
    } catch {
      setMessage("Gagal memuat audit.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  function exportCsv() {
    const header = ["Waktu", "Aksi", "User", "Detail"];
    const lines = rows.map((r) => [
      r.createdAt ? new Date(r.createdAt).toISOString() : "",
      r.action ?? "",
      r.user?.email ?? r.user?.fullName ?? "",
      r.details ?? "",
    ]);
    const csv = [header, ...lines]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-jatim-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Sistem"
        title="Log Audit"
        description="Riwayat aksi administratif sensitif (Inkai API /v1/audit-logs)."
        onRefresh={() => void load()}
        refreshing={loading}
        actions={
          <button type="button" onClick={exportCsv} className="btn-ghost text-xs">
            Export CSV
          </button>
        }
      />

      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari aksi / detail..."
          className="max-w-md flex-1 rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
        />
        <button type="button" onClick={() => void load()} className="btn-outline text-xs">
          Cari
        </button>
      </div>

      {message && <AdminMessage text={message} />}
      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat audit...</p>
      ) : rows.length === 0 ? (
        <AdminEmptyState message="Belum ada log audit." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Aksi</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString("id-ID") : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold">{r.action}</td>
                  <td className="px-4 py-3 text-xs">{r.user?.email ?? r.user?.fullName ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.details ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
