"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";
import { ExportCsvButton } from "./export-csv-button";
import { billingStatusLabel } from "@/lib/admin-labels";

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
  const [amountDraft, setAmountDraft] = useState<Record<string, string>>({});
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [genAmount, setGenAmount] = useState("50000");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/billing?limit=200");
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

  async function patchBilling(id: string, body: Record<string, unknown>) {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/billing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Aksi gagal.");
        return;
      }
      setMessage(json.message ?? "Berhasil.");
      await load();
    } catch {
      setMessage("Aksi gagal.");
    } finally {
      setActingId(null);
    }
  }

  async function generate(dryRun: boolean) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/billing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          month,
          amount: Number(genAmount) || 50000,
          dryRun,
        }),
      });
      const json = (await res.json()) as { error?: string; message?: string };
      setMessage(json.message ?? json.error ?? "Selesai.");
      if (!dryRun) await load();
    } catch {
      setMessage("Generate gagal.");
    } finally {
      setLoading(false);
    }
  }

  const csvRows = rows.map((r) => [
    r.member?.fullName ?? "",
    r.member?.nia ?? "",
    r.type ?? "",
    r.amount ?? "",
    r.status ?? "",
    r.description ?? "",
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Keuangan & UKT"
        title="Iuran Anggota"
        description="Generate tagihan bulanan, edit nominal, verifikasi bukti, dan tandai lunas se-Jawa Timur."
        onRefresh={() => void load()}
        refreshing={loading}
        actions={
          <ExportCsvButton
            filename={`iuran-jatim-${new Date().toISOString().slice(0, 10)}.csv`}
            headers={["Anggota", "NIA", "Jenis", "Nominal", "Status", "Keterangan"]}
            rows={csvRows}
          />
        }
      />

      <div className="glass-card flex flex-col gap-3 p-4 md:flex-row md:items-end">
        <label className="text-xs">
          Tahun
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="mt-1 block w-full rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs">
          Bulan
          <input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="mt-1 block w-full rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs">
          Nominal
          <input
            type="number"
            value={genAmount}
            onChange={(e) => setGenAmount(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
          />
        </label>
        <button type="button" onClick={() => void generate(true)} className="btn-ghost text-xs">
          Dry-run
        </button>
        <button type="button" onClick={() => void generate(false)} className="btn-outline text-xs">
          Buat tagihan bulan
        </button>
      </div>

      {message && <AdminMessage text={message} />}
      {loading && rows.length === 0 ? (
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
                <tr key={row.id} className="border-t border-border/60 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.member?.fullName ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{row.member?.nia || "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{row.description}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{row.type ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <span>
                        {typeof row.amount === "number"
                          ? row.amount.toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            })
                          : "—"}
                      </span>
                      {row.status !== "PAID" && (
                        <div className="flex gap-1">
                          <input
                            value={amountDraft[row.id] ?? ""}
                            onChange={(e) =>
                              setAmountDraft((p) => ({ ...p, [row.id]: e.target.value }))
                            }
                            placeholder="Edit"
                            type="number"
                            className="w-24 rounded border border-border/60 px-1.5 py-0.5 text-[10px]"
                          />
                          <button
                            type="button"
                            disabled={actingId === row.id}
                            onClick={() =>
                              void patchBilling(row.id, {
                                action: "update",
                                amount: Number(amountDraft[row.id]),
                              })
                            }
                            className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold"
                          >
                            Simpan
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold">
                      {billingStatusLabel(row.status ?? "")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.status === "WAITING_VERIFICATION" || row.status === "PENDING" ? (
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          disabled={actingId === row.id}
                          onClick={() => void patchBilling(row.id, { action: "mark_paid" })}
                          className="rounded-lg bg-emerald-600/90 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                        >
                          Lunas
                        </button>
                        <button
                          type="button"
                          disabled={actingId === row.id}
                          onClick={() => void patchBilling(row.id, { action: "approve" })}
                          className="rounded-lg border border-border/70 px-2 py-1 text-[11px] font-semibold disabled:opacity-50"
                        >
                          Setujui bukti
                        </button>
                        <button
                          type="button"
                          disabled={actingId === row.id}
                          onClick={() => void patchBilling(row.id, { action: "reject" })}
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
