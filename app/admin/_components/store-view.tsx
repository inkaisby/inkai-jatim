"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminEmptyState, AdminMessage, AdminPageHeader } from "./admin-ui";

type Product = {
  id: string;
  name?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
  description?: string | null;
};

export function StoreView() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/store");
      const json = (await res.json()) as { data?: Product[]; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal memuat store.");
        setRows([]);
        return;
      }
      setRows(Array.isArray(json.data) ? json.data : []);
    } catch {
      setMessage("Gagal memuat store.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        isActive: true,
      }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(json.error ?? "Gagal menambah produk.");
      return;
    }
    setName("");
    setPrice("");
    setStock("0");
    setMessage("Produk ditambahkan.");
    await load();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Konten & Layanan"
        title="Store"
        description="Katalog produk resmi INKAI (Inkai API /v1/inventory)."
        onRefresh={() => void load()}
        refreshing={loading}
      />
      {message && <AdminMessage text={message} />}

      <form onSubmit={createProduct} className="glass-card grid gap-3 p-5 md:grid-cols-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Nama produk"
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          type="number"
          min={0}
          placeholder="Harga"
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
        />
        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          type="number"
          min={0}
          placeholder="Stok"
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
        />
        <button type="submit" className="btn-outline text-xs">
          Tambah Produk
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat produk...</p>
      ) : rows.length === 0 ? (
        <AdminEmptyState message="Belum ada produk." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <article key={p.id} className="glass-card p-4">
              <h2 className="font-semibold">{p.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {p.description || "Tanpa deskripsi"}
              </p>
              <p className="mt-3 text-sm font-medium">
                {typeof p.price === "number"
                  ? p.price.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Stok: {p.stock ?? 0}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
