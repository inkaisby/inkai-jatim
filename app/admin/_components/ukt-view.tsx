"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";

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
};

function isUkt(event: EventRow) {
  const hay = `${event.title ?? ""} ${event.name ?? ""} ${event.type ?? ""} ${event.category ?? ""}`.toUpperCase();
  return hay.includes("UKT") || hay.includes("UJIAN") || hay.includes("KENAIKAN");
}

export function UktView() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

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

  const uktEvents = useMemo(() => events.filter(isUkt), [events]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Keuangan & UKT"
        title="UKT"
        description="Oversight periode Ujian Kenaikan Tingkat se-Jawa Timur (event bertema UKT dari Inkai API)."
        onRefresh={() => void load()}
        refreshing={loading}
      />
      {message && <AdminMessage text={message} />}
      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat periode UKT...</p>
      ) : uktEvents.length === 0 ? (
        <AdminEmptyState message="Belum ada periode UKT yang terdeteksi pada daftar event." />
      ) : (
        <div className="space-y-3">
          {uktEvents.map((event) => (
            <article key={event.id} className="glass-card p-5">
              <h2 className="text-base font-semibold">{event.title || event.name || "UKT"}</h2>
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
