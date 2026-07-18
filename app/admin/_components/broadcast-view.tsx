"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";

const TARGET_ROLES = [
  { id: "", label: "Semua pengguna dalam cakupan" },
  { id: "ADMIN_BRANCH", label: "Admin Cabang (Pengcab)" },
  { id: "ADMIN_DOJO", label: "Admin Dojo / Ranting" },
  { id: "MEMBER", label: "Anggota" },
];

export function BroadcastView() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage({ type: "err", text: "Judul dan isi pesan wajib diisi." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          type: "INFO",
          targetRole: targetRole || undefined,
        }),
      });
      const json = (await res.json()) as { error?: string; message?: string; count?: number };
      if (!res.ok) {
        setMessage({ type: "err", text: json.error ?? "Gagal mengirim broadcast." });
        return;
      }
      setMessage({
        type: "ok",
        text: json.message ?? `Broadcast terkirim ke ${json.count ?? 0} penerima.`,
      });
      setTitle("");
      setContent("");
    } catch {
      setMessage({ type: "err", text: "Gagal mengirim broadcast." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Komunikasi Provinsi
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Broadcast</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kirim pengumuman Pengprov ke cabang, dojo, atau anggota se-Jawa Timur melalui Inkai API
          (`/v1/notifications/broadcast`).
        </p>
      </section>

      <form onSubmit={handleSubmit} className="glass-card space-y-4 p-5">
        <div className="inline-flex rounded-xl bg-accent/10 p-2 text-accent">
          <Megaphone className="h-4 w-4" />
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Judul
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-border/70 bg-background/70 px-3 py-2.5 text-sm outline-none ring-accent/30 focus:ring-2"
            placeholder="Masukkan judul informasi..."
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Isi pesan
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-border/70 bg-background/70 px-3 py-2.5 text-sm outline-none ring-accent/30 focus:ring-2"
            placeholder="Tulis pesan pengprov..."
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Target
          </span>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full rounded-xl border border-border/70 bg-background/70 px-3 py-2.5 text-sm outline-none ring-accent/30 focus:ring-2"
          >
            {TARGET_ROLES.map((role) => (
              <option key={role.id || "all"} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
        </label>

        {message && (
          <p
            className={`rounded-xl px-4 py-3 text-sm ${
              message.type === "ok"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
            }`}
          >
            {message.text}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-outline w-full disabled:opacity-50">
          {loading ? "Mengirim..." : "Publikasikan sekarang"}
        </button>
      </form>
    </div>
  );
}
