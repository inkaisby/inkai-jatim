"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboardData } from "./dashboard-data-context";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";
import { ExportCsvButton } from "./export-csv-button";

type AttendanceRow = {
  id: string;
  date?: string;
  status?: string;
  checkInAt?: string | null;
  memberId?: string;
  member?: { id?: string; fullName?: string; nia?: string | null };
  dojo?: { name?: string };
};

export function AbsensiView() {
  const context = useDashboardData();
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [members, setMembers] = useState<Array<{ id: string; fullName: string; dojoName?: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [view, setView] = useState<"harian" | "belum" | "rekap">("harian");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dojoFilter, setDojoFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [attRes, memRes] = await Promise.all([
        fetch(`/api/admin/attendance?date=${date}&limit=500`),
        fetch("/api/members?status=Active&limit=500"),
      ]);
      const attJson = (await attRes.json()) as { data?: AttendanceRow[]; error?: string };
      const memJson = (await memRes.json()) as {
        data?: Array<{ id: string; fullName: string; dojoName?: string | null; dojoId?: string }>;
      };
      if (!attRes.ok) {
        setMessage(attJson.error ?? "Gagal memuat absensi.");
        setRows([]);
      } else {
        setRows(Array.isArray(attJson.data) ? attJson.data : []);
      }
      setMembers(
        (memJson.data ?? []).map((m) => ({
          id: m.id,
          fullName: m.fullName,
          dojoName: m.dojoName,
        })),
      );
    } catch {
      setMessage("Gagal memuat absensi.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    if (dojoFilter === "all") return rows;
    return rows.filter((r) => r.dojo?.name && context.allDojos.find((d) => d.id === dojoFilter)?.name === r.dojo?.name);
  }, [rows, dojoFilter, context.allDojos]);

  const presentIds = useMemo(() => {
    return new Set(
      filteredRows
        .map((r) => r.memberId || r.member?.id)
        .filter(Boolean) as string[],
    );
  }, [filteredRows]);

  const belumHadir = useMemo(() => {
    return members.filter((m) => !presentIds.has(m.id));
  }, [members, presentIds]);

  const rekap = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const r of rows) {
      const id = r.memberId || r.member?.id || "";
      const name = r.member?.fullName || "—";
      if (!id) continue;
      const cur = map.get(id) ?? { name, count: 0 };
      cur.count += 1;
      map.set(id, cur);
    }
    const sessionTotal = 48;
    return [...map.entries()].map(([id, v]) => ({
      id,
      name: v.name,
      count: v.count,
      pct: Math.round((v.count / sessionTotal) * 100),
    }));
  }, [rows]);

  const csvRows =
    view === "belum"
      ? belumHadir.map((m) => [m.fullName, m.dojoName ?? ""])
      : view === "rekap"
        ? rekap.map((r) => [r.name, r.count, `${r.pct}%`])
        : filteredRows.map((r) => [
            r.member?.fullName ?? "",
            r.member?.nia ?? "",
            r.dojo?.name ?? "",
            r.checkInAt || r.date || "",
            r.status ?? "HADIR",
          ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Kegiatan & Absensi"
        title="Absensi"
        description="Harian, daftar belum hadir, dan rekap kehadiran semester (asumsi 48 sesi)."
        onRefresh={() => void load()}
        refreshing={loading}
        actions={
          <ExportCsvButton
            filename={`absensi-${view}-${date}.csv`}
            headers={
              view === "belum"
                ? ["Nama", "Dojo"]
                : view === "rekap"
                  ? ["Nama", "Hadir", "%"]
                  : ["Nama", "NIA", "Dojo", "Waktu", "Status"]
            }
            rows={csvRows}
          />
        }
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "harian" as const, label: "Harian" },
            { id: "belum" as const, label: "Belum hadir" },
            { id: "rekap" as const, label: "Rekap semester %" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              view === item.id
                ? "bg-accent text-accent-foreground"
                : "border border-border/70 text-muted-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs"
        />
        <select
          value={dojoFilter}
          onChange={(e) => setDojoFilter(e.target.value)}
          className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs"
        >
          <option value="all">Semua dojo</option>
          {context.allDojos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {message && <AdminMessage text={message} />}

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat absensi...</p>
      ) : view === "belum" ? (
        belumHadir.length === 0 ? (
          <AdminEmptyState message="Semua anggota aktif sudah absen / tidak ada data." />
        ) : (
          <div className="space-y-2">
            {belumHadir.map((m) => (
              <div key={m.id} className="rounded-xl border border-border/70 px-4 py-3 text-sm">
                <p className="font-medium">{m.fullName}</p>
                <p className="text-xs text-muted-foreground">{m.dojoName ?? "—"}</p>
              </div>
            ))}
          </div>
        )
      ) : view === "rekap" ? (
        rekap.length === 0 ? (
          <AdminEmptyState message="Belum ada data untuk rekap." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/70">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">Hadir</th>
                  <th className="px-4 py-3 text-left">%</th>
                </tr>
              </thead>
              <tbody>
                {rekap.map((r) => (
                  <tr key={r.id} className="border-t border-border/60">
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3">{r.count}</td>
                    <td className="px-4 py-3">{r.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : filteredRows.length === 0 ? (
        <AdminEmptyState message="Belum ada log absensi pada tanggal ini." />
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
              {filteredRows.map((row) => (
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
