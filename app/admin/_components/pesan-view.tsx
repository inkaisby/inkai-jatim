"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";
import { BroadcastView } from "./broadcast-view";

type Conversation = {
  id: string;
  title?: string | null;
  updatedAt?: string;
  participants?: Array<{ fullName?: string; email?: string }>;
};

export function PesanView() {
  const [tab, setTab] = useState<"inbox" | "broadcast">("inbox");
  const [rows, setRows] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/pesan");
      const json = (await res.json()) as { data?: Conversation[]; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal memuat pesan.");
        setRows([]);
        return;
      }
      setRows(Array.isArray(json.data) ? json.data : []);
    } catch {
      setMessage("Gagal memuat pesan.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "inbox") void load();
  }, [load, tab]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Konten & Layanan"
        title="Pesan"
        description="Inbox percakapan pengurus dan broadcast notifikasi Provinsi."
        onRefresh={tab === "inbox" ? () => void load() : undefined}
        refreshing={loading}
      />

      <div className="flex gap-2">
        {[
          { id: "inbox" as const, label: "Inbox" },
          { id: "broadcast" as const, label: "Broadcast" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              tab === item.id
                ? "bg-accent text-accent-foreground"
                : "border border-border/70 text-muted-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
        <Link href="/admin/broadcast" className="ml-auto text-xs font-semibold text-accent hover:underline">
          Halaman broadcast penuh
        </Link>
      </div>

      {tab === "broadcast" ? (
        <BroadcastView embedded />
      ) : (
        <>
          {message && <AdminMessage text={message} />}
          {loading ? (
            <p className="text-sm text-muted-foreground">Memuat percakapan...</p>
          ) : rows.length === 0 ? (
            <AdminEmptyState message="Belum ada percakapan." />
          ) : (
            <div className="space-y-2">
              {rows.map((c) => (
                <article key={c.id} className="glass-card p-4">
                  <h2 className="text-sm font-semibold">{c.title || "Percakapan"}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.updatedAt ? new Date(c.updatedAt).toLocaleString("id-ID") : "—"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
