"use client";

import { useDashboardData } from "./dashboard-data-context";
import { HierarchyBanner } from "./hierarchy-banner";
import { Building2 } from "lucide-react";

export function OrganisasiView() {
  const context = useDashboardData();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Organisasi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Struktur organisasi INKAI pada cakupan akun Anda.
        </p>
      </section>

      <HierarchyBanner hierarchy={context.hierarchy} />

      <section className="glass-card p-5">
        <h2 className="mb-4 text-base font-semibold">Daftar Dojo/Ranting</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {context.allDojos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada dojo/ranting ditemukan.</p>
          ) : (
            context.allDojos.map((dojo) => (
              <div
                key={dojo.id}
                className="rounded-2xl border border-border/70 bg-background/50 p-4"
              >
                <div className="mb-2 inline-flex rounded-lg bg-accent/10 p-2 text-accent">
                  <Building2 className="h-4 w-4" />
                </div>
                <p className="font-semibold">{dojo.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dojo.address ?? "Alamat belum diisi"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
