"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashboardData } from "./dashboard-data-context";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";

type EventItem = {
  id: string;
  title?: string;
  name?: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  status?: string | null;
};

export function KegiatanView() {
  const context = useDashboardData();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [branchId, setBranchId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/events");
      const json = (await res.json()) as { data?: EventItem[]; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal memuat kegiatan.");
        setEvents([]);
        return;
      }
      setEvents(Array.isArray(json.data) ? json.data : []);
    } catch {
      setMessage("Gagal memuat kegiatan.");
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

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !branchId || !startDate || !endDate) {
      setMessage("Judul, cabang, dan tanggal wajib.");
      return;
    }
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        branchId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        registrationCloseAt: new Date(startDate).toISOString(),
        categories: [{ name: "Umum", fee: 0 }],
      }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(json.error ?? "Gagal membuat event.");
      return;
    }
    setTitle("");
    setDescription("");
    setLocation("");
    setMessage("Event dibuat.");
    await load();
  }

  async function closeEvent(id: string) {
    const res = await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CLOSED" }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(json.error ?? "Gagal menutup event.");
      return;
    }
    await load();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Kegiatan & Absensi"
        title="Event & Kegiatan"
        description="Buat dan kelola kegiatan non-UKT tingkat Provinsi/Cabang."
        onRefresh={() => void load()}
        refreshing={loading}
      />

      <form onSubmit={createEvent} className="glass-card grid gap-3 p-5 md:grid-cols-2">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul kegiatan"
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm md:col-span-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi"
          rows={2}
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm md:col-span-2"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Lokasi"
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
        />
        <select
          required
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
        >
          {context.branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <input
          required
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
        />
        <input
          required
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
        />
        <button type="submit" className="btn-outline text-xs md:col-span-2">
          Buat kegiatan
        </button>
      </form>

      {message && <AdminMessage text={message} />}

      {loading && events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Memuat kegiatan...</p>
      ) : events.length === 0 ? (
        <AdminEmptyState message="Belum ada kegiatan." />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <article key={event.id} className="glass-card flex items-start justify-between gap-4 p-5">
              <div>
                <h2 className="text-base font-semibold">{event.title || event.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {event.description || "Tanpa deskripsi"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {[
                    event.location,
                    event.startDate ? new Date(event.startDate).toLocaleDateString("id-ID") : null,
                    event.status,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void closeEvent(event.id)}
                className="rounded-lg border border-border/70 px-3 py-1.5 text-xs font-semibold"
              >
                Tutup
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
