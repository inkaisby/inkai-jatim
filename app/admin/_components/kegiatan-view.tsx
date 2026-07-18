"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, RefreshCw } from "lucide-react";

type EventItem = {
  id: string;
  title?: string;
  name?: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  status?: string | null;
  type?: string | null;
};

export function KegiatanView() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

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
      setEvents(json.data ?? []);
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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Kegiatan Provinsi
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Kegiatan & Event</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Daftar kegiatan dari Inkai API (`/v1/events`) untuk oversight Pengprov.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Muat ulang
        </button>
      </section>

      {message && (
        <p className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm">{message}</p>
      )}

      <section className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat kegiatan...</p>
        ) : events.length === 0 ? (
          <div className="glass-card flex flex-col items-center gap-3 px-4 py-12 text-center">
            <CalendarDays className="h-8 w-8 text-accent/70" />
            <p className="text-sm text-muted-foreground">Belum ada kegiatan yang ditampilkan.</p>
          </div>
        ) : (
          events.map((event) => {
            const title = event.title || event.name || "Kegiatan";
            return (
              <article key={event.id} className="glass-card p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex rounded-xl bg-accent/10 p-2 text-accent">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold">{title}</h2>
                    {event.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {[
                        event.location,
                        event.startDate
                          ? new Date(event.startDate).toLocaleDateString("id-ID")
                          : null,
                        event.type,
                        event.status,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
