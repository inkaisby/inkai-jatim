"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDashboardData } from "./dashboard-data-context";
import { HierarchyBanner } from "./hierarchy-banner";
import { MapPin, Search, Building2, Users, ArrowRight } from "lucide-react";

export function CabangView() {
  const context = useDashboardData();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return context.branches;
    return context.branches.filter((b) => b.name.toLowerCase().includes(q));
  }, [context.branches, query]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Organisasi Provinsi
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Daftar Cabang</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pantau seluruh Pengcab se-Jawa Timur: jumlah dojo dan anggota per kota/kabupaten.
        </p>
      </section>

      <HierarchyBanner hierarchy={context.hierarchy} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama cabang..."
            className="w-full rounded-xl border border-border/70 bg-background/70 py-2.5 pl-10 pr-3 text-sm outline-none ring-accent/30 focus:ring-2"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {filtered.length} dari {context.branches.length} cabang
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-2">
        {filtered.length === 0 ? (
          <p className="col-span-full rounded-xl border border-dashed border-border/80 px-4 py-10 text-center text-sm text-muted-foreground">
            Tidak ada cabang yang cocok.
          </p>
        ) : (
          filtered.map((branch) => (
            <article
              key={branch.id}
              className="glass-card flex flex-col gap-4 p-5 transition-colors hover:border-accent/25"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex rounded-xl bg-accent/10 p-2.5 text-accent">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold">{branch.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Pengcab · Jawa Timur</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-border/60 bg-background/50 px-3 py-2">
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" /> Dojo
                  </p>
                  <p className="mt-1 text-lg font-bold">{branch.dojoCount}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/50 px-3 py-2">
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" /> Anggota
                  </p>
                  <p className="mt-1 text-lg font-bold">{branch.memberCount}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/organisasi?cabang=${encodeURIComponent(branch.id)}`}
                  className="btn-outline inline-flex flex-1 items-center justify-center gap-1 text-xs"
                >
                  Lihat Dojo
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/admin/anggota?cabang=${encodeURIComponent(branch.id)}`}
                  className="btn-ghost inline-flex flex-1 items-center justify-center gap-1 text-xs"
                >
                  Anggota
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
