"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";

type AttendanceRow = {
  id: string;
  date?: string;
  status?: string;
  checkInAt?: string | null;
  member?: { fullName?: string; nia?: string | null };
  dojo?: { name?: string };
};

export function AbsensiView() {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/attendance?limit=100");
      const json = (await res.json()) as { data?: AttendanceRow[]; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal memuat absensi.");
        setRows([]);
        return;
      }
      setRows(Array.isArray(json.data) ? json.data : []);
    } catch {
      setMessage("Gagal memuat absensi.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Kegiatan & Absensi"
        title="Absensi"
        description="Rekap kehadiran latihan anggota pada cakupan wilayah Anda."
        onRefresh={() => void load()}
        refreshing={loading}
      />
      {message && <AdminMessage text={message} />}
      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat absensi...</p>
      ) : rows.length === 0 ? (
        <AdminEmptyState message="Belum ada log absensi." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Anggota</th>
                <th className="px-4 py-3">Dojo</th>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.member?.fullName ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{row.member?.nia || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{row.dojo?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    {row.checkInAt || row.date
                      ? new Date(String(row.checkInAt || row.date)).toLocaleString("id-ID")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">{row.status ?? "HADIR"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
