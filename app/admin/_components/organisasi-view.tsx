"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDashboardData } from "./dashboard-data-context";
import { HierarchyBanner } from "./hierarchy-banner";
import { Building2, Search, Users } from "lucide-react";

export function OrganisasiView() {
  const context = useDashboardData();
  const searchParams = useSearchParams();
  const initialCabang = searchParams.get("cabang") ?? "all";
  const [branchFilter, setBranchFilter] = useState(initialCabang);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return context.allDojos.filter((dojo) => {
      if (branchFilter !== "all" && dojo.branchId !== branchFilter) return false;
      if (!q) return true;
      return (
        dojo.name.toLowerCase().includes(q) ||
        (dojo.branchName ?? "").toLowerCase().includes(q) ||
        (dojo.address ?? "").toLowerCase().includes(q)
      );
    });
  }, [context.allDojos, branchFilter, query]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dojo / Ranting</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Monitoring seluruh dojo se-Jawa Timur dengan filter per cabang.
        </p>
      </section>

      <HierarchyBanner hierarchy={context.hierarchy} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama dojo / cabang / alamat..."
            className="w-full rounded-xl border border-border/70 bg-background/70 py-2.5 pl-10 pr-3 text-sm outline-none ring-accent/30 focus:ring-2"
          />
        </div>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2.5 text-sm outline-none ring-accent/30 focus:ring-2"
        >
          <option value="all">Semua Cabang</option>
          {context.branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {filtered.length} dojo
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-2">
        {filtered.length === 0 ? (
          <p className="col-span-full rounded-xl border border-dashed border-border/80 px-4 py-10 text-center text-sm text-muted-foreground">
            Tidak ada dojo/ranting ditemukan.
          </p>
        ) : (
          filtered.map((dojo) => (
            <div
              key={dojo.id}
              className="rounded-2xl border border-border/70 bg-background/50 p-4 transition-colors hover:border-accent/25"
            >
              <div className="mb-2 inline-flex rounded-lg bg-accent/10 p-2 text-accent">
                <Building2 className="h-4 w-4" />
              </div>
              <p className="font-semibold">{dojo.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {dojo.branchName ?? "Cabang belum terhubung"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {dojo.address ?? "Alamat belum diisi"}
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Users className="h-3.5 w-3.5 text-accent" />
                {dojo.memberCount ?? 0} anggota
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
