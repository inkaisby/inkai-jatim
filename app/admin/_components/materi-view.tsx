"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";

type MateriItem = {
  id: string;
  title: string;
  url: string;
  published: boolean;
};

const SETTINGS_KEY = "digital-materials-jatim";

export function MateriView() {
  const [items, setItems] = useState<MateriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/settings?prefix=${encodeURIComponent(SETTINGS_KEY)}`);
      const json = (await res.json()) as {
        data?: Array<{ key: string; value: unknown }>;
        error?: string;
      };
      if (!res.ok) {
        // 404/empty ok
        setItems([]);
        return;
      }
      const row = (json.data ?? []).find((r) => r.key === SETTINGS_KEY);
      const value = row?.value as { items?: MateriItem[] } | MateriItem[] | undefined;
      if (Array.isArray(value)) setItems(value);
      else if (value && Array.isArray(value.items)) setItems(value.items);
      else setItems([]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(next: MateriItem[]) {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: SETTINGS_KEY, value: { items: next } }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(json.error ?? "Gagal menyimpan materi.");
      return;
    }
    setItems(next);
    setMessage("Materi disimpan.");
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    const next = [
      ...items,
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        url: url.trim(),
        published: true,
      },
    ];
    setTitle("");
    setUrl("");
    await save(next);
  }

  async function togglePublish(id: string) {
    await save(
      items.map((i) => (i.id === id ? { ...i, published: !i.published } : i)),
    );
  }

  async function removeItem(id: string) {
    await save(items.filter((i) => i.id !== id));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Konten & Layanan"
        title="Materi Digital"
        description="Katalog materi digital Provinsi (disimpan via Inkai settings key digital-materials-jatim)."
        onRefresh={() => void load()}
        refreshing={loading}
      />
      {message && <AdminMessage text={message} />}

      <form onSubmit={addItem} className="glass-card grid gap-3 p-5 md:grid-cols-3">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul materi"
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
        />
        <input
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL file / link"
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
        />
        <button type="submit" className="btn-outline text-xs">
          Tambah & publish
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat...</p>
      ) : items.length === 0 ? (
        <AdminEmptyState message="Belum ada materi. Tambahkan link file di atas." />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className="glass-card flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.title}</p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-xs text-accent hover:underline"
                >
                  {item.url}
                </a>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {item.published ? "Published" : "Draft"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void togglePublish(item.id)}
                  className="rounded-lg border border-border/70 px-2 py-1 text-[11px] font-semibold"
                >
                  {item.published ? "Draft" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => void removeItem(item.id)}
                  className="rounded-lg border border-border/70 px-2 py-1 text-[11px] font-semibold"
                >
                  Hapus
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
