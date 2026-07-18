"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";

type Notif = {
  id: string;
  title?: string;
  content?: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
};

export function NotifikasiView() {
  const [rows, setRows] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/notifications");
      const json = (await res.json()) as { data?: Notif[]; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal memuat notifikasi.");
        setRows([]);
        return;
      }
      setRows(Array.isArray(json.data) ? json.data : []);
    } catch {
      setMessage("Gagal memuat notifikasi.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markAllRead() {
    await fetch("/api/admin/notifications", { method: "PATCH" });
    await load();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Konten & Layanan"
        title="Notifikasi"
        description="Kotak masuk notifikasi akun admin."
        onRefresh={() => void load()}
        refreshing={loading}
        actions={
          <button type="button" onClick={() => void markAllRead()} className="btn-ghost text-xs">
            Tandai semua dibaca
          </button>
        }
      />
      {message && <AdminMessage text={message} />}
      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat notifikasi...</p>
      ) : rows.length === 0 ? (
        <AdminEmptyState message="Tidak ada notifikasi." />
      ) : (
        <div className="space-y-2">
          {rows.map((n) => (
            <article
              key={n.id}
              className={`glass-card p-4 ${n.isRead ? "opacity-70" : "border-accent/30"}`}
            >
              <h2 className="text-sm font-semibold">{n.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{n.content}</p>
              <p className="mt-2 text-[10px] text-muted-foreground">
                {n.createdAt ? new Date(n.createdAt).toLocaleString("id-ID") : "—"}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
