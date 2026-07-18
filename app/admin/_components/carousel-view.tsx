"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";

type CarouselItem = {
  id: string;
  title?: string;
  imageUrl?: string;
  linkUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

export function CarouselView() {
  const [rows, setRows] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/carousel");
      const json = (await res.json()) as { data?: CarouselItem[]; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal memuat carousel.");
        setRows([]);
        return;
      }
      setRows(Array.isArray(json.data) ? json.data : []);
    } catch {
      setMessage("Gagal memuat carousel.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/carousel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        isActive: true,
        sortOrder: rows.length + 1,
      }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(json.error ?? "Gagal menambah item.");
      return;
    }
    setTitle("");
    setImageUrl("");
    setMessage("Item carousel ditambahkan.");
    await load();
  }

  async function removeItem(id: string) {
    const res = await fetch(`/api/admin/carousel/${id}`, { method: "DELETE" });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(json.error ?? "Gagal menghapus.");
      return;
    }
    await load();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Konten & Layanan"
        title="Carousel Beranda"
        description="Kelola slide beranda portal publik Jawa Timur."
        onRefresh={() => void load()}
        refreshing={loading}
      />
      {message && <AdminMessage text={message} />}

      <form onSubmit={createItem} className="glass-card grid gap-3 p-5 md:grid-cols-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Judul slide"
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
        />
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
          placeholder="URL gambar"
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
        />
        <button type="submit" className="btn-outline text-xs">
          Tambah Slide
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat carousel...</p>
      ) : rows.length === 0 ? (
        <AdminEmptyState message="Belum ada slide carousel." />
      ) : (
        <div className="space-y-3">
          {rows.map((item) => (
            <article key={item.id} className="glass-card flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <h2 className="truncate font-semibold">{item.title || "Slide"}</h2>
                <p className="truncate text-xs text-muted-foreground">{item.imageUrl}</p>
              </div>
              <button
                type="button"
                onClick={() => void removeItem(item.id)}
                className="rounded-lg border border-border/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Hapus
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
