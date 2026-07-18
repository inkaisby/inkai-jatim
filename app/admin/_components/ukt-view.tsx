"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboardData } from "./dashboard-data-context";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";
import { ExportCsvButton } from "./export-csv-button";

type EventRow = {
  id: string;
  title?: string;
  name?: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  status?: string | null;
  type?: string | null;
  category?: string | null;
  branchId?: string | null;
  registrations?: Array<{
    id: string;
    status?: string;
    member?: { fullName?: string; nia?: string | null; currentRank?: string | null };
  }>;
};

function isUkt(event: EventRow) {
  const hay = `${event.title ?? ""} ${event.name ?? ""} ${event.type ?? ""} ${event.category ?? ""}`.toUpperCase();
  return hay.includes("UKT") || hay.includes("UJIAN") || hay.includes("KENAIKAN");
}

function semesterBounds(semester: "I" | "II", year: number) {
  if (semester === "I") {
    return {
      startDate: new Date(year, 0, 1).toISOString(),
      endDate: new Date(year, 5, 30).toISOString(),
      registrationCloseAt: new Date(year, 5, 15).toISOString(),
    };
  }
  return {
    startDate: new Date(year, 6, 1).toISOString(),
    endDate: new Date(year, 11, 31).toISOString(),
    registrationCloseAt: new Date(year, 11, 15).toISOString(),
  };
}

export function UktView() {
  const context = useDashboardData();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const year = new Date().getFullYear();
  const [semester, setSemester] = useState<"I" | "II">(new Date().getMonth() < 6 ? "I" : "II");
  const [branchId, setBranchId] = useState(context.branches[0]?.id ?? "");
  const [memberId, setMemberId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/events");
      const json = (await res.json()) as { data?: EventRow[]; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal memuat UKT.");
        setEvents([]);
        return;
      }
      setEvents(Array.isArray(json.data) ? json.data : []);
    } catch {
      setMessage("Gagal memuat UKT.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!branchId && context.branches[0]?.id) setBranchId(context.branches[0].id);
  }, [branchId, context.branches]);

  const uktEvents = useMemo(() => events.filter(isUkt), [events]);

  async function openDetail(id: string) {
    setSelectedId(id);
    const res = await fetch(`/api/admin/events/${id}`);
    const json = (await res.json()) as { data?: EventRow; error?: string };
    if (!res.ok) {
      setMessage(json.error ?? "Gagal memuat detail.");
      return;
    }
    setDetail(json.data ?? null);
  }

  async function createPeriod() {
    if (!branchId) {
      setMessage("Pilih cabang untuk periode UKT.");
      return;
    }
    const bounds = semesterBounds(semester, year);
    const title = `UKT Semester ${semester}-${year}`;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: `Ujian Kenaikan Tingkat Semester ${semester} ${year} — Pengprov Jawa Timur`,
          ...bounds,
          branchId,
          location: "Jawa Timur",
          categories: [{ name: "Pendaftaran UKT", fee: 0 }],
        }),
      });
      const json = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal membuat periode.");
        return;
      }
      setMessage(json.message ?? `Periode ${title} dibuat.`);
      await load();
    } catch {
      setMessage("Gagal membuat periode.");
    } finally {
      setLoading(false);
    }
  }

  async function registerMember() {
    if (!selectedId || !memberId) return;
    const res = await fetch("/api/admin/events/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: selectedId, memberId }),
    });
    const json = (await res.json()) as { error?: string; data?: { id?: string } };
    if (!res.ok) {
      setMessage(json.error ?? "Gagal mendaftarkan.");
      return;
    }
    if (json.data?.id) {
      await fetch(`/api/admin/events/register/${json.data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
    }
    setMessage("Anggota didaftarkan ke UKT.");
    await openDetail(selectedId);
  }

  const csvRows = (detail?.registrations ?? []).map((r) => [
    r.member?.fullName ?? "",
    r.member?.nia ?? "",
    r.member?.currentRank ?? "",
    r.status ?? "",
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Keuangan & UKT"
        title="UKT"
        description="Buat periode UKT per semester, daftar peserta, dan pantau status registrasi (Inkai events)."
        onRefresh={() => void load()}
        refreshing={loading}
      />

      <div className="glass-card flex flex-col gap-3 p-4 md:flex-row md:items-end">
        <label className="text-xs">
          Semester
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value as "I" | "II")}
            className="mt-1 block rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
          >
            <option value="I">Semester I</option>
            <option value="II">Semester II</option>
          </select>
        </label>
        <label className="text-xs">
          Cabang
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="mt-1 block min-w-[200px] rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
          >
            {context.branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => void createPeriod()} className="btn-outline text-xs">
          Buat periode {year}
        </button>
      </div>

      {message && <AdminMessage text={message} />}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Periode UKT</h2>
          {loading && uktEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : uktEvents.length === 0 ? (
            <AdminEmptyState message="Belum ada periode UKT. Buat periode baru di atas." />
          ) : (
            uktEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => void openDetail(event.id)}
                className={`glass-card w-full p-4 text-left transition-colors hover:border-accent/30 ${
                  selectedId === event.id ? "border-accent/40" : ""
                }`}
              >
                <h3 className="font-semibold">{event.title || event.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[
                    event.location,
                    event.startDate ? new Date(event.startDate).toLocaleDateString("id-ID") : null,
                    event.status,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </button>
            ))
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Peserta</h2>
            {detail && (
              <ExportCsvButton
                filename={`ukt-${detail.id}.csv`}
                headers={["Nama", "NIA", "Sabuk", "Status"]}
                rows={csvRows}
              />
            )}
          </div>
          {!detail ? (
            <AdminEmptyState message="Pilih periode untuk melihat peserta." />
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="Member ID untuk daftar"
                  className="flex-1 rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
                />
                <button type="button" onClick={() => void registerMember()} className="btn-outline text-xs">
                  Daftarkan
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Tip: salin ID anggota dari halaman Kelola Anggota (atau gunakan API anggota).
              </p>
              {(detail.registrations ?? []).length === 0 ? (
                <AdminEmptyState message="Belum ada peserta terdaftar." />
              ) : (
                <div className="space-y-2">
                  {(detail.registrations ?? []).map((r) => (
                    <article key={r.id} className="rounded-xl border border-border/70 px-4 py-3">
                      <p className="text-sm font-semibold">{r.member?.fullName ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.member?.nia || "—"} · {r.member?.currentRank || "—"} · {r.status}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
