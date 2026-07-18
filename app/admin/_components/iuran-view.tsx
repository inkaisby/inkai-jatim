"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";

type BillingRow = {
  id: string;
  amount?: number;
  status?: string;
  type?: string;
  dueDate?: string | null;
  description?: string | null;
  member?: { fullName?: string; nia?: string | null };
};

export function IuranView() {
  const [rows, setRows] = useState<BillingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/billing?limit=100");
      const json = (await res.json()) as { data?: BillingRow[]; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal memuat iuran.");
        setRows([]);
        return;
      }
      setRows(Array.isArray(json.data) ? json.data : []);
    } catch {
      setMessage("Gagal memuat iuran.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function verify(billingId: string, approved: boolean) {
    setActingId(billingId);
    try {
      const res = await fetch("/api/admin/billing/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingId, approved }),
      });
      const json = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Verifikasi gagal.");
        return;
      }
      setMessage(json.message ?? "Status iuran diperbarui.");
      await load();
    } catch {
      setMessage("Verifikasi gagal.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Keuangan & UKT"
        title="Iuran Anggota"
        description="Pantau dan verifikasi tagihan iuran anggota se-Jawa Timur (Inkai API /v1/billing)."
        onRefresh={() => void load()}
        refreshing={loading}
      />
      {message && <AdminMessage text={message} />}
      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat iuran...</p>
      ) : rows.length === 0 ? (
        <AdminEmptyState message="Belum ada data iuran pada cakupan Anda." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Anggota</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.member?.fullName ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{row.member?.nia || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{row.type ?? row.description ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    {typeof row.amount === "number"
                      ? row.amount.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.status === "WAITING_VERIFICATION" || row.status === "PENDING" ? (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          disabled={actingId === row.id}
                          onClick={() => void verify(row.id, true)}
                          className="rounded-lg bg-emerald-600/90 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                        >
                          Lunas
                        </button>
                        <button
                          type="button"
                          disabled={actingId === row.id}
                          onClick={() => void verify(row.id, false)}
                          className="rounded-lg bg-rose-600/90 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
